import { MapPin, ArrowRight, Cpu, Code, Zap } from 'lucide-react';
import { useSeminarInfo, useInscriptionCount } from '@/hooks/useSeminarData';
import { PLACES_DEFAULT_CAPACITY, LABEL_PLAS_DISPONIB } from '@/lib/constants';

interface HeroSectionProps {
  onOpenModal: () => void;
}

export const HeroSection = ({ onOpenModal }: HeroSectionProps) => {
  const { data: seminarInfo } = useSeminarInfo();
  const { data: inscriptionCount = 0 } = useInscriptionCount();

  // Toujours 250 comme capacité affichée ; diminue avec chaque inscription
  const placesRestantes = PLACES_DEFAULT_CAPACITY - inscriptionCount;

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
            <span className="whitespace-nowrap">Fòmasyon an kreyòl sou AI kodè</span>
          </div>

          {/* Main Title - CORRECTION DU DOUBLON */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight mb-4 sm:mb-6 px-2 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            Vin aprann itilize AI pou w devlope
            <span className="block text-gradient">aplikasyon web ak aplikasyon mobil</span>
          </h1>

          {/* Description */}
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-6 sm:mb-8 px-2 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            {seminarInfo?.description || 'Aprann teknoloji IA ki ap révòlsyone kòd la — fòmasyon enligne, kontini, ak asistans pou ou pa janm bloke!'}
          </p>

          {/* Location */}
          <div className="flex items-center justify-center gap-2 text-sm sm:text-base text-muted-foreground mb-8 sm:mb-10 px-2 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
            <span className="whitespace-nowrap">{seminarInfo?.lieu || 'En ligne'}</span>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-2 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <button onClick={onOpenModal} className="btn-primary group text-base sm:text-lg w-full sm:w-auto">
              <span className="hidden sm:inline">Rezève plas mwen kounye a</span>
              <span className="sm:hidden">Rezève plas mwen</span>
              <ArrowRight className="inline-block ml-2 w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <a href="#programme" className="btn-secondary w-full sm:w-auto text-center">
              Gade pwogram nan
            </a>
          </div>

          {/* Stats */}
          <div className="mt-12 sm:mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 px-2 animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-gradient">{placesRestantes}</div>
              <div className="text-xs sm:text-sm text-muted-foreground mt-1">{LABEL_PLAS_DISPONIB}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-gradient">24/7</div>
              <div className="text-xs sm:text-sm text-muted-foreground mt-1">Disponib anliy</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-gradient">10+</div>
              <div className="text-xs sm:text-sm text-muted-foreground mt-1">Zouti IA</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-gradient">100%</div>
              <div className="text-xs sm:text-sm text-muted-foreground mt-1">Pratik</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};