export interface SeminarInfo {
  id: string;
  titre: string;
  description: string;
  lieu: string;
  date_debut: string;
  date_fin: string;
  nombre_places_total: number;
  organisateur: string;
  prix_base: number;
  program_badge_text?: string | null;
  program_title?: string | null;
  program_subtitle?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProgramModule {
  id: string;
  jour: number;
  titre: string;
  description: string;
  ordre: number;
  created_at: string;
}

export interface Benefit {
  id: string;
  icon: string;
  titre: string;
  description: string;
  ordre: number;
  created_at: string;
}

export interface PromoCode {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  valeur: number;
  date_expiration: string | null;
  utilisations_max: number;
  utilisations_actuelles: number;
  actif: boolean;
  created_at: string;
}

export interface Inscription {
  id: string;
  nom_complet: string;
  email: string;
  telephone: string;
  niveau_experience: 'Débutant' | 'Intermédiaire' | 'Avancé';
  motivation: string | null;
  montant_paye: number;
  pourcentage_paye: '25' | '50' | '100';
  code_promo: string | null;
  statut: 'Confirmé' | 'En attente' | 'Annulé';
  transaction_id: string | null;
  created_at: string;
}

export interface FooterConfig {
  id: string;
  copyright: string;
  email: string;
  telephone: string;
  adresse: string;
  facebook: string | null;
  instagram: string | null;
  linkedin: string | null;
  updated_at: string;
}

export type ExperienceLevel = 'Débutant' | 'Intermédiaire' | 'Avancé';
export type PaymentPercentage = '25' | '50' | '100';
export type InscriptionStatus = 'Confirmé' | 'En attente' | 'Annulé';
