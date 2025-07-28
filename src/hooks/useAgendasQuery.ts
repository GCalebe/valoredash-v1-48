import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Agenda {
  id: string;
  name: string;
  // Adicione outros campos da agenda se necessário
}

// Query keys
export const agendaKeys = {
  all: ['agendas'] as const,
  lists: () => [...agendaKeys.all, 'list'] as const,
};

// Fetch Agendas
const fetchAgendas = async (): Promise<Agenda[]> => {
  // Assumindo que o nome da sua tabela de agendas é 'agendas'
  // e que o usuário logado só pode ver as suas próprias agendas.
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('agendas')
    .select('id, name') // Puxando apenas id e nome para o seletor
    .eq('created_by', user.id);

  if (error) {
    console.error('Error fetching agendas:', error);
    throw error;
  }
  
  return data || [];
};

// Hook
export const useAgendasQuery = () => {
  return useQuery({
    queryKey: agendaKeys.lists(),
    queryFn: fetchAgendas,
  });
};
