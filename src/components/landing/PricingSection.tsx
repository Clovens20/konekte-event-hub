import { useSeminarInfo, useInscriptionCount } from '@/hooks/useSeminarData';
import { PLACES_DEFAULT_CAPACITY, LABEL_PLAS_DISPONIB } from '@/lib/constants';
import { Check, Sparkles, ArrowRight } from 'lucide-react';

interface PricingSectionProps {
  onOpenModal: () => void;
}

export const PricingSection = ({ onOpenModal }: PricingSectionProps) => {
  const { data: seminarInfo } = useSeminarInfo();
  const { data: inscriptionCount = 0 } = useInscriptionCount();

  const prixBase = seminarInfo?.prix_base || 5000;
  // Toujours 250 comme capacité affichée ; diminue avec chaque inscription
  const placesRestantes = PLACES_DEFAULT_CAPACITY - inscriptionCount;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-HT').format(price);
  };

  // Récupérer les features depuis la base de données ou utiliser les valeurs par défaut
  const features = (seminarInfo?.pricing_features as string[]) || [
    '3 jou fòmasyon entansif',
    'Sètifika ofisyèl Konekte Group',
    'Materyèl pedagojik konplè',
    'Aksè nan kominote eksklizif la',
    '3 mwa sipò apre fòmasyon',
    'Pwojè pratik gide',
  ];

  const pricingBadge = seminarInfo?.pricing_badge_text || 'Pri espesyal lansman';
  const pricingTitle = seminarInfo?.pricing_title || 'Envesti nan lavni w';
  const pricingSubtitle = seminarInfo?.pricing_subtitle || 'Yon envestisman inik pou konpetans ki ap akonpaye w tout karyè w';
  const pricingPromoNotice = seminarInfo?.pricing_promo_notice || 'Kòd promosyon disponib lè w ap enskri';

  return (
    <section className="py-20 md:py-32 bg-gradient-dark relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-primary/20 to-transparent rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-primary/20 rounded-full text-primary text-xs sm:text-sm font-medium mb-3 sm:mb-4">
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
            {pricingBadge}
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 text-primary-foreground px-2">
            {pricingTitle.split(' ').map((word, i, arr) => 
              i === arr.length - 1 ? (
                <span key={i}><span className="text-primary">{word}</span></span>
              ) : (
                <span key={i}>{word} </span>
              )
            )}
          </h2>
          <p className="text-primary-foreground/70 text-base sm:text-lg max-w-2xl mx-auto px-2">
            {pricingSubtitle}
          </p>
        </div>

        {/* Pricing Card */}
        <div className="max-w-lg mx-auto px-2">
          <div className="bg-card rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl border border-border/20 relative overflow-hidden">
            {/* Glow effect */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-primary/30 to-secondary/30 rounded-full blur-3xl" />
            
            <div className="relative z-10">
              {/* Price */}
              <div className="text-center mb-6 sm:mb-8">
                <div className="text-xs sm:text-sm text-muted-foreground mb-2">Pri seminè a</div>
                <div className="flex items-end justify-center gap-1">
                  <span className="text-4xl sm:text-5xl md:text-6xl font-bold text-gradient">
                    {formatPrice(prixBase)}
                  </span>
                  <span className="text-lg sm:text-xl text-muted-foreground mb-1 sm:mb-2">HTG</span>
                </div>
              </div>

              {/* Payment Options */}
              <div className="bg-muted/50 rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-6 sm:mb-8">
                <div className="text-xs sm:text-sm font-medium text-center mb-2 sm:mb-3">Opsyon peman fleksib</div>
                <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                  <div className="bg-card rounded-lg sm:rounded-xl p-2 sm:p-3 text-center border border-border">
                    <div className="text-base sm:text-lg font-bold text-primary">25%</div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground break-words">{formatPrice(prixBase * 0.25)} HTG</div>
                  </div>
                  <div className="bg-card rounded-lg sm:rounded-xl p-2 sm:p-3 text-center border-2 border-primary relative">
                    <div className="absolute -top-1.5 sm:-top-2 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full whitespace-nowrap">
                      Popilè
                    </div>
                    <div className="text-base sm:text-lg font-bold text-primary">50%</div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground break-words">{formatPrice(prixBase * 0.5)} HTG</div>
                  </div>
                  <div className="bg-card rounded-lg sm:rounded-xl p-2 sm:p-3 text-center border border-border">
                    <div className="text-base sm:text-lg font-bold text-primary">100%</div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground break-words">{formatPrice(prixBase)} HTG</div>
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
                {pricingPromoNotice}
              </div>

              {/* CTA */}
              <button 
                onClick={onOpenModal} 
                className="btn-primary w-full group text-lg"
                disabled={placesRestantes <= 0}
              >
                {placesRestantes > 0 ? (
                  <>
                    Rezève plas mwen kounye a
                    <ArrowRight className="inline-block ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                ) : (
                  'Konple'
                )}
              </button>

              {/* Places Counter */}
              <div className="text-center mt-4">
                <span className="text-sm text-muted-foreground">
                  {placesRestantes > 0 
                    ? `⚡ ${placesRestantes} ${LABEL_PLAS_DISPONIB}`
                    : 'Tout kote yo rezève deja'
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
