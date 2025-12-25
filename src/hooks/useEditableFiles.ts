import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { logError } from '@/lib/error-handler';

/**
 * Hook pour charger le contenu d'un fichier éditable
 */
export const useEditableFile = (filePath: string) => {
  return useQuery({
    queryKey: ['editable-file', filePath],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('editable_files')
        .select('content')
        .eq('file_path', filePath)
        .eq('is_active', true)
        .single();
      
      if (error) {
        logError(error, 'useEditableFile');
        return null;
      }
      
      return data?.content || null;
    },
    staleTime: 5 * 60 * 1000, // Cache 5 minutes
    enabled: !!filePath, // Ne charge que si filePath est défini
  });
};

/**
 * Hook pour charger plusieurs fichiers éditable par catégorie
 */
export const useEditableFilesByCategory = (category: string) => {
  return useQuery({
    queryKey: ['editable-files-category', category],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('editable_files')
        .select('file_path, content')
        .eq('category', category)
        .eq('is_active', true);
      
      if (error) {
        logError(error, 'useEditableFilesByCategory');
        return [];
      }
      
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!category,
  });
};

