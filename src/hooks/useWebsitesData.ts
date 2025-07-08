import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Website {
  id: string;
  url: string;
  title: string;
  description: string;
  status: 'pending' | 'indexing' | 'indexed' | 'error';
  category: string;
  last_crawled: string | null;
  pages_indexed: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface CreateWebsiteData {
  url: string;
  title: string;
  description?: string;
  category?: string;
}

export interface UpdateWebsiteData {
  id: string;
  title?: string;
  description?: string;
  status?: Website['status'];
  category?: string;
  last_crawled?: string;
  pages_indexed?: number;
  is_active?: boolean;
}

// Query hook to fetch all websites
export const useWebsitesQuery = () => {
  return useQuery({
    queryKey: ['websites'],
    queryFn: async (): Promise<Website[]> => {
      const { data, error } = await supabase
        .from('websites')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching websites:', error);
        throw new Error('Erro ao carregar websites');
      }

      return data || [];
    },
  });
};

// Mutation hook to create a new website
export const useCreateWebsiteMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (websiteData: CreateWebsiteData): Promise<Website> => {
      const { data, error } = await supabase
        .from('websites')
        .insert({
          url: websiteData.url,
          title: websiteData.title,
          description: websiteData.description || 'Aguardando indexação...',
          category: websiteData.category || 'Geral',
          status: 'pending',
          pages_indexed: 0,
          is_active: true,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating website:', error);
        throw new Error('Erro ao adicionar website');
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['websites'] });
      toast.success('Website adicionado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao adicionar website');
    },
  });
};

// Mutation hook to update a website
export const useUpdateWebsiteMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (websiteData: UpdateWebsiteData): Promise<Website> => {
      const { id, ...updateData } = websiteData;
      
      const { data, error } = await supabase
        .from('websites')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating website:', error);
        throw new Error('Erro ao atualizar website');
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['websites'] });
      toast.success('Website atualizado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao atualizar website');
    },
  });
};

// Mutation hook to delete a website
export const useDeleteWebsiteMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (websiteId: string): Promise<void> => {
      const { error } = await supabase
        .from('websites')
        .delete()
        .eq('id', websiteId);

      if (error) {
        console.error('Error deleting website:', error);
        throw new Error('Erro ao remover website');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['websites'] });
      toast.success('Website removido com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao remover website');
    },
  });
};

// Mutation hook to simulate crawling/indexing process
export const useCrawlWebsiteMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (websiteId: string): Promise<void> => {
      // First, update status to 'indexing'
      await supabase
        .from('websites')
        .update({ 
          status: 'indexing',
          last_crawled: new Date().toISOString()
        })
        .eq('id', websiteId);

      // Simulate crawling process (in real implementation, this would trigger actual crawling)
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Update with final results
      const { error } = await supabase
        .from('websites')
        .update({ 
          status: 'indexed',
          pages_indexed: Math.floor(Math.random() * 50) + 5,
          description: 'Conteúdo indexado com sucesso'
        })
        .eq('id', websiteId);

      if (error) {
        throw new Error('Erro durante a indexação');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['websites'] });
      toast.success('Website indexado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro durante a indexação');
    },
  });
};