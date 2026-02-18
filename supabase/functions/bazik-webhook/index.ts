import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createHmac } from "https://deno.land/std@0.168.0/node/crypto.ts"

const BAZIK_WEBHOOK_SECRET = Deno.env.get('BAZIK_WEBHOOK_SECRET') || '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-bazik-signature, bazik-signature, x-signature, signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

/**
 * Vérifie la signature du webhook Bazik.io
 * Format whsec_ similaire à Stripe
 */
function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  try {
    const secretKey = secret.startsWith('whsec_') ? secret.substring(6) : secret;
    const hmac = createHmac('sha256', secretKey);
    hmac.update(payload);
    const expectedSignature = hmac.digest('hex');
    const receivedSig = signature.startsWith('whsec_')
      ? signature.substring(6)
      : signature.replace('sha256=', '');
    return receivedSig === expectedSignature;
  } catch (error) {
    console.error('Error verifying signature:', error);
    return false;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ success: false, message: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const payload = await req.text();
    const signature = req.headers.get('x-bazik-signature') ||
                     req.headers.get('bazik-signature') ||
                     req.headers.get('x-signature') ||
                     req.headers.get('signature') ||
                     req.headers.get('x-webhook-signature') ||
                     '';

    if (BAZIK_WEBHOOK_SECRET && !verifyWebhookSignature(payload, signature, BAZIK_WEBHOOK_SECRET)) {
      console.error('Invalid webhook signature');
      return new Response(
        JSON.stringify({ success: false, message: 'Invalid signature' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const event = JSON.parse(payload);

    const transactionId = event.transaction_id ||
                         event.reference ||
                         event.order_id ||
                         event.id;

    if (!transactionId) {
      return new Response(
        JSON.stringify({ success: false, message: 'Missing transaction_id in webhook' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const paymentStatus = (event.status || event.payment_status || event.state || '').toString();
    const statusLower = paymentStatus.toLowerCase();

    const isCompleted =
      statusLower === 'paid' ||
      statusLower === 'success' ||
      statusLower === 'completed' ||
      statusLower === 'successful' ||
      event.paid === true ||
      event.type === 'payment.completed';

    if (isCompleted && SUPABASE_URL && SUPABASE_SERVICE_KEY) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

      const { error } = await supabase
        .from('inscriptions')
        .update({ statut: 'Confirmé' })
        .eq('transaction_id', transactionId);

      if (error) {
        console.error('Error updating inscription:', error);
        return new Response(
          JSON.stringify({ success: false, message: 'Failed to update inscription' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`Inscription ${transactionId} confirmed via webhook`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Webhook processed',
        transaction_id: transactionId,
        status: paymentStatus,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: error instanceof Error ? error.message : 'Error processing webhook',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
