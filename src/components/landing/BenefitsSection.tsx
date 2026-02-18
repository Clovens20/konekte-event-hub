import { useBenefits } from '@/hooks/useSeminarData';
import { Gift, Award, BookOpen, Users, Headphones, Shield, Star, Zap } from 'lucide-react';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Award,
  BookOpen,
  Users,
  Headphones,
  Gift,
  Shield,
  Star,
  Zap,
};

export const BenefitsSection = () => {
  const { data: benefits = [], isLoading } = useBenefits();

  if (isLoading) {
    return (
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-muted rounded w-1/3 mx-auto" />
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-48 bg-muted rounded-2xl" />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 md:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
      
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-primary/10 rounded-full text-primary text-xs sm:text-sm font-medium mb-3 sm:mb-4">
            <Gift className="w-3 h-3 sm:w-4 sm:h-4" />
            Avantaj eksklizif
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 px-2">
            Sa w <span className="text-gradient">resevwa</span>
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto px-2">
            Pi plis pase yon fòmasyon senp, yon envestisman pou lavni w
          </p>
        </div>

        {/* Benefits Grid - CORRECTION: Ajout de animate-fade-in */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {benefits.map((benefit, index) => {
            const IconComponent = iconMap[benefit.icon] || Award;
            return (
              <div 
                key={benefit.id}
                className="card-elevated p-5 sm:p-6 text-center group hover:bg-gradient-to-br hover:from-card hover:to-primary/5 transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Icon */}
                <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-gradient-primary rounded-xl sm:rounded-2xl text-primary-foreground mb-3 sm:mb-4 group-hover:scale-110 group-hover:shadow-glow transition-all duration-300">
                  <IconComponent className="w-7 h-7 sm:w-8 sm:h-8" />
                </div>

                {/* Content */}
                <h3 className="text-base sm:text-lg font-bold mb-2">{benefit.titre}</h3>
                <p className="text-muted-foreground text-xs sm:text-sm">{benefit.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};