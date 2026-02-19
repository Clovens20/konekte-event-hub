import { useState } from 'react';
import { Loader2, CheckCircle, XCircle, Lock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

// 👇 Remplace ce lien quand tu as le bon URL final
const COURSE_URL = 'https://konekte-group.systeme.io/school/course/aprannai/lecture/8826253';

type Status = 'idle' | 'loading' | 'success' | 'error';

export default function AccesFormation() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [nomComplet, setNomComplet] = useState('');

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setErrorMessage('Tanpri antre yon imèl valid.');
      setStatus('error');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      const { data, error } = await supabase
        .from('inscriptions')
        .select('id, nom_complet, email, statut')
        .eq('email', trimmedEmail)
        .eq('statut', 'Confirmé')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Supabase error:', error);
        setErrorMessage('Erè sèvè. Tanpri eseye ankò.');
        setStatus('error');
        return;
      }

      if (!data) {
        setErrorMessage(
          'Imèl sa a pa gen enskripsyon konfime. Verifye imèl ou a oubyen kontakte nou.'
        );
        setStatus('error');
        return;
      }

      // ✅ Email trouvé et confirmé → redirection automatique
      setNomComplet(data.nom_complet || '');
      setStatus('success');

      setTimeout(() => {
        window.location.href = COURSE_URL;
      }, 2000);

    } catch (err) {
      console.error(err);
      setErrorMessage('Erè enkoni. Tanpri eseye ankò.');
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Aksè Fòmasyon</h1>
          <p className="text-muted-foreground text-sm">
            Antre imèl ou te itilize pou enskripsyon w pou jwenn aksè.
          </p>
        </div>

        {/* Card */}
        <div className="bg-card rounded-3xl shadow-xl p-8">

          {/* Formulaire (idle ou error) */}
          {(status === 'idle' || status === 'error') && (
            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Imèl ou *
                </label>
                <input
                  type="email"
                  className={`input-styled ${status === 'error' ? 'border-destructive' : ''}`}
                  placeholder="imelw@egzamp.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (status === 'error') setStatus('idle');
                  }}
                  autoFocus
                />
                {status === 'error' && errorMessage && (
                  <div className="flex items-start gap-2 mt-2 text-destructive text-sm">
                    <XCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={!email.trim()}
                className="btn-primary w-full py-3"
              >
                Verifye ak Antre
              </button>

              <p className="text-center text-xs text-muted-foreground pt-2">
                Ou pa gen aksè?{' '}
                <a href="/" className="text-primary underline hover:opacity-80">
                  Retounen sou paj prensipal la
                </a>
              </p>
            </form>
          )}

          {/* Chargement */}
          {status === 'loading' && (
            <div className="text-center py-8">
              <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Ap verifye imèl ou...</p>
            </div>
          )}

          {/* Succès → redirection */}
          {status === 'success' && (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Aksè Konfime! ✅</h2>
              <p className="text-muted-foreground mb-6">
                Byenveni <strong>{nomComplet}</strong>! Ou pral redirijé nan fòmasyon an automatikman...
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Redirection nan 2 segond...</span>
              </div>
              <a
                href={COURSE_URL}
                className="btn-primary inline-block px-6 py-3"
              >
                Klike isi si pa redirijé
              </a>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
