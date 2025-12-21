import { useFooterConfig } from '@/hooks/useSeminarData';
import { Mail, Phone, MapPin, Facebook, Instagram, Linkedin, Sparkles } from 'lucide-react';

export const Footer = () => {
  const { data: footerConfig } = useFooterConfig();

  return (
    <footer id="contact" className="bg-foreground text-background py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">Konekte Group</span>
            </div>
            <p className="text-background/70 mb-6 max-w-md">
              Nous formons la prochaine génération de développeurs haïtiens aux technologies de pointe.
            </p>
            
            {/* Social Links */}
            <div className="flex items-center gap-4">
              {footerConfig?.facebook && (
                <a 
                  href={footerConfig.facebook} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-background/10 rounded-xl flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <Facebook className="w-5 h-5" />
                </a>
              )}
              {footerConfig?.instagram && (
                <a 
                  href={footerConfig.instagram} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-background/10 rounded-xl flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {footerConfig?.linkedin && (
                <a 
                  href={footerConfig.linkedin} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-background/10 rounded-xl flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold mb-4">Liens rapides</h4>
            <nav className="space-y-3">
              <a href="#accueil" className="block text-background/70 hover:text-background transition-colors">
                Accueil
              </a>
              <a href="#programme" className="block text-background/70 hover:text-background transition-colors">
                Programme
              </a>
              <a href="#contact" className="block text-background/70 hover:text-background transition-colors">
                Contact
              </a>
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold mb-4">Contact</h4>
            <div className="space-y-3">
              {footerConfig?.email && (
                <a 
                  href={`mailto:${footerConfig.email}`} 
                  className="flex items-center gap-3 text-background/70 hover:text-background transition-colors"
                >
                  <Mail className="w-5 h-5 text-primary" />
                  <span>{footerConfig.email}</span>
                </a>
              )}
              {footerConfig?.telephone && (
                <a 
                  href={`tel:${footerConfig.telephone}`} 
                  className="flex items-center gap-3 text-background/70 hover:text-background transition-colors"
                >
                  <Phone className="w-5 h-5 text-primary" />
                  <span>{footerConfig.telephone}</span>
                </a>
              )}
              {footerConfig?.adresse && (
                <div className="flex items-center gap-3 text-background/70">
                  <MapPin className="w-5 h-5 text-primary" />
                  <span>{footerConfig.adresse}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-background/10 pt-8 text-center">
          <p className="text-background/50 text-sm">
            {footerConfig?.copyright || '© 2025 Konekte Group. Tous droits réservés.'}
          </p>
        </div>
      </div>
    </footer>
  );
};
