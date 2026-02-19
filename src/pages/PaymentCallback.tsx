import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { verifyBazikPayment } from '@/lib/bazik-utils';
import { logError } from '@/lib/error-handler';

const PaymentCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<'loading' | 'success' | 'success_partial' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const processCallback = async () => {
      try {
        const transactionId = searchParams.get('transactionId') ||
          searchParams.get('transaction_id') ||
          searchParams.get('orderId') ||
          sessionStorage.getItem('pending_transaction');

        if (!transactionId) {
          setStatus('error');
          setMessage('Tranzaksyon pa jwenn');
          return;
        }

        const verificationResult = await verifyBazikPayment(transactionId);

        if (verificationResult.success && verificationResult.payment_status === 'COMPLETED') {
          queryClient.invalidateQueries({ queryKey: ['inscription-count'] });
          queryClient.invalidateQueries({ queryKey: ['inscriptions-admin'] });
          sessionStorage.removeItem('pending_transaction');

          if (verificationResult.full_access) {
            setStatus('success');
            setMessage('Peman konfime ! Enskripsyon w valide.');
            toast({
              title: '🎉 Peman reyisi !',
              description: 'Ou ka kounye a jwenn aksè nan fòmasyon an.',
            });
          } else {
            setStatus('success_partial');
            setMessage('');
            toast({
              title: 'Peman inisyal konfime',
              description: 'Nou voye yon imèl ak lyen pou konplete peman an.',
              variant: 'default',
            });
          }
        } else {
          setStatus('error');
          setMessage(verificationResult.message || 'Peman an poko konfime pa labank. Tanpri tann kèk moman.');
          toast({
            title: 'Peman ap tann',
            description: 'Peman w ap trete. W ap resevwa yon notifikasyon lè l konfime.',
            variant: 'default',
          });
          setTimeout(() => navigate('/'), 5000);
        }
      } catch (error) {
        logError(error, 'PaymentCallback');
        setStatus('error');
        setMessage('Erè lè w ap verifye peman an.');
        toast({
          title: 'Erè',
          description: 'Yon erè rive. Enskripsyon w ap tann.',
          variant: 'destructive',
        });
      }
    };

    processCallback();
  }, [searchParams, navigate, toast, queryClient]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="bg-card rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="w-16 h-16 animate-spin text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Ap verifye peman...</h2>
            <p className="text-muted-foreground">Tanpri tann</p>
          </>
        )}

        {/* Paiement 100% : même principe que code promo → bouton Jwenn Aksè */}
        {status === 'success' && (
          <>
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2 text-green-600">Enskripsyon Konfime! 🎉</h2>
            <p className="text-muted-foreground mb-6">{message}</p>
            <p className="text-muted-foreground mb-6">
              Klike sou bouton an pou jwenn aksè nan fòmasyon an.
            </p>
            <button
              onClick={() => navigate('/acces-formation')}
              className="btn-primary w-full mb-4 py-4"
            >
              🚀 Jwenn Aksè Fòmasyon An
            </button>
            <button
              onClick={() => navigate('/')}
              className="text-sm text-muted-foreground underline hover:text-foreground transition-colors"
            >
              Tounen sou akèy la
            </button>
          </>
        )}

        {/* Paiement 25% ou 50% : pas d'accès tout de suite */}
        {status === 'success_partial' && (
          <>
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2 text-green-600">Peman inisyal konfime</h2>
            <p className="text-muted-foreground mb-6">
              Ou peye premye pati a. Pou jwenn <strong>aksè konplè</strong> nan fòmasyon an, ou bezwen konplete peman an.
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              Nou voye yon imèl ak lyen pou peye montan ki rete. Gade imèl w (oubyen kat spam).
            </p>
            <button
              onClick={() => navigate('/')}
              className="btn-primary w-full py-3"
            >
              Tounen sou akèy la
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2 text-red-600">Peman pa konfime</h2>
            <p className="text-muted-foreground mb-4">{message}</p>
            <button onClick={() => navigate('/')} className="btn-primary">
              Tounen sou akèy la
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentCallback;

