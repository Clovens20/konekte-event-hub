import { useState } from 'react';
import { useFooterConfig } from '@/hooks/useSeminarData';
import { Mail, Phone, MapPin, Sparkles } from 'lucide-react';

// Composant pour afficher un logo avec fallback et support de plusieurs formats
const LogoImage = ({ baseName, alt, fallbackText }: { baseName: string; alt: string; fallbackText: string }) => {
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  // Essayer plusieurs formats et extensions
  // Pour GGTC, commencer par .jpg car c'est le format actuel
  const extensions = baseName.includes('ggtc') 
    ? ['.jpg', '.jpeg', '.png', '.svg', '.webp']
    : ['.png', '.jpg', '.jpeg', '.svg', '.webp'];
  const sources = extensions.map(ext => `/logos/${baseName}${ext}`);
  
  // Pour GGTC, ne pas appliquer le filtre invert (logo coloré)
  const isGGTC = baseName.includes('ggtc');
  // Désactiver le filtre invert pour tous les logos pour permettre l'affichage
  // Le filtre brightness-0 invert peut rendre les logos invisibles s'ils sont déjà clairs/blancs
  // Si les logos sont en couleur, ils seront visibles sur le fond sombre du footer
  const shouldInvert = false;

  const handleError = () => {
    if (currentSrc < sources.length - 1) {
      // Essayer le format suivant
      setCurrentSrc(currentSrc + 1);
    } else {
      // Tous les formats ont échoué
      setHasError(true);
      setIsLoading(false);
    }
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  // Si les logos ne sont pas trouvés, afficher le texte de manière visible (sauf pour GGTC qui a déjà le nom affiché)
  if (hasError) {
    if (!fallbackText) {
      // Pour GGTC, ne rien afficher si le logo n'est pas trouvé (le nom est déjà affiché)
      return null;
    }
    return (
      <div className="flex items-center justify-center">
        <span className="text-base sm:text-lg md:text-xl font-bold text-background whitespace-nowrap">
          {fallbackText}
        </span>
      </div>
    );
  }

  return (
    <div className="relative flex items-center justify-center w-full">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-background/20 border-t-background/60 rounded-full animate-spin" />
        </div>
      )}
      <img 
        src={sources[currentSrc]} 
        alt={alt} 
        className={`h-12 md:h-16 max-w-[200px] w-auto object-contain ${shouldInvert ? 'filter brightness-0 invert' : ''} hover:opacity-80 transition-opacity ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          console.error(`❌ Logo pa jwenn: ${sources[currentSrc]}`, {
            currentSrc,
            allSources: sources,
            baseName,
            attempted: sources.slice(0, currentSrc + 1),
            fullUrl: window.location.origin + sources[currentSrc]
          });
          handleError();
        }}
        onLoad={(e) => {
          const target = e.target as HTMLImageElement;
          console.log(`✅ Logo chaje: ${sources[currentSrc]}`, {
            naturalWidth: target.naturalWidth,
            naturalHeight: target.naturalHeight,
            complete: target.complete,
            src: target.src,
            currentSrc
          });
          handleLoad();
        }}
        loading="lazy"
      />
    </div>
  );
};

export const Footer = () => {
  const { data: footerConfig } = useFooterConfig();

  return (
    <footer id="contact" className="bg-foreground text-background py-12 sm:py-16">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 mb-10 sm:mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">Konekte Group</span>
            </div>
            <p className="text-background/70 mb-6 max-w-md">
              Nou ap fòme pwochen jenerasyon devlopè ayisyen ak teknoloji avanse.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold mb-4">Lyen rapid</h4>
            <nav className="space-y-3">
              <a href="#accueil" className="block text-background/70 hover:text-background transition-colors">
                Akèy
              </a>
              <a href="#programme" className="block text-background/70 hover:text-background transition-colors">
                Pwogram
              </a>
              <a href="#contact" className="block text-background/70 hover:text-background transition-colors">
                Kontak
              </a>
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold mb-4">Kontak</h4>
            <div className="space-y-3">
              {footerConfig?.email && footerConfig.email.trim() && (
                <div className="flex items-center gap-3 text-background/70">
                  <Mail className="w-5 h-5 text-primary" />
                  <span>{footerConfig.email}</span>
                </div>
              )}
              {footerConfig?.telephone && footerConfig.telephone.trim() && (
                <div className="flex items-center gap-3 text-background/70">
                  <Phone className="w-5 h-5 text-primary" />
                  <span>{footerConfig.telephone}</span>
                </div>
              )}
              {footerConfig?.adresse && footerConfig.adresse.trim() && (
                <div className="flex items-center gap-3 text-background/70">
                  <MapPin className="w-5 h-5 text-primary" />
                  <span>{footerConfig.adresse}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Organisateurs et Partenaires */}
        <div className="border-t border-background/10 pt-6 sm:pt-8 mb-6 sm:mb-8">
          <div className="flex flex-col items-center gap-6 sm:gap-8">
            {/* Organisé par */}
            <div className="text-center">
              <p className="text-background/70 text-xs sm:text-sm mb-3 sm:mb-4 font-medium uppercase tracking-wider">Òganize pa</p>
              <div className="flex flex-col items-center justify-center gap-3 sm:gap-4">
                {/* Logo GGTC */}
                <div className="flex items-center justify-center min-h-[60px] px-2 sm:px-4 relative">
                  <LogoImage 
                    baseName="ggtc-logo" 
                    alt="GGTC" 
                    fallbackText=""
                  />
                </div>
                {/* Nom GGTC */}
                <div className="flex items-center justify-center">
                  <span className="text-xl sm:text-2xl md:text-3xl font-bold text-background">GGTC</span>
                </div>
              </div>
            </div>

            {/* Financé par */}
            <div className="text-center w-full">
              <p className="text-background/70 text-xs sm:text-sm mb-4 sm:mb-6 font-medium uppercase tracking-wider">
                Finanse pa: <span className="normal-case">InnovaPort</span> ak <span className="normal-case">Konekte Group</span>
              </p>
              <div className="flex items-center justify-center gap-4 sm:gap-6 md:gap-8 lg:gap-12 flex-wrap px-4">
                {/* Logo InnovaPort */}
                <div className="flex items-center justify-center min-h-[60px] px-2 sm:px-4 relative">
                  <LogoImage 
                    baseName="innovaport-logo" 
                    alt="InnovaPort" 
                    fallbackText="InnovaPort"
                  />
                </div>

                {/* Logo Konekte Group */}
                <div className="flex items-center justify-center min-h-[60px] px-2 sm:px-4 relative">
                  <LogoImage 
                    baseName="konekte-group-logo" 
                    alt="Konekte Group" 
                    fallbackText="Konekte Group"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-background/10 pt-8 text-center">
          <p className="text-background/50 text-sm">
            {footerConfig?.copyright || '© 2025 Konekte Group. Tout dwa rezève.'}
          </p>
        </div>
      </div>
    </footer>
  );
};