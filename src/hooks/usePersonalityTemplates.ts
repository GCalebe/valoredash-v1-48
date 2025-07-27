import { useQuery } from "@tanstack/react-query";
import { aiPersonalityTemplates, getTemplateById, type AIPersonalityTemplate } from "@/data/aiPersonalityTemplates";



export const usePersonalityTemplates = () => {
  return useQuery({
    queryKey: ['personality-templates'],
    queryFn: async (): Promise<AIPersonalityTemplate[]> => {
      // Simular um pequeno atraso para manter a experiência de carregamento
      await new Promise(resolve => setTimeout(resolve, 100));
      return aiPersonalityTemplates;
    },
    staleTime: Infinity, // Dados estáticos, não precisam ser revalidados
    gcTime: Infinity, // Manter em cache indefinidamente
  });
};

export const usePersonalityTemplateById = (id: string) => {
  return useQuery({
    queryKey: ['personality-template', id],
    queryFn: async (): Promise<AIPersonalityTemplate | null> => {
      if (!id) return null;
      
      // Simular um pequeno atraso para manter a experiência de carregamento
      await new Promise(resolve => setTimeout(resolve, 50));
      return getTemplateById(id) || null;
    },
    enabled: !!id,
    staleTime: Infinity, // Dados estáticos, não precisam ser revalidados
    gcTime: Infinity, // Manter em cache indefinidamente
  });
};