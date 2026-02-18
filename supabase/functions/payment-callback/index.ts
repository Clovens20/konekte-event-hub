import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const BAZIK_SECRET_KEY = Deno.env.get('BAZIK_SECRET_KEY') || Deno.env.get('BAZIK_API_KEY') || '';
const APP_URL = Deno.env.get('APP_URL') || 'https://konektegroup.com';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function sendEmail(payload: object) {
  const res = await supabase.functions.invoke('send-email', { body: payload });
  if (res.error) {
    console.error('Erreur envoi email:', res.error);
  }
  return res;
}

function getMontantTotal(inscription: Record<string, unknown>): number {
  const total = inscription.montant_total as number | undefined;
  if (total != null && total > 0) return total;
  const paye = (inscription.montant_paye as number) || 0;
  const pct = inscription.pourcentage_paye as string | undefined;
  if (pct === '100') return paye;
  if (pct === '50') return paye * 2;
  if (pct === '25') return paye * 4;
  return paye;
}

async function createRemainingPaymentLink(inscription: Record<string, unknown>): Promise<string | null> {
  try {
    const montantTotal = getMontantTotal(inscription);
    const montantPaye = (inscription.montant_paye as number) || 0;
    const montantRestant = montantTotal - montantPaye;
    const newTransactionId = `KONEKTE-RESTE-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    const bazikRes = await fetch('https://api.bazik.io/v1/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${BAZIK_SECRET_KEY}`,
      },
      body: JSON.stringify({
        amount: montantRestant,
        currency: 'HTG',
        transaction_id: newTransactionId,
        customer: {
          email: inscription.email,
          phone: inscription.telephone,
          first_name: (String(inscription.nom_complet).split(' ')[0] || ''),
          last_name: (String(inscription.nom_complet).split(' ').slice(1).join(' ') || String(inscription.nom_complet).split(' ')[0] || ''),
        },
        description: `Solde restant — ${inscription.nom_complet}`,
        callback_url: `${APP_URL}/payment-callback`,
        return_url: `${APP_URL}/payment-callback`,
        metadata: {
          inscription_id: inscription.id,
          type: 'remaining_payment',
          original_transaction_id: inscription.transaction_id,
        },
      }),
    });

    if (!bazikRes.ok) {
      console.error('Erreur Bazik création lien restant:', await bazikRes.text());
      return null;
    }

    const bazikData = await bazikRes.json();
    const paymentUrl = bazikData.payment_url || bazikData.paymentUrl || bazikData.url || null;

    await supabase
      .from('inscriptions')
      .update({ remaining_transaction_id: newTransactionId })
      .eq('id', inscription.id);

    return paymentUrl;
  } catch (err) {
    console.error('Erreur création lien restant:', err);
    return null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log('Webhook Bazik reçu:', JSON.stringify(body));

    const transaction_id = body.transaction_id ?? body.reference ?? body.order_id ?? body.id;
    const status = (body.status ?? body.payment_status ?? body.state ?? '').toString().toLowerCase();
    const amount = body.amount ?? body.payment?.amount ?? 0;

    if (!transaction_id) {
      return new Response(JSON.stringify({ error: 'transaction_id manquant' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: inscription, error: fetchError } = await supabase
      .from('inscriptions')
      .select('*')
      .or(`transaction_id.eq.${transaction_id},remaining_transaction_id.eq.${transaction_id}`)
      .maybeSingle();

    if (fetchError || !inscription) {
      console.error('Inscription non trouvée pour:', transaction_id, fetchError);
      return new Response(JSON.stringify({ error: 'Inscription introuvable' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const isPaiementRestant = inscription.remaining_transaction_id === transaction_id;
    const isSuccess = status === 'success' || status === 'completed' || status === 'paid' || status === 'successful';

    if (isSuccess) {
      if (isPaiementRestant) {
        const nouveauMontantPaye = (inscription.montant_paye || 0) + (Number(amount) || 0);
        await supabase
          .from('inscriptions')
          .update({
            statut: 'Confirmé',
            pourcentage_paye: '100',
            montant_paye: nouveauMontantPaye,
            montant_total: getMontantTotal(inscription),
          })
          .eq('id', inscription.id);

        await sendEmail({
          type: 'formation_access',
          to: inscription.email,
          nomComplet: inscription.nom_complet,
        });
        console.log(`✅ Solde payé + accès formation envoyé à ${inscription.email}`);
      } else {
        const montantTotal = getMontantTotal(inscription);
        const pct = String(inscription.pourcentage_paye || '100');
        const estComplet = pct === '100';

        await supabase
          .from('inscriptions')
          .update({
            statut: estComplet ? 'Confirmé' : 'En attente',
            montant_total: montantTotal,
          })
          .eq('id', inscription.id);

        if (estComplet) {
          await sendEmail({
            type: 'formation_access',
            to: inscription.email,
            nomComplet: inscription.nom_complet,
          });
          console.log(`✅ 100% payé + accès formation envoyé à ${inscription.email}`);
        } else {
          const montantRestant = montantTotal - (inscription.montant_paye || 0);
          const inscriptionWithTotal = { ...inscription, montant_total: montantTotal };
          const lienPaiement = await createRemainingPaymentLink(inscriptionWithTotal);

          await sendEmail({
            type: 'remaining_payment',
            to: inscription.email,
            nomComplet: inscription.nom_complet,
            montantRestant,
            pourcentagePaye: pct,
            lienPaiement: lienPaiement || `${APP_URL}/#inscription`,
          });
          console.log(`📧 Email paiement restant envoyé à ${inscription.email}`);
        }
      }
    } else if (status === 'failed' || status === 'cancelled' || status === 'canceled') {
      await supabase
        .from('inscriptions')
        .update({ statut: 'Annulé' })
        .eq('id', inscription.id);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Erreur webhook:', message);
    return new Response(JSON.stringify({ success: false, error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
