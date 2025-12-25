import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const BAZIK_API_KEY = Deno.env.get('BAZIK_API_KEY') || '';
const BAZIK_USER_ID = Deno.env.get('BAZIK_USER_ID') || '';
const BAZIK_BASE_URL = Deno.env.get('BAZIK_BASE_URL') || 'https://api.bazik.io';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SERVICE_ROLE_KEY') || '';

// Headers CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

serve(async (req) => {
  // Gérer les requêtes preflight OPTIONS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    // Vérifier la méthode
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ success: false, message: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders,
          } 
        }
      );
    }

    const { transaction_id } = await req.json();

    if (!transaction_id) {
      return new Response(
        JSON.stringify({ success: false, message: 'Missing transaction_id' }),
        { 
          status: 400, 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders,
          } 
        }
      );
    }

    if (!BAZIK_API_KEY || !BAZIK_USER_ID) {
      return new Response(
        JSON.stringify({ success: false, message: 'Bazik.io credentials not configured (API key or User ID missing)' }),
        { 
          status: 500, 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders,
          } 
        }
      );
    }

    // Étape 1: Obtenir le token d'authentification selon la doc Bazik
    console.log('Getting Bazik.io auth token...');
    const tokenResponse = await fetch(`${BAZIK_BASE_URL}/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userID: BAZIK_USER_ID,
        secretKey: BAZIK_API_KEY,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Bazik.io token error:', errorText);
      throw new Error('Failed to authenticate with Bazik.io');
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token || tokenData.token;

    if (!accessToken) {
      throw new Error('No access token received from Bazik.io');
    }

    // Étape 2: Vérifier le statut de la transaction via l'endpoint correct
    // Utiliser /moncash/payments/{referenceId} selon les endpoints disponibles
    const verifyResponse = await fetch(`${BAZIK_BASE_URL}/moncash/payments/${transaction_id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!verifyResponse.ok) {
      // Si la transaction n'existe pas (404), elle est en attente
      if (verifyResponse.status === 404) {
        return new Response(
          JSON.stringify({
            success: true,
            payment_status: 'PENDING',
            transaction_id: transaction_id,
            message: 'Transaction en attente',
          }),
          { 
            status: 200,
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders,
            }
          }
        );
      }

      const errorText = await verifyResponse.text();
      console.error('Verification error:', {
        status: verifyResponse.status,
        error: errorText,
      });
      throw new Error('Failed to verify payment with Bazik.io');
    }

    const paymentData = await verifyResponse.json();
    console.log('Payment verification response:', paymentData);

    // Analyser le statut du paiement
    // Vérifier plusieurs formats possibles de réponse Bazik.io
    const message = paymentData.payment?.message || paymentData.message || '';
    const status = paymentData.payment?.status || paymentData.status || '';
    const state = paymentData.payment?.state || paymentData.state || '';
    
    // Détecter si le paiement est complété (plusieurs formats possibles)
    const isCompleted = 
      message.toLowerCase() === 'successful' || 
      message.toLowerCase() === 'paid' ||
      status === 'successful' ||
      status === 'paid' ||
      status === 'completed' ||
      state === 'successful' ||
      state === 'paid' ||
      state === 'completed' ||
      paymentData.paid === true ||
      paymentData.success === true ||
      paymentData.completed === true;
    
    console.log('Payment status check:', {
      transaction_id,
      message,
      status,
      state,
      isCompleted,
      paymentData: JSON.stringify(paymentData).substring(0, 500) // Limiter la taille du log
    });

    // Si le paiement est confirmé, mettre à jour la base de données
    if (isCompleted && SUPABASE_URL && SUPABASE_SERVICE_KEY) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
      
      console.log(`Updating inscription ${transaction_id} to Confirmed status`);
      
      const { data, error } = await supabase
        .from('inscriptions')
        .update({ statut: 'Confirmé' })
        .eq('transaction_id', transaction_id)
        .select();

      if (error) {
        console.error('Error updating inscription:', error);
        // Ne pas échouer la vérification si la mise à jour échoue
      } else {
        console.log(`Inscription ${transaction_id} updated successfully to Confirmed. Updated rows:`, data?.length || 0);
      }
    } else {
      if (!isCompleted) {
        console.log(`Payment not completed yet for transaction ${transaction_id}. Status:`, paymentData);
      }
      if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
        console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY for updating inscription');
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        payment_status: isCompleted ? 'COMPLETED' : 'PENDING',
        transaction_id: transaction_id,
        message: isCompleted ? 'Paiement confirmé' : 'Paiement en attente',
        payment_details: paymentData.payment || paymentData,
      }),
      { 
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders,
        }
      }
    );

  } catch (error) {
    console.error('Verify payment error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: error instanceof Error ? error.message : 'Erreur lors de la vérification du paiement' 
      }),
      { 
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders,
        }
      }
    );
  }
});