import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createHmac } from "https://deno.land/std@0.168.0/node/crypto.ts"

const BAZIK_WEBHOOK_SECRET = Deno.env.get('BAZIK_WEBHOOK_SECRET') || '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

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
    // Si le secret commence par whsec_, extraire la partie après
    const secretKey = secret.startsWith('whsec_') ? secret.substring(6) : secret;
    
    // Bazik.io utilise généralement HMAC SHA256
    const hmac = createHmac('sha256', secretKey);
    hmac.update(payload);
    const expectedSignature = hmac.digest('hex');
    
    // Extraire la signature du header si elle est au format whsec_xxx
    const receivedSig = signature.startsWith('whsec_') 
      ? signature.substring(6) 
      : signature.replace('sha256=', '');
    
    // Comparaison sécurisée des signatures
    return receivedSig === expectedSignature;
  } catch (error) {
    console.error('Error verifying signature:', error);
    return false;
  }
}

serve(async (req) => {
  try {
    // Vérifier la méthode
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ success: false, message: 'Method not allowed' }),
        { status: 405, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Récupérer le payload (important : utiliser text() pour la vérification de signature)
    const payload = await req.text();
    
    // Récupérer la signature du header
    // Bazik.io peut utiliser différents noms de header selon leur implémentation
    const signature = req.headers.get('x-bazik-signature') || 
                     req.headers.get('bazik-signature') ||
                     req.headers.get('x-signature') ||
                     req.headers.get('signature') ||
                     req.headers.get('x-webhook-signature') ||
                     '';

    // Vérifier la signature du webhook
    if (BAZIK_WEBHOOK_SECRET && !verifyWebhookSignature(payload, signature, BAZIK_WEBHOOK_SECRET)) {
      console.error('Invalid webhook signature');
      return new Response(
        JSON.stringify({ success: false, message: 'Invalid signature' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Parser le payload
    const event = JSON.parse(payload);

    // Vérifier que c'est un événement de paiement
    const transactionId = event.transaction_id || 
                         event.reference || 
                         event.order_id ||
                         event.id;

    if (!transactionId) {
      return new Response(
        JSON.stringify({ success: false, message: 'Missing transaction_id in webhook' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Déterminer le statut du paiement
    const paymentStatus = event.status || 
                         event.payment_status || 
                         event.state ||
                         event.payment?.status ||
                         event.payment?.state;
    
    const isCompleted = paymentStatus === 'paid' || 
                       paymentStatus === 'success' || 
                       paymentStatus === 'completed' ||
                       paymentStatus === 'successful' ||
                       event.paid === true ||
                       event.success === true ||
                       event.completed === true ||
                       event.payment?.paid === true ||
                       event.payment?.success === true ||
                       event.type === 'payment.completed' ||
                       event.type === 'payment.success';
    
    console.log('Webhook payment status check:', {
      transaction_id,
      paymentStatus,
      isCompleted,
      event_type: event.type,
      event_keys: Object.keys(event)
    });

    // Mettre à jour l'inscription si le paiement est confirmé
    if (isCompleted && SUPABASE_URL && SUPABASE_SERVICE_KEY) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
      
      console.log(`Webhook: Updating inscription ${transactionId} to Confirmed status`);
      
      const { data, error } = await supabase
        .from('inscriptions')
        .update({ statut: 'Confirmé' })
        .eq('transaction_id', transactionId)
        .select();

      if (error) {
        console.error('Webhook: Error updating inscription:', error);
        return new Response(
          JSON.stringify({ success: false, message: 'Failed to update inscription', error: error.message }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }

      if (data && data.length > 0) {
        console.log(`Webhook: Inscription ${transactionId} confirmed successfully. Updated ${data.length} row(s)`);
      } else {
        console.warn(`Webhook: No inscription found with transaction_id ${transactionId}`);
      }
    } else {
      if (!isCompleted) {
        console.log(`Webhook: Payment not completed for transaction ${transactionId}. Status: ${paymentStatus}`);
      }
      if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
        console.error('Webhook: Missing SUPABASE_URL or SUPABASE_SERVICE_KEY');
      }
    }

    // Retourner une réponse de succès à Bazik.io
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Webhook processed',
        transaction_id: transactionId,
        status: paymentStatus
      }),
      { 
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
        }
      }
    );

  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: error instanceof Error ? error.message : 'Error processing webhook' 
      }),
      { 
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
        }
      }
    );
  }
});

