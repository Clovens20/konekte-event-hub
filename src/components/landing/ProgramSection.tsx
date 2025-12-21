import { useProgramModules } from '@/hooks/useSeminarData';
import { BookOpen, CheckCircle } from 'lucide-react';

export const ProgramSection = () => {
  const { data: modules = [], isLoading } = useProgramModules();

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
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/10 rounded-full text-secondary text-sm font-medium mb-4">
            <BookOpen className="w-4 h-4" />
            Programme complet
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Programme du <span className="text-gradient">Séminaire</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Trois jours intensifs pour maîtriser les outils d'IA qui transforment le développement web
          </p>
        </div>

        {/* Program Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {modules.map((module, index) => (
            <div 
              key={module.id} 
              className="card-elevated p-6 md:p-8 group hover:scale-[1.02] transition-all duration-300"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Day Badge */}
              <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-primary rounded-2xl text-primary-foreground font-bold text-xl mb-6 group-hover:scale-110 transition-transform">
                J{module.jour}
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                {module.titre}
              </h3>
              <p className="text-muted-foreground leading-relaxed mb-6">
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
