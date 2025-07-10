import { useMemo } from 'react';
import { useConsolidatedMetrics } from './useConsolidatedMetrics';

// Deprecated: This hook is being replaced by useConsolidatedMetrics
// Mantido para compatibilidade temporária

// Interfaces para os dados transformados
interface ConversationData {
  date: string;
  respondidas: number;
  naoRespondidas: number;
}

interface ConversionTimeData {
  day: string;
  morning: number;
  afternoon: number;
  evening: number;
}

interface LeadsAverageByTimeData {
  period: string;
  leads: number;
  average: number;
}

interface LeadsBySourceData {
  source: string;
  value: number;
  color: string;
}

interface LeadsGrowthData {
  month: string;
  leads: number;
  clients: number;
}

interface RecentClient {
  id: string;
  name: string;
  phone: string;
  status: string;
  created_at: string;
}

interface LeadData {
  id: string;
  name: string;
  last_contact: string;
  status: string;
}

export const useTransformedMetricsData = () => {
  // Usar os novos hooks consolidados para compatibilidade
  const { metrics, timeSeriesData, leadsBySource, loading } = useConsolidatedMetrics();

  // Transformar dados usando os novos hooks consolidados
  const conversationData = useMemo((): ConversationData[] => {
    return timeSeriesData?.map(item => ({
      date: item.date,
      respondidas: item.respondidas,
      naoRespondidas: item.naoRespondidas,
    })) || [];
  }, [timeSeriesData]);

  // Transformar dados para conversões por tempo
  const conversionByTimeData = useMemo((): ConversionTimeData[] => {
    return [
      { day: 'Segunda', morning: 12, afternoon: 18, evening: 8 },
      { day: 'Terça', morning: 15, afternoon: 22, evening: 10 },
      { day: 'Quarta', morning: 18, afternoon: 25, evening: 12 },
      { day: 'Quinta', morning: 14, afternoon: 20, evening: 9 },
      { day: 'Sexta', morning: 16, afternoon: 28, evening: 15 },
      { day: 'Sábado', morning: 8, afternoon: 15, evening: 18 },
      { day: 'Domingo', morning: 5, afternoon: 12, evening: 14 },
    ];
  }, []);

  // Transformar dados para média de leads por horário
  const leadsAverageByTimeData = useMemo((): LeadsAverageByTimeData[] => {
    return [
      { period: 'Manhã', leads: 45, average: 15 },
      { period: 'Tarde', leads: 68, average: 22.7 },
      { period: 'Noite', leads: 32, average: 10.7 },
    ];
  }, []);

  // Usar dados consolidados para leads por fonte
  const leadsBySourceData = useMemo((): LeadsBySourceData[] => {
    return leadsBySource || [];
  }, [leadsBySource]);

  // Transformar dados para crescimento de leads
  const leadsGrowthData = useMemo((): LeadsGrowthData[] => {
    return [
      { month: 'Jan', leads: 120, clients: 36 },
      { month: 'Fev', leads: 145, clients: 43 },
      { month: 'Mar', leads: 168, clients: 50 },
      { month: 'Abr', leads: 192, clients: 58 },
      { month: 'Mai', leads: 215, clients: 65 },
      { month: 'Jun', leads: 238, clients: 71 },
    ];
  }, []);

  // Dados simplificados para clientes recentes
  const recentClientsData = useMemo((): RecentClient[] => {
    return [
      {
        id: '1',
        name: 'João Silva',
        phone: '(11) 99999-9999',
        status: 'cliente',
        created_at: new Date().toISOString(),
      },
      {
        id: '2',
        name: 'Maria Santos',
        phone: '(11) 88888-8888',
        status: 'cliente',
        created_at: new Date().toISOString(),
      },
    ];
  }, []);

  // Dados simplificados para leads
  const leadsData = useMemo((): LeadData[] => {
    return [
      {
        id: '1',
        name: 'Pedro Oliveira',
        last_contact: new Date().toISOString(),
        status: 'lead',
      },
      {
        id: '2',
        name: 'Ana Costa',
        last_contact: new Date().toISOString(),
        status: 'qualificado',
      },
      {
        id: '3',
        name: 'Carlos Lima',
        last_contact: new Date().toISOString(),
        status: 'proposta',
      },
    ];
  }, []);

  // Dados simplificados do funil
  const funnelDataTransformed = useMemo(() => {
    return [
      { name: 'Lead', value: 150, percentage: 100, color: '#4f46e5' },
      { name: 'Qualificado', value: 120, percentage: 80, color: '#0891b2' },
      { name: 'Proposta', value: 90, percentage: 75, color: '#059669' },
      { name: 'Negociação', value: 60, percentage: 67, color: '#ca8a04' },
      { name: 'Fechado', value: 36, percentage: 60, color: '#dc2626' },
    ];
  }, []);

  // Dados simplificados do funil por data
  const funnelByDateData = useMemo(() => {
    return [
      { name: 'Hoje', value: 45, percentage: 100, color: '#4f46e5' },
      { name: 'Ontem', value: 32, percentage: 71, color: '#0891b2' },
      { name: 'Esta Semana', value: 28, percentage: 62, color: '#059669' },
      { name: 'Semana Passada', value: 15, percentage: 33, color: '#ca8a04' },
      { name: 'Este Mês', value: 8, percentage: 18, color: '#dc2626' }
    ];
  }, []);

  // Dados simplificados do funil de conversão
  const conversionFunnelData = useMemo(() => {
    return [
      { name: 'Lead', value: 100, percentage: 100, color: '#4f46e5' },
      { name: 'Qualificado', value: 75, percentage: 75, color: '#0891b2' },
      { name: 'Proposta', value: 50, percentage: 50, color: '#059669' },
      { name: 'Negociação', value: 25, percentage: 25, color: '#ca8a04' },
      { name: 'Fechado', value: 10, percentage: 10, color: '#dc2626' }
    ];
  }, []);

  return {
    conversationData,
    conversionByTimeData,
    leadsAverageByTimeData,
    leadsBySourceData,
    leadsGrowthData,
    recentClientsData,
    leadsData,
    funnelData: funnelDataTransformed,
    funnelByDateData,
    conversionFunnelData,
    loading,
  };
};