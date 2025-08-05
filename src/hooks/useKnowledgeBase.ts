import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { toast } from 'sonner';

type KnowledgeBaseItem = Tables<'knowledge_base'>;

interface KnowledgeBaseFilters {
  category?: string;
  subcategory?: string;
  content_type?: string;
  is_public?: boolean;
  search?: string;
  language?: string;
}

export const useKnowledgeBase = (filters: KnowledgeBaseFilters = {}) => {
  return useQuery({
    queryKey: ['knowledge_base', filters],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      let query = supabase
        .from('knowledge_base')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      // Filter by user unless specifically looking for public content only
      if (filters.is_public !== true) {
        query = query.eq('created_by', user.id);
      }

      if (filters.category) {
        query = query.eq('category', filters.category);
      }

      if (filters.subcategory) {
        query = query.eq('subcategory', filters.subcategory);
      }

      if (filters.content_type) {
        query = query.eq('content_type', filters.content_type);
      }

      if (filters.is_public !== undefined) {
        query = query.eq('is_public', filters.is_public);
      }

      if (filters.language) {
        query = query.eq('language', filters.language);
      }

      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,content.ilike.%${filters.search}%,summary.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao buscar knowledge base:', error);
        throw error;
      }

      return data as KnowledgeBaseItem[];
    },
  });
};

export const useKnowledgeBaseItem = (id: string) => {
  return useQuery({
    queryKey: ['knowledge_base_item', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('knowledge_base')
        .select('*')
        .eq('id', id)
        .eq('status', 'published')
        .single();

      if (error) {
        console.error('Erro ao buscar item da knowledge base:', error);
        throw error;
      }

      return data as KnowledgeBaseItem;
    },
    enabled: !!id,
  });
};

export const useKnowledgeBaseCategories = () => {
  return useQuery({
    queryKey: ['knowledge_base_categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('knowledge_base')
        .select('category, subcategory')
        .eq('status', 'published')
        .eq('is_public', true);

      if (error) {
        console.error('Erro ao buscar categorias:', error);
        throw error;
      }

      // Agrupar por categoria e subcategoria
      const categories = data.reduce((acc: Record<string, Set<string>>, item) => {
        if (item.category && item.category.trim() !== '') {
          if (!acc[item.category]) {
            acc[item.category] = new Set();
          }
          if (item.subcategory && item.subcategory.trim() !== '') {
            acc[item.category].add(item.subcategory);
          }
        }
        return acc;
      }, {});

      // Converter Sets para arrays
      return Object.entries(categories).map(([category, subcategories]) => ({
        category,
        subcategories: Array.from(subcategories),
      }));
    },
  });
};

export const useUpdateKnowledgeBaseViews = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.rpc('increment_knowledge_base_views', {
        kb_id: id,
      });

      if (error) {
        console.error('Erro ao incrementar visualizações:', error);
        throw error;
      }
    },
    onSuccess: (_, id) => {
      // Invalidar cache do item específico
      queryClient.invalidateQueries({ queryKey: ['knowledge_base_item', id] });
    },
  });
};

export const useKnowledgeBaseStats = () => {
  return useQuery({
    queryKey: ['knowledge_base_stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('knowledge_base')
        .select('content_type, category, view_count, language')
        .eq('status', 'published')
        .eq('is_public', true);

      if (error) {
        console.error('Erro ao buscar estatísticas:', error);
        throw error;
      }

      // Calcular estatísticas
      const uniqueCategories = new Set(data.map(item => item.category)).size;
      const uniqueLanguages = new Set(data.map(item => item.language)).size;
      const totalViews = data.reduce((sum, item) => sum + (item.view_count || 0), 0);
      const totalArticles = data.length;

      const stats = {
        categories: uniqueCategories,
        views: totalViews,
        languages: uniqueLanguages,
        articles: totalArticles,
        // Manter compatibilidade com versões anteriores
        total: totalArticles,
        by_type: data.reduce((acc: Record<string, number>, item) => {
          acc[item.content_type] = (acc[item.content_type] || 0) + 1;
          return acc;
        }, {}),
        by_category: data.reduce((acc: Record<string, number>, item) => {
          acc[item.category] = (acc[item.category] || 0) + 1;
          return acc;
        }, {}),
        total_views: totalViews,
      };

      return stats;
    },
  });
};

// Função para criar a função RPC no Supabase (deve ser executada no banco)
/*
CREATE OR REPLACE FUNCTION increment_knowledge_base_views(kb_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE knowledge_base 
  SET view_count = COALESCE(view_count, 0) + 1,
      updated_at = NOW()
  WHERE id = kb_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
*/