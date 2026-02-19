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
    console.log('Payment verification response:', JSON.stringify(paymentData));

    // Analyser le statut du paiement avec une vérification STRICTE
    // Ne confirmer que si le paiement est RÉELLEMENT complété avec des preuves tangibles
    const payment = paymentData.payment || paymentData;
    const message = payment.message || paymentData.message || '';
    const status = payment.status || paymentData.status || '';
    const state = payment.state || paymentData.state || '';
    
    // Vérifier la présence d'indicateurs de paiement réellement complété
    // Un paiement complété doit avoir au moins :
    // 1. Un statut explicite de succès
    // 2. ET une preuve de transaction (code transaction, référence bancaire, etc.)
    // 3. ET un montant confirmé (si disponible)
    const hasTransactionCode = !!(payment.transactionCode || 
                                 payment.transaction_code || 
                                 payment.reference || 
                                 payment.bankReference ||
                                 payment.paymentReference ||
                                 payment.moncash_transaction_id);
    
    const hasConfirmedAmount = !!(payment.amount || payment.amountPaid || payment.paidAmount);
    
    const statusText = (message || status || state || '').toLowerCase();
    
    // Vérification STRICTE : le statut doit être explicitement "successful", "paid", "completed"
    // ET il doit y avoir une preuve de transaction (code, référence, etc.)
    const isStatusCompleted = statusText === 'successful' || 
                             statusText === 'paid' ||
                             statusText === 'completed' ||
                             status === 'successful' ||
                             status === 'paid' ||
                             status === 'completed' ||
                             state === 'successful' ||
                             state === 'paid' ||
                             state === 'completed';
    
    // Un paiement est complété SEULEMENT si :
    // - Le statut indique un paiement complété
    // - ET il y a un code de transaction (preuve que le paiement a été effectué)
    // - OU si l'API retourne explicitement paid/success/completed = true
    const isCompleted = (isStatusCompleted && hasTransactionCode) ||
                       (payment.paid === true && hasTransactionCode) ||
                       (payment.success === true && hasTransactionCode) ||
                       (payment.completed === true && hasTransactionCode);
    
    console.log('Payment status check (STRICT):', {
      transaction_id,
      message,
      status,
      state,
      hasTransactionCode,
      hasConfirmedAmount,
      isStatusCompleted,
      isCompleted,
      payment_keys: Object.keys(payment),
      paymentData: JSON.stringify(paymentData).substring(0, 800)
    });

    let pourcentagePaye = null;
    let fullAccess = false;

    if (isCompleted && SUPABASE_URL && SUPABASE_SERVICE_KEY) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

      const { data: inscription, error: fetchErr } = await supabase
        .from('inscriptions')
        .select('id, pourcentage_paye, statut')
        .eq('transaction_id', transaction_id)
        .maybeSingle();

      if (!fetchErr && inscription) {
        pourcentagePaye = inscription.pourcentage_paye || null;
        fullAccess = pourcentagePaye === '100';
        if (fullAccess) {
          const { error: updateError } = await supabase
            .from('inscriptions')
            .update({ statut: 'Confirmé' })
            .eq('transaction_id', transaction_id);
          if (updateError) {
            console.error('Error updating inscription to Confirmed:', updateError);
          } else {
            console.log(`Inscription ${transaction_id} set to Confirmed (100% paid).`);
          }
        } else {
          console.log(`Inscription ${transaction_id} is partial payment (${pourcentagePaye}%). Access only after full payment.`);
        }
      } else {
        if (fetchErr) console.error('Error fetching inscription:', fetchErr);
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
        pourcentage_paye: pourcentagePaye,
        full_access: fullAccess,
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