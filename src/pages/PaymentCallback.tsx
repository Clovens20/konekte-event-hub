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
          setMessage('Transaction introuvable');
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
          setMessage('Paiement confirmé ! Votre inscription est validée.');
          
          toast({
            title: '🎉 Paiement réussi !',
            description: 'Votre inscription a été confirmée. Vous recevrez un email de confirmation.',
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
          setMessage(verificationResult.message || 'Le paiement n\'a pas encore été confirmé par la banque. Veuillez patienter quelques instants.');
          
          toast({
            title: 'Paiement en attente',
            description: 'Votre paiement est en cours de traitement. Vous serez notifié une fois qu\'il sera confirmé.',
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
        setMessage('Erreur lors de la vérification du paiement.');
        
        toast({
          title: 'Erreur',
          description: 'Une erreur est survenue. Votre inscription est en attente.',
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
            <h2 className="text-2xl font-bold mb-2">Vérification du paiement...</h2>
            <p className="text-muted-foreground">Veuillez patienter</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2 text-green-600">Paiement confirmé !</h2>
            <p className="text-muted-foreground mb-4">{message}</p>
            <p className="text-sm text-muted-foreground">Redirection en cours...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2 text-red-600">Paiement non confirmé</h2>
            <p className="text-muted-foreground mb-4">{message}</p>
            <button
              onClick={() => navigate('/')}
              className="btn-primary"
            >
              Retour à l'accueil
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentCallback;

