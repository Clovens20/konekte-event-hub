import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { SeminarInfo, ProgramModule, Benefit, FooterConfig } from '@/lib/types';

export const useSeminarInfo = () => {
  return useQuery({
    queryKey: ['seminar-info'],
    queryFn: async (): Promise<SeminarInfo | null> => {
      const { data, error } = await supabase
        .from('seminar_info')
        .select('*')
        .single();
      
      if (error) throw error;
      return data;
    },
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
      
      if (error) throw error;
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
      
      if (error) throw error;
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
      
      if (error) throw error;
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
      
      if (error) throw error;
      return count || 0;
    },
  });
};
