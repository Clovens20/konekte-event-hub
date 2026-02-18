import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
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
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const processCallback = async () => {
      try {
        // Récupérer les paramètres de Bazik.io
        const transactionId = searchParams.get('transactionId') || 
                             searchParams.get('transaction_id') ||
                             searchParams.get('orderId') ||
                             sessionStorage.getItem('pending_transaction');
        
        const paymentStatus = searchParams.get('status') || 
                             searchParams.get('paymentStatus');

        if (!transactionId) {
          setStatus('error');
          setMessage('Tranzaksyon pa jwenn');
          return;
        }

        // Vérifier le statut du paiement via l'Edge Function
        // IMPORTANT: On se fie UNIQUEMENT à la réponse de l'API Bazik, pas au statut en base
        const verificationResult = await verifyBazikPayment(transactionId);

        // Vérification STRICTE : ne confirmer que si l'API Bazik confirme explicitement le paiement
        if (verificationResult.success && verificationResult.payment_status === 'COMPLETED') {
          // La fonction verify-bazik-payment a déjà mis à jour le statut en base de données
          // On peut donc confirmer à l'utilisateur
          queryClient.invalidateQueries({ queryKey: ['inscription-count'] });
          queryClient.invalidateQueries({ queryKey: ['inscriptions-admin'] });
          setStatus('success');
          setMessage('Peman konfime ! Enskripsyon w valide.');
          
          toast({
            title: '🎉 Peman reyisi !',
            description: 'Enskripsyon w konfime. W ap resevwa yon imèl konfirmasyon.',
          });

          // Nettoyer sessionStorage
          sessionStorage.removeItem('pending_transaction');

          // Rediriger après 3 secondes
          setTimeout(() => {
            navigate('/');
          }, 3000);
        } else {
          // Le paiement n'a PAS été confirmé par l'API Bazik
          // On NE vérifie PAS le statut en base car il pourrait être erroné
          // On affiche un message d'attente
          setStatus('error');
          setMessage(verificationResult.message || 'Peman an poko konfime pa labank. Tanpri tann kèk moman.');
          
          toast({
            title: 'Peman ap tann',
            description: 'Peman w ap trete. W ap resevwa yon notifikasyon lè l konfime.',
            variant: 'default',
          });

          // Ne pas nettoyer le sessionStorage pour permettre une nouvelle vérification
          // Rediriger vers l'accueil après 5 secondes
          setTimeout(() => {
            navigate('/');
          }, 5000);
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

        {status === 'success' && (
          <>
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2 text-green-600">Peman konfime !</h2>
            <p className="text-muted-foreground mb-4">{message}</p>
            <p className="text-sm text-muted-foreground">Ap redirekte...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2 text-red-600">Peman pa konfime</h2>
            <p className="text-muted-foreground mb-4">{message}</p>
            <button
              onClick={() => navigate('/')}
              className="btn-primary"
            >
              Tounen sou akèy la
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentCallback;

