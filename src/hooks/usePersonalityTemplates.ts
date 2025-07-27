import { useQuery } from '@tanstack/react-query';
import { aiPersonalityTemplates, type AIPersonalityTemplate } from '@/data/aiPersonalityTemplates';

export type { AIPersonalityTemplate };

export const usePersonalityTemplates = () => {
  return useQuery({
    queryKey: ['personality-templates'],
    queryFn: async (): Promise<AIPersonalityTemplate[]> => {
      // Simular um pequeno delay para manter a experiência de loading
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Retornar os templates mockados
      return aiPersonalityTemplates;
    },
    staleTime: Infinity, // Os dados nunca ficam obsoletos pois são estáticos
    gcTime: Infinity, // Manter em cache indefinidamente
  });
};

export const usePersonalityTemplateById = (id: string) => {
  return useQuery({
    queryKey: ['personality-template', id],
    queryFn: async (): Promise<AIPersonalityTemplate | null> => {
      if (!id) return null;
      
      // Simular um pequeno delay para manter a experiência de loading
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Buscar o template nos dados mockados
      const template = aiPersonalityTemplates.find(t => t.id === id);
      return template || null;
    },
    enabled: !!id,
    staleTime: Infinity, // Os dados nunca ficam obsoletos pois são estáticos
    gcTime: Infinity, // Manter em cache indefinidamente
  });
};