// Mock data for the metrics dashboard

export interface ClientStats {
  totalClients: number;
  totalChats: number;
  newClientsThisMonth: number;
  monthlyGrowth: Array<{ month: string; clients: number }>;
  ChatBreeds: Array<{ name: string; value: number; color: string }>;
  recentClients: Array<{
    id: number;
    name: string;
    phone: string;
    Chats: number;
    lastVisit: string;
  }>;
}

export interface ConversationMetrics {
  totalConversations: number;
  responseRate: number;
  totalRespondidas: number;
  avgResponseTime: number;
  conversionRate: number;
  avgClosingTime: number;
  avgResponseStartTime: number; // Nova métrica em minutos
  conversationData: Array<{
    date: string;
    respondidas: number;
    naoRespondidas: number;
  }>;
  funnelData: Array<{ name: string; value: number; percentage: number }>;
  conversionByTimeData: Array<{
    day: string;
    morning: number;
    afternoon: number;
    evening: number;
  }>;
  leadsAverageByTimeData: Array<{
    day: string;
    morning: number;
    afternoon: number;
    evening: number;
  }>; // Nova métrica
  leadsData: Array<{
    id: string;
    name: string;
    lastContact: string;
    status: string;
    value: number;
  }>;
  secondaryResponseRate: number;
  totalSecondaryResponses: number;
  negotiatedValue: number;
  averageNegotiatedValue: number;
  totalNegotiatingValue: number;
  previousPeriodValue: number;
  leadsBySource: Array<{ name: string; value: number; color: string }>;
  leadsOverTime: Array<{ month: string; clients: number; leads: number }>;
  leadsByArrivalFunnel: Array<{
    name: string;
    value: number;
    percentage: number;
    color: string;
  }>;
  isStale: boolean;
}

export interface UTMMetrics {
  totalCampaigns: number;
  totalLeads: number;
  conversionRate: number;
  campaignData: Array<{
    name: string;
    leads: number;
    conversions: number;
    value: number;
  }>;
  sourceData: Array<{ name: string; leads: number; conversions: number }>;
  deviceData: Array<{ name: string; value: number }>;
  geoData: Array<{ location: string; leads: number; conversions: number }>;
  timeToConversion: {
    average: number;
    median: number;
    min: number;
    max: number;
  };
  topCampaigns: Array<{
    campaign: string;
    count: number;
    conversions: number;
    value: number;
    ctr: number;
    roas: number;
  }>;
  recentTracking: Array<any>; // simplified
  isStale: boolean;
}

export const mockClientStats: ClientStats = {
  totalClients: 120,
  totalChats: 250,
  newClientsThisMonth: 15,
  monthlyGrowth: [
    { month: "Jan", clients: 8 },
    { month: "Fev", clients: 10 },
    { month: "Mar", clients: 12 },
    { month: "Abr", clients: 14 },
    { month: "Mai", clients: 11 },
    { month: "Jun", clients: 9 },
    { month: "Jul", clients: 10 },
    { month: "Ago", clients: 8 },
    { month: "Set", clients: 12 },
    { month: "Out", clients: 7 },
    { month: "Nov", clients: 6 },
    { month: "Dez", clients: 13 },
  ],
  ChatBreeds: [
    { name: "Labrador", value: 10, color: "#8B5CF6" },
    { name: "Pug", value: 7, color: "#EC4899" },
    { name: "Vira-lata", value: 5, color: "#10B981" },
  ],
  recentClients: [
    {
      id: 1,
      name: "João Silva",
      phone: "(11) 98765-4321",
      Chats: 1,
      lastVisit: "01/04/2024",
    },
    {
      id: 2,
      name: "Maria Oliveira",
      phone: "(11) 91234-5678",
      Chats: 1,
      lastVisit: "05/04/2024",
    },
    {
      id: 3,
      name: "Pedro Santos",
      phone: "(11) 99876-5432",
      Chats: 2,
      lastVisit: "08/04/2024",
    },
  ],
};

export const mockConversationMetrics: ConversationMetrics = {
  totalConversations: 340,
  responseRate: 85,
  totalRespondidas: 289,
  avgResponseTime: 2,
  conversionRate: 30,
  avgClosingTime: 5,
  avgResponseStartTime: 45, // 45 minutos para primeira resposta
  conversationData: [
    { date: "Seg", respondidas: 40, naoRespondidas: 5 },
    { date: "Ter", respondidas: 45, naoRespondidas: 8 },
    { date: "Qua", respondidas: 50, naoRespondidas: 9 },
    { date: "Qui", respondidas: 55, naoRespondidas: 12 },
    { date: "Sex", respondidas: 60, naoRespondidas: 10 },
    { date: "Sáb", respondidas: 25, naoRespondidas: 6 },
    { date: "Dom", respondidas: 14, naoRespondidas: 1 },
  ],
  funnelData: [
    { name: "Entraram", value: 340, percentage: 100 },
    { name: "Contato", value: 250, percentage: 74 },
    { name: "Reunião", value: 150, percentage: 44 },
    { name: "Fechamento", value: 100, percentage: 29 },
  ],
  conversionByTimeData: [
    { day: "Segunda", morning: 12, afternoon: 18, evening: 5 },
    { day: "Terça", morning: 14, afternoon: 20, evening: 6 },
    { day: "Quarta", morning: 16, afternoon: 22, evening: 7 },
    { day: "Quinta", morning: 18, afternoon: 24, evening: 8 },
    { day: "Sexta", morning: 20, afternoon: 26, evening: 9 },
    { day: "Sábado", morning: 10, afternoon: 15, evening: 12 },
    { day: "Domingo", morning: 8, afternoon: 10, evening: 7 },
  ],
  leadsAverageByTimeData: [
    { day: "Segunda", morning: 8, afternoon: 15, evening: 4 },
    { day: "Terça", morning: 10, afternoon: 18, evening: 5 },
    { day: "Quarta", morning: 12, afternoon: 20, evening: 6 },
    { day: "Quinta", morning: 14, afternoon: 22, evening: 7 },
    { day: "Sexta", morning: 16, afternoon: 24, evening: 8 },
    { day: "Sábado", morning: 6, afternoon: 12, evening: 10 },
    { day: "Domingo", morning: 4, afternoon: 8, evening: 6 },
  ],
  leadsData: [
    {
      id: "1",
      name: "Empresa Alpha",
      lastContact: "01/04/2024",
      status: "Contato Feito",
      value: 0,
    },
    {
      id: "2",
      name: "Empresa Beta",
      lastContact: "03/04/2024",
      status: "Reunião",
      value: 0,
    },
    {
      id: "3",
      name: "Empresa Gamma",
      lastContact: "07/04/2024",
      status: "Fechamento",
      value: 0,
    },
  ],
  secondaryResponseRate: 70,
  totalSecondaryResponses: 200,
  negotiatedValue: 50000,
  averageNegotiatedValue: 16666,
  totalNegotiatingValue: 125000,
  previousPeriodValue: 42000,
  leadsBySource: [
    { name: "Facebook", value: 80, color: "#3B82F6" },
    { name: "Google", value: 60, color: "#10B981" },
    { name: "Indicação", value: 30, color: "#F59E0B" },
  ],
  leadsOverTime: [
    { month: "Jan", clients: 5, leads: 15 },
    { month: "Fev", clients: 6, leads: 18 },
    { month: "Mar", clients: 7, leads: 20 },
    { month: "Abr", clients: 8, leads: 22 },
    { month: "Mai", clients: 9, leads: 24 },
    { month: "Jun", clients: 10, leads: 26 },
  ],
  leadsByArrivalFunnel: [
    { name: "Últimas 24h", value: 20, percentage: 20, color: "#10B981" },
    { name: "Últimos 7 dias", value: 40, percentage: 40, color: "#3B82F6" },
    { name: "Últimos 30 dias", value: 30, percentage: 30, color: "#8B5CF6" },
    { name: "Mais antigos", value: 10, percentage: 10, color: "#F59E0B" },
  ],
  isStale: false,
};

export const mockUTMMetrics: UTMMetrics = {
  totalCampaigns: 5,
  totalLeads: 60,
  conversionRate: 25,
  campaignData: [
    { name: "verao2024", leads: 30, conversions: 10, value: 5000 },
    { name: "inverno2024", leads: 20, conversions: 5, value: 3000 },
    { name: "black_friday", leads: 10, conversions: 5, value: 4000 },
  ],
  sourceData: [
    { name: "facebook", leads: 25, conversions: 8 },
    { name: "google", leads: 20, conversions: 7 },
    { name: "instagram", leads: 15, conversions: 5 },
  ],
  deviceData: [
    { name: "mobile", value: 35 },
    { name: "desktop", value: 25 },
  ],
  geoData: [
    { location: "São Paulo, BR", leads: 20, conversions: 5 },
    { location: "Rio de Janeiro, BR", leads: 15, conversions: 4 },
    { location: "Belo Horizonte, BR", leads: 10, conversions: 3 },
  ],
  timeToConversion: { average: 24, median: 20, min: 5, max: 72 },
  topCampaigns: [
    {
      campaign: "verao2024",
      count: 30,
      conversions: 10,
      value: 5000,
      ctr: 3,
      roas: 400,
    },
    {
      campaign: "inverno2024",
      count: 20,
      conversions: 5,
      value: 3000,
      ctr: 2.5,
      roas: 250,
    },
    {
      campaign: "black_friday",
      count: 10,
      conversions: 5,
      value: 4000,
      ctr: 5,
      roas: 600,
    },
  ],
  recentTracking: [
    {
      id: "1",
      lead_id: "L1",
      utm_source: "facebook",
      utm_medium: "cpc",
      utm_campaign: "verao2024",
      utm_term: "marketing",
      utm_content: "anuncio1",
      utm_created_at: new Date().toISOString(),
      utm_conversion: true,
      utm_conversion_value: 500,
      utm_conversion_stage: "Fechamento",
      landing_page: "/",
      device_type: "mobile",
    },
  ],
  isStale: false,
};
