
import { ScheduleEvent } from "@/hooks/useScheduleData";

export const mockScheduleData: Record<string, ScheduleEvent[]> = {
  all: [],
  corretor1: [
    {
      id: 1,
      title: "Consulta de Marketing Digital - João Silva",
      date: new Date(2025, 0, 2, 9, 0), // 02/01/2025 09:00
      time: "09:00",
      clientName: "João Silva",
      phone: "(11) 99999-1111",
      service: "Consultoria em Marketing Digital",
      status: "confirmado",
      notes: "Cliente interessado em campanhas Google Ads e Facebook Ads"
    },
    {
      id: 2,
      title: "Reunião de Planejamento - Maria Santos",
      date: new Date(2025, 0, 2, 14, 30), // 02/01/2025 14:30
      time: "14:30",
      clientName: "Maria Santos",
      phone: "(11) 98888-2222",
      service: "Planejamento Estratégico",
      status: "pendente",
      notes: "Primeira consulta - análise de necessidades"
    },
    {
      id: 3,
      title: "Follow-up - Pedro Costa",
      date: new Date(2025, 0, 3, 10, 0), // 03/01/2025 10:00
      time: "10:00",
      clientName: "Pedro Costa",
      phone: "(11) 97777-3333",
      service: "Acompanhamento de Resultados",
      status: "confirmado",
      notes: "Análise dos resultados da campanha do mês anterior"
    },
    {
      id: 4,
      title: "Apresentação de Proposta - Ana Lima",
      date: new Date(2025, 0, 4, 16, 0), // 04/01/2025 16:00
      time: "16:00",
      clientName: "Ana Lima",
      phone: "(11) 96666-4444",
      service: "Proposta Comercial",
      status: "confirmado",
      notes: "Apresentação da proposta de SEO e conteúdo"
    }
  ],
  corretor2: [
    {
      id: 5,
      title: "Consultoria E-commerce - Carlos Ferreira",
      date: new Date(2025, 0, 2, 8, 0), // 02/01/2025 08:00
      time: "08:00",
      clientName: "Carlos Ferreira",
      phone: "(11) 95555-5555",
      service: "Consultoria E-commerce",
      status: "confirmado",
      notes: "Otimização de loja virtual e estratégias de conversão"
    },
    {
      id: 6,
      title: "Treinamento Equipe - Fernanda Oliveira",
      date: new Date(2025, 0, 2, 11, 0), // 02/01/2025 11:00
      time: "11:00",
      clientName: "Fernanda Oliveira",
      phone: "(11) 94444-6666",
      service: "Treinamento de Equipe",
      status: "pendente",
      notes: "Capacitação da equipe em redes sociais"
    },
    {
      id: 7,
      title: "Auditoria Digital - Roberto Alves",
      date: new Date(2025, 0, 3, 13, 30), // 03/01/2025 13:30
      time: "13:30",
      clientName: "Roberto Alves",
      phone: "(11) 93333-7777",
      service: "Auditoria Digital",
      status: "confirmado",
      notes: "Análise completa da presença digital da empresa"
    },
    {
      id: 8,
      title: "Reunião Mensal - Juliana Ramos",
      date: new Date(2025, 0, 5, 9, 30), // 05/01/2025 09:30
      time: "09:30",
      clientName: "Juliana Ramos",
      phone: "(11) 92222-8888",
      service: "Acompanhamento Mensal",
      status: "confirmado",
      notes: "Revisão de métricas e planejamento do próximo mês"
    }
  ],
  corretor3: [
    {
      id: 9,
      title: "Criação de Identidade Visual - Lucas Martins",
      date: new Date(2025, 0, 2, 15, 0), // 02/01/2025 15:00
      time: "15:00",
      clientName: "Lucas Martins",
      phone: "(11) 91111-9999",
      service: "Branding e Design",
      status: "confirmado",
      notes: "Desenvolvimento de logotipo e identidade visual"
    },
    {
      id: 10,
      title: "Consultoria em Automação - Patricia Souza",
      date: new Date(2025, 0, 3, 8, 30), // 03/01/2025 08:30
      time: "08:30",
      clientName: "Patricia Souza",
      phone: "(11) 90000-1010",
      service: "Marketing Automation",
      status: "pendente",
      notes: "Implementação de funis de vendas automatizados"
    },
    {
      id: 11,
      title: "Workshop de Conteúdo - Diego Santos",
      date: new Date(2025, 0, 4, 10, 30), // 04/01/2025 10:30
      time: "10:30",
      clientName: "Diego Santos",
      phone: "(11) 89999-1111",
      service: "Content Marketing",
      status: "confirmado",
      notes: "Estratégias de conteúdo para LinkedIn e blog corporativo"
    },
    {
      id: 12,
      title: "Análise de Concorrência - Camila Torres",
      date: new Date(2025, 0, 6, 14, 0), // 06/01/2025 14:00
      time: "14:00",
      clientName: "Camila Torres",
      phone: "(11) 88888-1212",
      service: "Pesquisa de Mercado",
      status: "cancelado",
      notes: "Mapeamento da concorrência e oportunidades de mercado"
    }
  ]
};

// Combinar todos os dados para a opção "all"
mockScheduleData.all = [
  ...mockScheduleData.corretor1,
  ...mockScheduleData.corretor2,
  ...mockScheduleData.corretor3
];
