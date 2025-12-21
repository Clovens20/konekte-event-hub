import { useState } from 'react';
import { Header } from '@/components/landing/Header';
import { HeroSection } from '@/components/landing/HeroSection';
import { ProgramSection } from '@/components/landing/ProgramSection';
import { BenefitsSection } from '@/components/landing/BenefitsSection';
import { PricingSection } from '@/components/landing/PricingSection';
import { Footer } from '@/components/landing/Footer';
import { InscriptionModal } from '@/components/landing/InscriptionModal';
import { Helmet } from 'react-helmet';

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
          <ProgramSection />
          <BenefitsSection />
          <PricingSection onOpenModal={() => setIsModalOpen(true)} />
        </main>
        <Footer />
        <InscriptionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </div>
    </>
  );
};

export default Index;
