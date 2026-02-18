import { useState } from 'react';
import { X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useSeminarInfo, useSiteTexts } from '@/hooks/useSeminarData';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { showError, logError } from '@/lib/error-handler';
import { createBazikPayment } from '@/lib/bazik-utils';

interface InscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const defaultTexts: Record<string, string> = {
  form_modal_title: 'Rezève kote m',
  form_label_name: 'Non konplè *',
  form_placeholder_name: 'Egz: Jean Baptiste',
  form_label_email: 'Imèl *',
  form_placeholder_email: 'imelw@egzamp.com',
  form_label_phone: 'Telefòn *',
  form_placeholder_phone: '+509 3712 3456',
  form_label_level: 'Nivo eksperyans *',
  form_placeholder_level: 'Chwazi...',
  form_option_beginner: 'Kòmanse (pa gen eksperyans)',
  form_option_intermediate: 'Mwayen (kèk nosyon)',
  form_option_advanced: 'Avanse (eksperyans serye)',
  form_label_motivation: 'Motivasyon (opsyonèl)',
  form_placeholder_motivation: 'Pale nou de objektif w...',
  form_label_payment: 'Opsyon peman *',
  form_label_promo: 'Kòd promosyon',
  form_placeholder_promo: 'KONEKTE25',
  form_btn_apply: 'Aplike',
  form_label_amount: 'Montan',
  form_label_discount: 'Rediksyon',
  form_label_total: 'Total pou peye',
  form_btn_submit: 'Kontinye pou peye',
  form_btn_loading: 'Ap trete...',
};

export const InscriptionModal = ({ isOpen, onClose }: InscriptionModalProps) => {
  const { data: seminarInfo } = useSeminarInfo();
  const { data: siteTexts } = useSiteTexts();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const prixBase = seminarInfo?.prix_base || 5000;
  const t = (key: string) => (siteTexts?.[key]?.trim() || defaultTexts[key] || key);

  const [formData, setFormData] = useState({
    nomComplet: '',
    email: '',
    telephone: '',
    niveauExperience: '' as 'Débutant' | 'Intermédiaire' | 'Avancé' | '',
    motivation: '',
    pourcentagePaye: '50' as '25' | '50' | '100',
    codePromo: '',
  });

  const [promoApplied, setPromoApplied] = useState<{ code: string; discount: number } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const calculatePrice = () => {
    const baseAmount = prixBase * (parseInt(formData.pourcentagePaye) / 100);
    if (promoApplied) {
      return baseAmount - promoApplied.discount;
    }
    return baseAmount;
  };

  // CORRECTION: Meilleure gestion des erreurs et validation
  const validatePromo = async () => {
    if (!formData.codePromo.trim()) {
      toast({ 
        title: 'Kòd vid', 
        description: 'Tanpri antre yon kòd promosyon.', 
        variant: 'destructive' 
      });
      return;
    }
    
    setIsValidatingPromo(true);

    try {
      const baseAmount = prixBase * (parseInt(formData.pourcentagePaye) / 100);
      
      const { data: validationResult, error } = await supabase.rpc('validate_promo_code', {
        promo_code: formData.codePromo.toUpperCase(),
        base_amount: Math.round(baseAmount),
      });

      if (error) {
        logError(error, 'ValidatePromo');
        toast({ title: 'Erè', description: 'Pa kapab valide kòd promosyon an.', variant: 'destructive' });
        setPromoApplied(null);
        return;
      }

      // CORRECTION: Vérification que validationResult n'est pas null
      if (!validationResult) {
        toast({ 
          title: 'Erè', 
          description: 'Pa gen repons soti nan sèvè a.', 
          variant: 'destructive' 
        });
        setPromoApplied(null);
        return;
      }

      if (!validationResult.valid) {
        toast({ 
          title: 'Kòd pa valid', 
          description: validationResult.error || 'Kòd promosyon sa a pa valid.', 
          variant: 'destructive' 
        });
        setPromoApplied(null);
        return;
      }

      setPromoApplied({ 
        code: validationResult.code, 
        discount: validationResult.discount 
      });
      
      const discountText = validationResult.type === 'percentage' 
        ? `${validationResult.valeur}%`
        : `${validationResult.valeur} HTG`;
      
      toast({ 
        title: 'Kòd aplike!', 
        description: `Rediksyon ${discountText} aplike. Montan final: ${validationResult.final_amount} HTG` 
      });
    } catch (err) {
      logError(err, 'ValidatePromo');
      showError(err, 'Erè validasyon');
      setPromoApplied(null);
    } finally {
      setIsValidatingPromo(false);
    }
  };

  // CORRECTION: Meilleure validation du téléphone haïtien
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.nomComplet || formData.nomComplet.trim().length < 3) {
      newErrors.nomComplet = 'Non obligatwa (omwen 3 karaktè)';
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Imèl pa valid';
    }
    
    // CORRECTION: Validation améliorée du téléphone
    const cleanedPhone = formData.telephone.replace(/[\s\-\(\)]/g, '');
    const isValidHaitianPhone = /^(\+?509)?[234]\d{7}$/.test(cleanedPhone);
    
    if (!isValidHaitianPhone) {
      newErrors.telephone = 'Nimewo ayisyen pa valid (egz: 3712-3456 oubyen +509 3712-3456)';
    }
    
    if (!formData.niveauExperience) {
      newErrors.niveauExperience = 'Chwazi nivo w';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);

    try {
      const transactionId = `KONEKTE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const amount = calculatePrice();
      
      // Étape 1: Enregistrer l'inscription en "En attente" — va pase "Confirmé" otomatikman apre peman (webhook Bazik)
      const { error: insertError } = await supabase.from('inscriptions').insert({
        nom_complet: formData.nomComplet,
        email: formData.email,
        telephone: formData.telephone,
        niveau_experience: formData.niveauExperience as 'Débutant' | 'Intermédiaire' | 'Avancé',
        motivation: formData.motivation || null,
        montant_paye: amount,
        pourcentage_paye: formData.pourcentagePaye as '25' | '50' | '100',
        code_promo: promoApplied?.code || null,
        statut: 'En attente' as const,
        transaction_id: transactionId,
      });

      if (insertError) {
        logError(insertError, 'SubmitInscription');
        throw insertError;
      }

      // Étape 2: Créer la transaction Bazik.io et obtenir l'URL de paiement
      const [firstName, ...lastNameParts] = formData.nomComplet.split(' ');
      const lastName = lastNameParts.join(' ') || firstName;
      
      const paymentResult = await createBazikPayment({
        amount,
        transactionId,
        email: formData.email,
        phoneNumber: formData.telephone,
        description: `Inscription séminaire - ${formData.nomComplet}`,
        firstName: firstName,
        lastName: lastName,
      });

      if (!paymentResult.success || !paymentResult.paymentUrl) {
        toast({ 
          title: 'Erè peman', 
          description: paymentResult.message || 'Pa kapab kreye peman an. Enskripsyon w ap tann.',
          variant: 'destructive'
        });
        queryClient.invalidateQueries({ queryKey: ['inscription-count'] });
        setIsSubmitting(false);
        return;
      }

      // Étape 3: Incrémenter l'utilisation du code promo (avant redirection)
      if (promoApplied) {
        const { error: promoError } = await supabase.rpc('increment_promo_usage', { promo_code: promoApplied.code });
        if (promoError) {
          logError(promoError, 'IncrementPromoUsage');
          // Ne pas bloquer la redirection si l'incrémentation échoue
        }
      }

      // Étape 4: Sauvegarder le transactionId pour le callback
      sessionStorage.setItem('pending_transaction', transactionId);
      
      // Étape 5: Rediriger vers l'interface Bazik.io
      window.location.href = paymentResult.paymentUrl;
      
      // Note: Le code suivant ne s'exécutera pas car on redirige
      // Le callback Bazik.io gérera la mise à jour du statut
    } catch (err) {
      logError(err, 'SubmitInscription');
      showError(err, 'Erè enskripsyon');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-foreground/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-card rounded-2xl sm:rounded-3xl w-full max-w-xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in">
        <div className="sticky top-0 bg-card border-b border-border p-4 sm:p-6 flex items-center justify-between rounded-t-2xl sm:rounded-t-3xl z-10">
          <h2 className="text-xl sm:text-2xl font-bold">{t('form_modal_title')}</h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-xl transition-colors" aria-label="Fèmen">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-5">
          <div>
            <label className="block text-sm font-medium mb-2">{t('form_label_name')}</label>
            <input 
              type="text" 
              className={`input-styled ${errors.nomComplet ? 'border-destructive' : ''}`} 
              placeholder={t('form_placeholder_name')} 
              value={formData.nomComplet} 
              onChange={(e) => setFormData({ ...formData, nomComplet: e.target.value })} 
            />
            {errors.nomComplet && <p className="text-destructive text-sm mt-1">{errors.nomComplet}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">{t('form_label_email')}</label>
            <input 
              type="email" 
              className={`input-styled ${errors.email ? 'border-destructive' : ''}`} 
              placeholder={t('form_placeholder_email')} 
              value={formData.email} 
              onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
            />
            {errors.email && <p className="text-destructive text-sm mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">{t('form_label_phone')}</label>
            <input 
              type="tel" 
              className={`input-styled ${errors.telephone ? 'border-destructive' : ''}`} 
              placeholder={t('form_placeholder_phone')} 
              value={formData.telephone} 
              onChange={(e) => setFormData({ ...formData, telephone: e.target.value })} 
            />
            {errors.telephone && <p className="text-destructive text-sm mt-1">{errors.telephone}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">{t('form_label_level')}</label>
            <select 
              className={`input-styled ${errors.niveauExperience ? 'border-destructive' : ''}`} 
              value={formData.niveauExperience} 
              onChange={(e) => setFormData({ ...formData, niveauExperience: e.target.value as any })}
            >
              <option value="">{t('form_placeholder_level')}</option>
              <option value="Débutant">{t('form_option_beginner')}</option>
              <option value="Intermédiaire">{t('form_option_intermediate')}</option>
              <option value="Avancé">{t('form_option_advanced')}</option>
            </select>
            {errors.niveauExperience && <p className="text-destructive text-sm mt-1">{errors.niveauExperience}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">{t('form_label_motivation')}</label>
            <textarea 
              className="input-styled" 
              rows={3} 
              placeholder={t('form_placeholder_motivation')} 
              value={formData.motivation} 
              onChange={(e) => setFormData({ ...formData, motivation: e.target.value })} 
              maxLength={500} 
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">{t('form_label_payment')}</label>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {(['25', '50', '100'] as const).map((pct) => (
                <button 
                  type="button" 
                  key={pct} 
                  onClick={() => { 
                    // CORRECTION: Reset aussi le codePromo quand on change le pourcentage
                    setFormData({ ...formData, pourcentagePaye: pct, codePromo: '' }); 
                    setPromoApplied(null); 
                  }}
                  className={`p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all ${formData.pourcentagePaye === pct ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}
                >
                  <div className="text-base sm:text-lg font-bold">{pct}%</div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground break-words">{new Intl.NumberFormat('fr-HT').format(prixBase * parseInt(pct) / 100)} HTG</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">{t('form_label_promo')}</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                className="input-styled flex-1" 
                placeholder={t('form_placeholder_promo')} 
                value={formData.codePromo} 
                onChange={(e) => setFormData({ ...formData, codePromo: e.target.value.toUpperCase() })} 
              />
              <button 
                type="button" 
                onClick={validatePromo} 
                disabled={isValidatingPromo || !formData.codePromo} 
                className="btn-secondary px-4"
              >
                {isValidatingPromo ? <Loader2 className="w-4 h-4 animate-spin" /> : t('form_btn_apply')}
              </button>
            </div>
            {promoApplied && (
              <p className="text-success text-sm mt-2 flex items-center gap-1">
                <CheckCircle className="w-4 h-4" /> Kòd {promoApplied.code} aplike!
              </p>
            )}
          </div>

          <div className="bg-muted/50 rounded-2xl p-4">
            <div className="flex justify-between mb-2">
              <span className="text-muted-foreground">{t('form_label_amount')}</span>
              <span>{new Intl.NumberFormat('fr-HT').format(prixBase * parseInt(formData.pourcentagePaye) / 100)} HTG</span>
            </div>
            {promoApplied && (
              <div className="flex justify-between mb-2 text-success">
                <span>{t('form_label_discount')}</span>
                <span>-{new Intl.NumberFormat('fr-HT').format(promoApplied.discount)} HTG</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg border-t border-border pt-2 mt-2">
              <span>{t('form_label_total')}</span>
              <span className="text-gradient">{new Intl.NumberFormat('fr-HT').format(calculatePrice())} HTG</span>
            </div>
          </div>

          <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" /> {t('form_btn_loading')}
              </>
            ) : (
              t('form_btn_submit')
            )}
          </button>
        </form>
      </div>
    </div>
  );
};