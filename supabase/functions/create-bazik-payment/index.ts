import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const BAZIK_API_KEY = Deno.env.get('BAZIK_API_KEY') || '';
const BAZIK_USER_ID = Deno.env.get('BAZIK_USER_ID') || '';
const BAZIK_BASE_URL = Deno.env.get('BAZIK_BASE_URL') || 'https://api.bazik.io';

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

    const body = await req.json().catch(() => ({}));
    const { amount, transaction_id, email, phone_number, description, first_name, last_name } = body;

    // Validation (amount can be 0 for 100% promo - client should not call this in that case)
    const hasAmount = amount !== undefined && amount !== null && amount !== '';
    const hasTransactionId = transaction_id !== undefined && transaction_id !== null && String(transaction_id).trim() !== '';
    const hasEmail = email !== undefined && email !== null && String(email).trim() !== '';
    if (!hasAmount || !hasTransactionId || !hasEmail) {
      return new Response(
        JSON.stringify({ success: false, message: 'Missing required fields: amount, transaction_id, and email' }),
        { 
          status: 400, 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders,
          } 
        }
      );
    }
    const amountNum = Number(amount);
    if (isNaN(amountNum) || amountNum < 0) {
      return new Response(
        JSON.stringify({ success: false, message: 'Le montant doit être un nombre positif.' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }
    if (amountNum === 0) {
      return new Response(
        JSON.stringify({ success: false, message: 'Montan 0 - pa bezwen peman. Enskripsyon dwe konfime dirèkteman.' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
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
      console.error('Bazik.io token error:', {
        status: tokenResponse.status,
        error: errorText,
        userID: BAZIK_USER_ID ? 'present' : 'missing',
        secretKey: BAZIK_API_KEY ? 'present' : 'missing',
      });
      
      return new Response(
        JSON.stringify({
          success: false,
          message: `Erreur d'authentification Bazik.io (${tokenResponse.status}): ${errorText}`,
          details: { error: errorText },
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }

    const tokenData = await tokenResponse.json();
    console.log('Token response received:', JSON.stringify(tokenData));
    
    const accessToken = tokenData.access_token || tokenData.token || tokenData.accessToken;

    if (!accessToken) {
      console.error('No access token found in response:', JSON.stringify(tokenData));
      return new Response(
        JSON.stringify({
          success: false,
          message: 'No access token received from Bazik.io',
          details: { tokenResponse: tokenData },
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }

    console.log('Token obtained successfully, token length:', accessToken.length);

    // Étape 2: Créer le paiement MonCash via Bazik
    // Selon la doc Bazik: /moncash/token avec gdes, userID, etc.
    const requestBody = {
      gdes: amountNum,
      userID: BAZIK_USER_ID,
      referenceId: transaction_id,
      description: description || 'Inscription séminaire',
      customerFirstName: first_name,
      customerLastName: last_name,
      customerEmail: email,
      successUrl: `${req.headers.get('origin') || ''}/payment-callback?status=success&transactionId=${transaction_id}`,
      errorUrl: `${req.headers.get('origin') || ''}/payment-callback?status=error&transactionId=${transaction_id}`,
    };

    console.log('Creating MonCash payment via Bazik:', {
      url: `${BAZIK_BASE_URL}/moncash/token`,
      body: requestBody,
      tokenPresent: !!accessToken,
    });

    const paymentResponse = await fetch(`${BAZIK_BASE_URL}/moncash/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!paymentResponse.ok) {
      const errorText = await paymentResponse.text();
      console.error('Bazik.io payment creation error:', {
        status: paymentResponse.status,
        statusText: paymentResponse.statusText,
        error: errorText,
      });
      
      return new Response(
        JSON.stringify({
          success: false,
          message: `Erreur API Bazik.io (${paymentResponse.status}): ${errorText || paymentResponse.statusText}`,
          details: {
            status: paymentResponse.status,
            error: errorText,
          },
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }

    const paymentData = await paymentResponse.json();
    console.log('Bazik.io payment response:', paymentData);

    // Selon la doc, la réponse contient l'URL de paiement
    const paymentUrl = paymentData.paymentUrl || 
                      paymentData.payment_url ||
                      paymentData.url ||
                      paymentData.redirectUrl ||
                      paymentData.redirect_url;
    
    if (!paymentUrl) {
      console.error('No payment URL in response:', paymentData);
      return new Response(
        JSON.stringify({
          success: false,
          message: 'No payment URL received from Bazik.io',
          details: { paymentResponse: paymentData },
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        payment_url: paymentUrl,
        transaction_id: transaction_id,
        order_id: paymentData.orderId,
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
    console.error('Bazik.io error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: error instanceof Error ? error.message : 'Erreur lors de la création du paiement' 
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