import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { AIPersonalityTemplate } from "@/data/aiPersonalityTemplates";

interface DatabasePersonality {
  id: string;
  name: string;
  description: string | null;
  personality_type: string;
  tone: string | null;
  temperature: number | null;
  greeting_message: string | null;
  custom_instructions: string | null;
  max_tokens: number | null;
  response_style: string | null;
  language: string | null;
  is_active: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}

const mapDatabaseToTemplate = (dbPersonality: DatabasePersonality): AIPersonalityTemplate => {
  // Mapear ícones baseado no nome ou categoria
  const getIconByName = (name: string): string => {
    if (name.includes('Amigável')) return '😊';
    if (name.includes('Profissional') || name.includes('Consultor')) return '💼';
    if (name.includes('Criativo') || name.includes('Mentor')) return '🎨';
    if (name.includes('Saúde') || name.includes('Coach')) return '🏃‍♀️';
    if (name.includes('Tech') || name.includes('Tecnologia')) return '💻';
    if (name.includes('Empático') || name.includes('Ouvinte')) return '💝';
    return '🤖'; // Ícone padrão
  };

  const getCategoryByName = (name: string): string => {
    if (name.includes('Amigável')) return 'Atendimento';
    if (name.includes('Profissional') || name.includes('Consultor')) return 'Negócios';
    if (name.includes('Criativo') || name.includes('Mentor')) return 'Criatividade';
    if (name.includes('Saúde') || name.includes('Coach')) return 'Saúde';
    if (name.includes('Tech') || name.includes('Tecnologia')) return 'Tecnologia';
    if (name.includes('Empático') || name.includes('Ouvinte')) return 'Apoio';
    return 'Geral';
  };

  return {
    id: dbPersonality.id,
    name: dbPersonality.name,
    description: dbPersonality.description || '',
    icon: getIconByName(dbPersonality.name),
    category: getCategoryByName(dbPersonality.name),
    settings: {
      tone: dbPersonality.tone || 'neutro',
      personality_type: dbPersonality.personality_type,
      temperature: dbPersonality.temperature || 0.5,
      greeting_message: dbPersonality.greeting_message || 'Olá! Como posso ajudá-lo?',
      custom_instructions: dbPersonality.custom_instructions || '',
      max_tokens: dbPersonality.max_tokens || 150,
      response_style: dbPersonality.response_style || 'conversacional',
      language: dbPersonality.language || 'pt-BR'
    }
  };
};

export const usePersonalityTemplates = () => {
  return useQuery({
    queryKey: ['personality-templates'],
    queryFn: async (): Promise<AIPersonalityTemplate[]> => {
      const { data, error } = await supabase
        .from('ai_personalities')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Erro ao buscar templates de personalidade:', error);
        throw error;
      }

      return (data || []).map(mapDatabaseToTemplate);
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    cacheTime: 10 * 60 * 1000, // 10 minutos
  });
};

export const usePersonalityTemplateById = (id: string) => {
  return useQuery({
    queryKey: ['personality-template', id],
    queryFn: async (): Promise<AIPersonalityTemplate | null> => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('ai_personalities')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('Erro ao buscar template de personalidade:', error);
        throw error;
      }

      return data ? mapDatabaseToTemplate(data) : null;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });
};