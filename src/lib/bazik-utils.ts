/**
 * Utilitaires pour l'intégration Bazik.io
 */

export interface BazikPaymentRequest {
  amount: number;
  transactionId: string;
  email: string;
  phoneNumber?: string;
  description?: string;
  firstName?: string;
  lastName?: string;
}

export interface BazikPaymentResponse {
  success: boolean;
  paymentUrl?: string;
  transactionId: string;
  message: string;
}

/**
 * Crée une transaction Bazik.io et retourne l'URL de paiement
 * 
 * Cette fonction appelle une Edge Function Supabase qui communique avec l'API Bazik.io
 */
export const createBazikPayment = async (
  request: BazikPaymentRequest
): Promise<BazikPaymentResponse> => {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return {
        success: false,
        transactionId: request.transactionId,
        message: 'Konfigirasyon Supabase manke',
      };
    }

    // Appeler l'Edge Function Supabase qui gère l'API Bazik.io
    // Ajouter un timeout de 30 secondes
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 secondes (optimisé pour 100+ utilisateurs simultanés)
    
    try {
      const response = await fetch(`${supabaseUrl}/functions/v1/create-bazik-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({
          amount: request.amount,
          transaction_id: request.transactionId,
          email: request.email,
          phone_number: request.phoneNumber,
          description: request.description || 'Enskripsyon seminè',
          first_name: request.firstName,
          last_name: request.lastName,
        }),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.details?.error || `Erreur ${response.status}: ${response.statusText}`;
        console.error('Erreur Edge Function:', {
          status: response.status,
          error: errorData,
        });
        throw new Error(errorMessage);
      }

      const data = await response.json();

      if (data.success && data.payment_url) {
        return {
          success: true,
          paymentUrl: data.payment_url,
          transactionId: request.transactionId,
          message: 'Redirection vers Bazik.io...',
        };
      } else {
        return {
          success: false,
          transactionId: request.transactionId,
          message: data.message || 'Impossible de créer le paiement',
        };
      }
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        console.error('Timeout: La requête a pris trop de temps');
        return {
          success: false,
          transactionId: request.transactionId,
          message: 'La requête a pris trop de temps. Veuillez réessayer.',
        };
      }
      
      throw fetchError;
    }
  } catch (error) {
    console.error('Erreur Bazik.io:', error);
    return {
      success: false,
      transactionId: request.transactionId,
      message: error instanceof Error ? error.message : 'Erreur de connexion. Veuillez réessayer.',
    };
  }
};

/**
 * Vérifie le statut d'un paiement Bazik.io
 */
export interface VerifyBazikPaymentResult {
  success: boolean;
  payment_status?: string;
  message: string;
  /** true si paiement 100% → accès formation immédiat */
  full_access?: boolean;
  pourcentage_paye?: string | null;
}

export const verifyBazikPayment = async (
  transactionId: string
): Promise<VerifyBazikPaymentResult> => {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return {
        success: false,
        message: 'Konfigirasyon Supabase manke',
      };
    }

    const response = await fetch(`${supabaseUrl}/functions/v1/verify-bazik-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({ transaction_id: transactionId }),
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la vérification du paiement');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erreur vérification Bazik.io:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Erreur de vérification',
    };
  }
};

