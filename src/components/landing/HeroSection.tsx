import { MapPin, Calendar, ArrowRight, Cpu, Code, Zap } from 'lucide-react';
import { useSeminarInfo, useInscriptionCount } from '@/hooks/useSeminarData';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface HeroSectionProps {
  onOpenModal: () => void;
}

export const HeroSection = ({ onOpenModal }: HeroSectionProps) => {
  const { data: seminarInfo } = useSeminarInfo();
  const { data: inscriptionCount = 0 } = useInscriptionCount();

  const placesRestantes = (seminarInfo?.nombre_places_total || 100) - inscriptionCount;

  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), 'd MMMM yyyy', { locale: fr });
  };

  return (
    <section id="accueil" className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
      <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full blur-3xl opacity-50" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-secondary/20 to-primary/20 rounded-full blur-3xl opacity-30" />
      
      {/* Floating Icons */}
      <div className="absolute top-32 right-20 animate-float hidden lg:block">
        <div className="w-16 h-16 bg-card rounded-2xl shadow-xl flex items-center justify-center">
          <Cpu className="w-8 h-8 text-primary" />
        </div>
      </div>
      <div className="absolute bottom-40 left-20 animate-float hidden lg:block" style={{ animationDelay: '1s' }}>
        <div className="w-14 h-14 bg-card rounded-2xl shadow-xl flex items-center justify-center">
          <Code className="w-7 h-7 text-secondary" />
        </div>
      </div>
      <div className="absolute top-60 left-40 animate-float hidden lg:block" style={{ animationDelay: '2s' }}>
        <div className="w-12 h-12 bg-card rounded-2xl shadow-xl flex items-center justify-center">
          <Zap className="w-6 h-6 text-primary" />
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-primary/10 rounded-full text-primary text-xs sm:text-sm font-medium mb-6 sm:mb-8 animate-fade-in">
            <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="whitespace-nowrap">Séminaire Intensif 3 Jours</span>
          </div>

          {/* Main Title - CORRECTION DU DOUBLON */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight mb-4 sm:mb-6 px-2 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            Maîtriser l'IA pour le
            <span className="block text-gradient">Développement Web</span>
          </h1>

          {/* Description */}
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-6 sm:mb-8 px-2 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            {seminarInfo?.description || 'Formez-vous aux outils d\'IA essentiels pour développer des applications web, sites vitrines, programmes SaaS et plateformes e-commerce.'}
          </p>

          {/* Location and Date */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 md:gap-8 mb-8 sm:mb-10 px-2 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center gap-2 text-sm sm:text-base text-muted-foreground">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
              <span className="whitespace-nowrap">{seminarInfo?.lieu || 'Saint-Marc, Haïti'}</span>
            </div>
            <div className="flex items-center gap-2 text-sm sm:text-base text-muted-foreground">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-secondary flex-shrink-0" />
              <span className="text-center sm:text-left">
                {seminarInfo?.date_debut && seminarInfo?.date_fin 
                  ? `${formatDate(seminarInfo.date_debut)} - ${formatDate(seminarInfo.date_fin)}`
                  : '14 - 16 Mars 2025'
                }
              </span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-2 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <button onClick={onOpenModal} className="btn-primary group text-base sm:text-lg w-full sm:w-auto">
              <span className="hidden sm:inline">Réserver ma place maintenant</span>
              <span className="sm:hidden">Réserver ma place</span>
              <ArrowRight className="inline-block ml-2 w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <a href="#programme" className="btn-secondary w-full sm:w-auto text-center">
              Voir le programme
            </a>
          </div>

          {/* Stats */}
          <div className="mt-12 sm:mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 px-2 animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-gradient">{placesRestantes}</div>
              <div className="text-xs sm:text-sm text-muted-foreground mt-1">Places restantes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-gradient">3</div>
              <div className="text-xs sm:text-sm text-muted-foreground mt-1">Jours intensifs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-gradient">10+</div>
              <div className="text-xs sm:text-sm text-muted-foreground mt-1">Outils IA</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-gradient">100%</div>
              <div className="text-xs sm:text-sm text-muted-foreground mt-1">Pratique</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};