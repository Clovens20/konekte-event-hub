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
        // Note: La fonction verify-bazik-payment met déjà à jour le statut automatiquement
        const verificationResult = await verifyBazikPayment(transactionId);

        if (verificationResult.success && verificationResult.payment_status === 'COMPLETED') {
          // Vérifier que le statut a bien été mis à jour (la fonction verify-bazik-payment le fait déjà)
          // Mais on vérifie quand même côté client pour s'assurer
          const { data: inscription, error } = await supabase
            .from('inscriptions')
            .select('statut')
            .eq('transaction_id', transactionId)
            .single();

          if (error) {
            logError(error, 'CheckInscriptionStatus');
          }

          // Si le statut n'est pas encore "Confirmé", le mettre à jour manuellement
          if (inscription && inscription.statut !== 'Confirmé') {
            const { error: updateError } = await supabase
              .from('inscriptions')
              .update({ statut: 'Confirmé' })
              .eq('transaction_id', transactionId);

            if (updateError) {
              logError(updateError, 'UpdateInscriptionStatus');
            }
          }

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
          // Vérifier quand même si le paiement a été confirmé (au cas où le webhook l'aurait fait)
          const { data: inscription } = await supabase
            .from('inscriptions')
            .select('statut')
            .eq('transaction_id', transactionId)
            .single();

          if (inscription && inscription.statut === 'Confirmé') {
            // Le webhook a déjà mis à jour le statut
            queryClient.invalidateQueries({ queryKey: ['inscription-count'] });
            queryClient.invalidateQueries({ queryKey: ['inscriptions-admin'] });
            setStatus('success');
            setMessage('Paiement confirmé ! Votre inscription est validée.');
            
            toast({
              title: '🎉 Paiement réussi !',
              description: 'Votre inscription a été confirmée.',
            });

            sessionStorage.removeItem('pending_transaction');
            setTimeout(() => {
              navigate('/');
            }, 3000);
          } else {
            setStatus('error');
            setMessage(verificationResult.message || 'Le paiement n\'a pas pu être confirmé.');
            
            toast({
              title: 'Paiement non confirmé',
              description: 'Votre inscription reste en attente. Contactez-nous si vous avez effectué le paiement.',
              variant: 'destructive',
            });
          }
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

