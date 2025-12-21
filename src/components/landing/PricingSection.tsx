import { useSeminarInfo, useInscriptionCount } from '@/hooks/useSeminarData';
import { Check, Sparkles, ArrowRight } from 'lucide-react';

interface PricingSectionProps {
  onOpenModal: () => void;
}

export const PricingSection = ({ onOpenModal }: PricingSectionProps) => {
  const { data: seminarInfo } = useSeminarInfo();
  const { data: inscriptionCount = 0 } = useInscriptionCount();

  const prixBase = seminarInfo?.prix_base || 5000;
  const placesRestantes = (seminarInfo?.nombre_places_total || 100) - inscriptionCount;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-HT').format(price);
  };

  const features = [
    '3 jours de formation intensive',
    'Certificat officiel Konekte Group',
    'Matériel pédagogique complet',
    'Accès à la communauté exclusive',
    '3 mois de support post-formation',
    'Projets pratiques guidés',
  ];

  return (
    <section className="py-20 md:py-32 bg-gradient-dark relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-primary/20 to-transparent rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/20 rounded-full text-primary text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            Tarif spécial lancement
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-primary-foreground">
            Investissez dans votre <span className="text-primary">avenir</span>
          </h2>
          <p className="text-primary-foreground/70 text-lg max-w-2xl mx-auto">
            Un investissement unique pour des compétences qui vous accompagneront toute votre carrière
          </p>
        </div>

        {/* Pricing Card */}
        <div className="max-w-lg mx-auto">
          <div className="bg-card rounded-3xl p-8 md:p-10 shadow-2xl border border-border/20 relative overflow-hidden">
            {/* Glow effect */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-primary/30 to-secondary/30 rounded-full blur-3xl" />
            
            <div className="relative z-10">
              {/* Price */}
              <div className="text-center mb-8">
                <div className="text-sm text-muted-foreground mb-2">Prix du séminaire</div>
                <div className="flex items-end justify-center gap-1">
                  <span className="text-5xl md:text-6xl font-bold text-gradient">
                    {formatPrice(prixBase)}
                  </span>
                  <span className="text-xl text-muted-foreground mb-2">HTG</span>
                </div>
              </div>

              {/* Payment Options */}
              <div className="bg-muted/50 rounded-2xl p-4 mb-8">
                <div className="text-sm font-medium text-center mb-3">Options de paiement flexibles</div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-card rounded-xl p-3 text-center border border-border">
                    <div className="text-lg font-bold text-primary">25%</div>
                    <div className="text-xs text-muted-foreground">{formatPrice(prixBase * 0.25)} HTG</div>
                  </div>
                  <div className="bg-card rounded-xl p-3 text-center border-2 border-primary relative">
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                      Populaire
                    </div>
                    <div className="text-lg font-bold text-primary">50%</div>
                    <div className="text-xs text-muted-foreground">{formatPrice(prixBase * 0.5)} HTG</div>
                  </div>
                  <div className="bg-card rounded-xl p-3 text-center border border-border">
                    <div className="text-lg font-bold text-primary">100%</div>
                    <div className="text-xs text-muted-foreground">{formatPrice(prixBase)} HTG</div>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-3 mb-8">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-success/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-success" />
                    </div>
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Promo Code Notice */}
              <div className="text-center text-sm text-muted-foreground mb-6">
                <Sparkles className="w-4 h-4 inline-block mr-1" />
                Codes promo disponibles lors de l'inscription
              </div>

              {/* CTA */}
              <button 
                onClick={onOpenModal} 
                className="btn-primary w-full group text-lg"
                disabled={placesRestantes <= 0}
              >
                {placesRestantes > 0 ? (
                  <>
                    Réserver ma place maintenant
                    <ArrowRight className="inline-block ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                ) : (
                  'Complet'
                )}
              </button>

              {/* Places Counter */}
              <div className="text-center mt-4">
                <span className="text-sm text-muted-foreground">
                  {placesRestantes > 0 
                    ? `⚡ Plus que ${placesRestantes} places disponibles`
                    : 'Toutes les places ont été réservées'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
