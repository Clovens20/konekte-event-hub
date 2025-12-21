import { useState } from 'react';
import { X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useSeminarInfo } from '@/hooks/useSeminarData';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

interface InscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InscriptionModal = ({ isOpen, onClose }: InscriptionModalProps) => {
  const { data: seminarInfo } = useSeminarInfo();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const prixBase = seminarInfo?.prix_base || 5000;

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

  const validatePromo = async () => {
    if (!formData.codePromo.trim()) return;
    setIsValidatingPromo(true);

    try {
      const { data: promo, error } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('code', formData.codePromo.toUpperCase())
        .eq('actif', true)
        .single();

      if (error || !promo) {
        toast({ title: 'Code invalide', description: 'Ce code promo n\'existe pas.', variant: 'destructive' });
        return;
      }

      if (promo.date_expiration && new Date(promo.date_expiration) < new Date()) {
        toast({ title: 'Code expiré', description: 'Ce code promo a expiré.', variant: 'destructive' });
        return;
      }

      if (promo.utilisations_max > 0 && promo.utilisations_actuelles >= promo.utilisations_max) {
        toast({ title: 'Code épuisé', description: 'Ce code promo a atteint sa limite d\'utilisation.', variant: 'destructive' });
        return;
      }

      const baseAmount = prixBase * (parseInt(formData.pourcentagePaye) / 100);
      const discount = promo.type === 'percentage' 
        ? (baseAmount * promo.valeur) / 100 
        : promo.valeur;

      setPromoApplied({ code: promo.code, discount });
      toast({ title: 'Code appliqué!', description: `Réduction de ${promo.valeur}${promo.type === 'percentage' ? '%' : ' HTG'} appliquée.` });
    } catch (err) {
      toast({ title: 'Erreur', description: 'Impossible de valider le code.', variant: 'destructive' });
    } finally {
      setIsValidatingPromo(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.nomComplet || formData.nomComplet.trim().length < 3) newErrors.nomComplet = 'Nom requis (min 3 caractères)';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Email invalide';
    if (!/^(\+?509)?[ -]?[234][0-9]{3}[ -]?[0-9]{4}$/.test(formData.telephone.replace(/\s/g, ''))) newErrors.telephone = 'Numéro haïtien invalide';
    if (!formData.niveauExperience) newErrors.niveauExperience = 'Sélectionnez votre niveau';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);

    try {
      const transactionId = `KONEKTE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const { error } = await supabase.from('inscriptions').insert({
        nom_complet: formData.nomComplet,
        email: formData.email,
        telephone: formData.telephone,
        niveau_experience: formData.niveauExperience as 'Débutant' | 'Intermédiaire' | 'Avancé',
        motivation: formData.motivation || null,
        montant_paye: calculatePrice(),
        pourcentage_paye: formData.pourcentagePaye as '25' | '50' | '100',
        code_promo: promoApplied?.code || null,
        statut: 'Confirmé' as const,
        transaction_id: transactionId,
      });

      if (error) throw error;

      if (promoApplied) {
        await supabase.rpc('increment_promo_usage', { promo_code: promoApplied.code });
      }

      queryClient.invalidateQueries({ queryKey: ['inscription-count'] });
      toast({ title: '🎉 Inscription réussie!', description: `Votre place est réservée. Transaction: ${transactionId}` });
      onClose();
      setFormData({ nomComplet: '', email: '', telephone: '', niveauExperience: '', motivation: '', pourcentagePaye: '50', codePromo: '' });
      setPromoApplied(null);
    } catch (err) {
      toast({ title: 'Erreur', description: 'Impossible de finaliser l\'inscription.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-card rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in">
        <div className="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between rounded-t-3xl">
          <h2 className="text-2xl font-bold">Réserver ma place</h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium mb-2">Nom complet *</label>
            <input type="text" className={`input-styled ${errors.nomComplet ? 'border-destructive' : ''}`} placeholder="Ex: Jean Baptiste" value={formData.nomComplet} onChange={(e) => setFormData({ ...formData, nomComplet: e.target.value })} />
            {errors.nomComplet && <p className="text-destructive text-sm mt-1">{errors.nomComplet}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email *</label>
            <input type="email" className={`input-styled ${errors.email ? 'border-destructive' : ''}`} placeholder="votreemail@exemple.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
            {errors.email && <p className="text-destructive text-sm mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Téléphone (MonCash) *</label>
            <input type="tel" className={`input-styled ${errors.telephone ? 'border-destructive' : ''}`} placeholder="+509 3712 3456" value={formData.telephone} onChange={(e) => setFormData({ ...formData, telephone: e.target.value })} />
            {errors.telephone && <p className="text-destructive text-sm mt-1">{errors.telephone}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Niveau d'expérience *</label>
            <select className={`input-styled ${errors.niveauExperience ? 'border-destructive' : ''}`} value={formData.niveauExperience} onChange={(e) => setFormData({ ...formData, niveauExperience: e.target.value as any })}>
              <option value="">Sélectionnez...</option>
              <option value="Débutant">Débutant (aucune expérience)</option>
              <option value="Intermédiaire">Intermédiaire (quelques notions)</option>
              <option value="Avancé">Avancé (expérience significative)</option>
            </select>
            {errors.niveauExperience && <p className="text-destructive text-sm mt-1">{errors.niveauExperience}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Motivation (optionnel)</label>
            <textarea className="input-styled" rows={3} placeholder="Parlez-nous de vos objectifs..." value={formData.motivation} onChange={(e) => setFormData({ ...formData, motivation: e.target.value })} maxLength={500} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Option de paiement *</label>
            <div className="grid grid-cols-3 gap-3">
              {(['25', '50', '100'] as const).map((pct) => (
                <button type="button" key={pct} onClick={() => { setFormData({ ...formData, pourcentagePaye: pct }); setPromoApplied(null); }}
                  className={`p-4 rounded-xl border-2 transition-all ${formData.pourcentagePaye === pct ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}>
                  <div className="text-lg font-bold">{pct}%</div>
                  <div className="text-xs text-muted-foreground">{new Intl.NumberFormat('fr-HT').format(prixBase * parseInt(pct) / 100)} HTG</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Code promo</label>
            <div className="flex gap-2">
              <input type="text" className="input-styled flex-1" placeholder="KONEKTE25" value={formData.codePromo} onChange={(e) => setFormData({ ...formData, codePromo: e.target.value.toUpperCase() })} />
              <button type="button" onClick={validatePromo} disabled={isValidatingPromo || !formData.codePromo} className="btn-secondary px-4">
                {isValidatingPromo ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Appliquer'}
              </button>
            </div>
            {promoApplied && <p className="text-success text-sm mt-2 flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Code {promoApplied.code} appliqué!</p>}
          </div>

          <div className="bg-muted/50 rounded-2xl p-4">
            <div className="flex justify-between mb-2">
              <span className="text-muted-foreground">Montant</span>
              <span>{new Intl.NumberFormat('fr-HT').format(prixBase * parseInt(formData.pourcentagePaye) / 100)} HTG</span>
            </div>
            {promoApplied && (
              <div className="flex justify-between mb-2 text-success">
                <span>Réduction</span>
                <span>-{new Intl.NumberFormat('fr-HT').format(promoApplied.discount)} HTG</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg border-t border-border pt-2 mt-2">
              <span>Total à payer</span>
              <span className="text-gradient">{new Intl.NumberFormat('fr-HT').format(calculatePrice())} HTG</span>
            </div>
          </div>

          <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
            {isSubmitting ? <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Traitement...</> : 'Procéder au paiement MonCash'}
          </button>
        </form>
      </div>
    </div>
  );
};
