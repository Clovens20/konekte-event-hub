import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { SeminarInfo, ProgramModule, Benefit, FooterConfig, FormationModule, SiteText } from '@/lib/types';
import { logError } from '@/lib/error-handler';

export const useSeminarInfo = () => {
  return useQuery({
    queryKey: ['seminar-info'],
    queryFn: async (): Promise<SeminarInfo | null> => {
      const { data, error } = await supabase
        .from('seminar_info')
        .select('*')
        .single();
      
      if (error) {
        logError(error, 'useSeminarInfo');
        throw error;
      }
      return data;
    },
    // Cache court pour que les modifications soient visibles rapidement
    // mais pas trop court pour éviter trop de requêtes
    staleTime: 30 * 1000, // 30 secondes - les données sont considérées comme fraîches pendant 30s
    // Refetch si les données sont stale (plus de 30s) lors du montage
    refetchOnMount: true, // Refetch si les données sont stale
  });
};

export const useProgramModules = () => {
  return useQuery({
    queryKey: ['program-modules'],
    queryFn: async (): Promise<ProgramModule[]> => {
      const { data, error } = await supabase
        .from('program_modules')
        .select('*')
        .order('ordre', { ascending: true });
      
      if (error) {
        logError(error, 'useProgramModules');
        throw error;
      }
      return data || [];
    },
  });
};

export const useBenefits = () => {
  return useQuery({
    queryKey: ['benefits'],
    queryFn: async (): Promise<Benefit[]> => {
      const { data, error } = await supabase
        .from('benefits')
        .select('*')
        .order('ordre', { ascending: true });
      
      if (error) {
        logError(error, 'useBenefits');
        throw error;
      }
      return data || [];
    },
  });
};

export const useFooterConfig = () => {
  return useQuery({
    queryKey: ['footer-config'],
    queryFn: async (): Promise<FooterConfig | null> => {
      const { data, error } = await supabase
        .from('footer_config')
        .select('*')
        .single();
      
      if (error) {
        logError(error, 'useFooterConfig');
        throw error;
      }
      return data;
    },
  });
};

export const useInscriptionCount = () => {
  return useQuery({
    queryKey: ['inscription-count'],
    queryFn: async (): Promise<number> => {
      const { count, error } = await supabase
        .from('inscriptions')
        .select('*', { count: 'exact', head: true })
        .neq('statut', 'Annulé');
      
      if (error) {
        logError(error, 'useInscriptionCount');
        throw error;
      }
      return count || 0;
    },
  });
};

export const useFormationModules = () => {
  return useQuery({
    queryKey: ['formation-modules'],
    queryFn: async (): Promise<FormationModule[]> => {
      const { data, error } = await supabase
        .from('formation_modules')
        .select('*')
        .order('ordre', { ascending: true });
      if (error) {
        logError(error, 'useFormationModules');
        throw error;
      }
      return (data || []).map((row) => ({
        ...row,
        points: Array.isArray(row.points) ? row.points : [],
      })) as FormationModule[];
    },
  });
};

export const useSiteTexts = () => {
  return useQuery({
    queryKey: ['site-texts'],
    queryFn: async (): Promise<Record<string, string>> => {
      const { data, error } = await supabase
        .from('site_texts')
        .select('key, value');
      if (error) {
        logError(error, 'useSiteTexts');
        throw error;
      }
      const map: Record<string, string> = {};
      (data || []).forEach((row: SiteText) => {
        map[row.key] = row.value ?? '';
      });
      return map;
    },
  });
};
