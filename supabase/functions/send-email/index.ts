import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!;
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'noreply@konektegroup.com';
const SYSTEME_IO_INVITE_URL = Deno.env.get('SYSTEME_IO_INVITE_URL') || ''; // URL invitation Systeme.io

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailPayload {
  type: 'formation_access' | 'remaining_payment';
  to: string;
  nomComplet: string;
  montantRestant?: number;
  pourcentagePaye?: string;
  lienPaiement?: string;
  transactionId?: string;
}

const emailFormationAccess = (nomComplet: string) => `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 40px 30px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 24px; }
    .header p { color: rgba(255,255,255,0.85); margin: 8px 0 0; }
    .body { padding: 40px 30px; }
    .body h2 { color: #1a1a2e; margin-top: 0; }
    .body p { color: #555; line-height: 1.7; }
    .btn { display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white !important; text-decoration: none; padding: 16px 36px; border-radius: 8px; font-weight: bold; font-size: 16px; margin: 20px 0; }
    .info-box { background: #f0f0ff; border-left: 4px solid #6366f1; padding: 16px 20px; border-radius: 0 8px 8px 0; margin: 20px 0; }
    .footer { background: #f9f9f9; padding: 20px 30px; text-align: center; color: #999; font-size: 12px; border-top: 1px solid #eee; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Felisitasyon ${nomComplet}!</h1>
      <p>Peman w konfime — Aksè fòmasyon an disponib</p>
    </div>
    <div class="body">
      <h2>Ou gen aksè konplè nan fòmasyon an!</h2>
      <p>Bonjou <strong>${nomComplet}</strong>,</p>
      <p>Peman w konfime avèk siksè. Ou ka kounye a jwenn aksè nan tout kontni fòmasyon <strong>"Devlope Aplikasyon Web ak AI"</strong> la.</p>
      <div class="info-box">
        <strong>📚 Kijan pou jwenn aksè:</strong><br><br>
        Klike sou bouton an anba a pou kreye kont ou sou platfòm fòmasyon an (Systeme.io). Ou pral resevwa yon imèl separé pou konfime adrès ou a.
      </div>
      <div style="text-align: center;">
        <a href="${SYSTEME_IO_INVITE_URL}" class="btn">🚀 Jwenn Aksè Fòmasyon An</a>
      </div>
      <p style="color: #999; font-size: 13px;">Si bouton an pa fonksyone, kopi lyen sa a nan navigatè w: <br><a href="${SYSTEME_IO_INVITE_URL}" style="color: #6366f1;">${SYSTEME_IO_INVITE_URL}</a></p>
    </div>
    <div class="footer">
      Konekte Group • Si ou gen kesyon, kontakte nou nan support@konektegroup.com
    </div>
  </div>
</body>
</html>
`;

const emailRemainingPayment = (nomComplet: string, montantRestant: number, pourcentagePaye: string, lienPaiement: string) => {
  const pourcentageRestant = 100 - parseInt(pourcentagePaye, 10);
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 40px 30px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 24px; }
    .header p { color: rgba(255,255,255,0.85); margin: 8px 0 0; }
    .body { padding: 40px 30px; }
    .body h2 { color: #1a1a2e; margin-top: 0; }
    .body p { color: #555; line-height: 1.7; }
    .btn { display: inline-block; background: linear-gradient(135deg, #10b981, #059669); color: white !important; text-decoration: none; padding: 16px 36px; border-radius: 8px; font-weight: bold; font-size: 16px; margin: 20px 0; }
    .amount-box { background: #f0fdf4; border: 2px solid #10b981; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0; }
    .amount-box .amount { font-size: 32px; font-weight: bold; color: #059669; }
    .amount-box .label { color: #666; font-size: 14px; }
    .info-box { background: #fffbeb; border-left: 4px solid #f59e0b; padding: 16px 20px; border-radius: 0 8px 8px 0; margin: 20px 0; }
    .footer { background: #f9f9f9; padding: 20px 30px; text-align: center; color: #999; font-size: 12px; border-top: 1px solid #eee; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ Enskripsyon Konfime!</h1>
      <p>Peman inisyal ou resevwa — Reste ${pourcentageRestant}% pou peye</p>
    </div>
    <div class="body">
      <h2>Bonjou ${nomComplet},</h2>
      <p>Nou konfime peman inisyal ou a (${pourcentagePaye}%). Pou jwenn <strong>aksè konplè</strong> nan fòmasyon an, ou bezwen konplete peman an.</p>
      <div class="amount-box">
        <div class="label">Montan ki rete pou peye</div>
        <div class="amount">${new Intl.NumberFormat('fr-HT').format(montantRestant)} HTG</div>
        <div class="label">(${pourcentageRestant}% ki rete)</div>
      </div>
      <div class="info-box">
        <strong>⚠️ Enpòtan:</strong> Lyen peman an valid pou <strong>7 jou</strong>. Apre sa, ou ka kontakte nou pou jwenn yon nouvo lyen.
      </div>
      <div style="text-align: center;">
        <a href="${lienPaiement}" class="btn">💳 Konplete Peman An</a>
      </div>
      <p style="color: #999; font-size: 13px;">Si bouton an pa fonksyone, kopi lyen sa a: <br><a href="${lienPaiement}" style="color: #6366f1;">${lienPaiement}</a></p>
      <p>Yon fwa ou fin peye tout montan an, ou pral resevwa otomatikman yon imèl ak aksè konplè nan fòmasyon an.</p>
    </div>
    <div class="footer">
      Konekte Group • Si ou gen kesyon, kontakte nou nan support@konektegroup.com
    </div>
  </div>
</body>
</html>
`;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const payload: EmailPayload = await req.json();
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY manke nan env.');
    }
    if (payload.type === 'formation_access' && !SYSTEME_IO_INVITE_URL) {
      console.warn('SYSTEME_IO_INVITE_URL pa defini — lyen aksè fòmasyon p ap gen URL.');
    }
    const { type, to, nomComplet, montantRestant, pourcentagePaye, lienPaiement } = payload;

    let subject: string;
    let html: string;

    if (type === 'formation_access') {
      subject = '🎉 Aksè Fòmasyon Ou — Konekte Group';
      html = emailFormationAccess(nomComplet);
    } else if (type === 'remaining_payment') {
      if (montantRestant == null || !pourcentagePaye || !lienPaiement) {
        throw new Error('remaining_payment mande: montantRestant, pourcentagePaye, lienPaiement');
      }
      subject = '✅ Enskripsyon Konfime — Konplete Peman Ou';
      html = emailRemainingPayment(nomComplet, montantRestant, pourcentagePaye, lienPaiement);
    } else {
      throw new Error('Type email pa rekonèt');
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [to],
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Resend error: ${err}`);
    }

    const data = await res.json();
    return new Response(JSON.stringify({ success: true, id: data.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('send-email error:', message);
    return new Response(JSON.stringify({ success: false, error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
