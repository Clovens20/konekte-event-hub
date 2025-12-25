import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useSeminarInfo, useInscriptionCount } from '@/hooks/useSeminarData';

interface HeaderProps {
  onOpenModal: () => void;
}

// Composant pour afficher le logo GGTC avec fallback
const GGTCLogo = () => {
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(0);
  
  // Essayer plusieurs formats et extensions (commencer par .jpg car c'est le format actuel)
  const extensions = ['.jpg', '.jpeg', '.png', '.svg', '.webp'];
  const sources = extensions.map(ext => `/logos/ggtc-logo${ext}`);

  const handleError = () => {
    if (currentSrc < sources.length - 1) {
      setCurrentSrc(currentSrc + 1);
    } else {
      setHasError(true);
    }
  };

  if (hasError) {
    // Fallback : icône simple si le logo n'est pas trouvé
    return (
      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-primary rounded-lg sm:rounded-xl flex items-center justify-center">
        <span className="text-primary-foreground font-bold text-xs sm:text-sm">GG</span>
      </div>
    );
  }

  return (
    <img 
      src={sources[currentSrc]} 
      alt="GGTC" 
      className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
      onError={handleError}
      loading="eager"
    />
  );
};

export const Header = ({ onOpenModal }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: seminarInfo } = useSeminarInfo();
  const { data: inscriptionCount = 0 } = useInscriptionCount();

  const placesRestantes = (seminarInfo?.nombre_places_total || 100) - inscriptionCount;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo GGTC */}
          <div className="flex items-center gap-2 sm:gap-3">
            <GGTCLogo />
            <span className="text-lg sm:text-xl font-bold">GGTC</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#accueil" className="text-muted-foreground hover:text-foreground transition-colors">
              Accueil
            </a>
            <a href="#programme" className="text-muted-foreground hover:text-foreground transition-colors">
              Programme
            </a>
            <a href="#contact" className="text-muted-foreground hover:text-foreground transition-colors">
              Contact
            </a>
          </nav>

          {/* CTA and Places Counter */}
          <div className="hidden md:flex items-center gap-4">
            <div className="badge-count">
              <span className="animate-pulse-soft">●</span>
              {placesRestantes} places restantes
            </div>
            <button onClick={onOpenModal} className="btn-primary text-sm py-2.5 px-5">
              Réserver ma place
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in">
            <nav className="flex flex-col gap-4">
              <a 
                href="#accueil" 
                className="text-muted-foreground hover:text-foreground transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Accueil
              </a>
              <a 
                href="#programme" 
                className="text-muted-foreground hover:text-foreground transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Programme
              </a>
              <a 
                href="#contact" 
                className="text-muted-foreground hover:text-foreground transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </a>
              <div className="pt-4 space-y-3">
                <div className="badge-count w-fit">
                  <span className="animate-pulse-soft">●</span>
                  {placesRestantes} places restantes
                </div>
                <button 
                  onClick={() => { onOpenModal(); setIsMenuOpen(false); }} 
                  className="btn-primary w-full text-sm py-2.5"
                >
                  Réserver ma place
                </button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};
