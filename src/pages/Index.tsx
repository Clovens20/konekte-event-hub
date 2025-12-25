import { useState, lazy, Suspense } from 'react';
import { Header } from '@/components/landing/Header';
import { HeroSection } from '@/components/landing/HeroSection';
import { InscriptionModal } from '@/components/landing/InscriptionModal';
import { Helmet } from 'react-helmet';
import { Loader2 } from 'lucide-react';

// Lazy load sections non critiques (en bas de page)
const ProgramSection = lazy(() => import('@/components/landing/ProgramSection').then(m => ({ default: m.ProgramSection })));
const BenefitsSection = lazy(() => import('@/components/landing/BenefitsSection').then(m => ({ default: m.BenefitsSection })));
const PricingSection = lazy(() => import('@/components/landing/PricingSection').then(m => ({ default: m.PricingSection })));
const Footer = lazy(() => import('@/components/landing/Footer').then(m => ({ default: m.Footer })));

// Loading fallback minimal pour les sections
const SectionLoader = () => (
  <div className="py-20 flex items-center justify-center">
    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
  </div>
);

const Index = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Helmet>
        <title>Maîtriser l'IA pour le Développement Web | Konekte Group</title>
        <meta name="description" content="Séminaire intensif de 3 jours à Saint-Marc, Haïti. Formez-vous aux outils d'IA pour développer des applications web modernes." />
      </Helmet>
      
      <div className="min-h-screen">
        <Header onOpenModal={() => setIsModalOpen(true)} />
        <main>
          <HeroSection onOpenModal={() => setIsModalOpen(true)} />
          <Suspense fallback={<SectionLoader />}>
            <ProgramSection />
          </Suspense>
          <Suspense fallback={<SectionLoader />}>
            <BenefitsSection />
          </Suspense>
          <Suspense fallback={<SectionLoader />}>
            <PricingSection onOpenModal={() => setIsModalOpen(true)} />
          </Suspense>
        </main>
        <Suspense fallback={<SectionLoader />}>
          <Footer />
        </Suspense>
        <InscriptionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </div>
    </>
  );
};

export default Index;
