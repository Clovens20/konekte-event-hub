import { useProgramModules, useSeminarInfo } from '@/hooks/useSeminarData';
import { BookOpen, CheckCircle } from 'lucide-react';

export const ProgramSection = () => {
  const { data: modules = [], isLoading } = useProgramModules();
  const { data: seminarInfo } = useSeminarInfo();

  // Utiliser les valeurs de la base de données ou les valeurs par défaut
  const badgeText = seminarInfo?.program_badge_text || 'Programme complet';
  const title = seminarInfo?.program_title || 'Programme du Séminaire';
  const subtitle = seminarInfo?.program_subtitle || 'Trois jours intensifs pour maîtriser les outils d\'IA qui transforment le développement web';

  if (isLoading) {
    return (
      <section id="programme" className="py-20 md:py-32 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-muted rounded w-1/3 mx-auto" />
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 bg-muted rounded-2xl" />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="programme" className="py-20 md:py-32 bg-muted/30 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-secondary/10 rounded-full text-secondary text-xs sm:text-sm font-medium mb-3 sm:mb-4">
            <BookOpen className="w-3 h-3 sm:w-4 sm:h-4" />
            {badgeText}
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 px-2">
            {title.split(' ').map((word, i, arr) => 
              i === arr.length - 1 ? (
                <span key={i}><span className="text-gradient">{word}</span></span>
              ) : (
                <span key={i}>{word} </span>
              )
            )}
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto px-2">
            {subtitle}
          </p>
        </div>

        {/* Program Cards - CORRECTION: Ajout de animate-fade-in */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {modules.map((module, index) => (
            <div 
              key={module.id} 
              className="card-elevated p-5 sm:p-6 md:p-8 group hover:scale-[1.02] transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Day Badge */}
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-gradient-primary rounded-xl sm:rounded-2xl text-primary-foreground font-bold text-lg sm:text-xl mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
                J{module.jour}
              </div>

              {/* Content */}
              <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 group-hover:text-primary transition-colors">
                {module.titre}
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-4 sm:mb-6">
                {module.description}
              </p>

              {/* Features */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-success" />
                  <span>Exercices pratiques inclus</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-success" />
                  <span>Support personnalisé</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};