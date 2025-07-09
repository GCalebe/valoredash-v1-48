import { ScheduleEvent } from "@/hooks/useScheduleData";

export const mockScheduleData: Record<string, ScheduleEvent[]> = {
  all: [],
  corretor1: [
    {
      id: "1",
      title: "Consulta de Marketing Digital - João Silva",
      start_time: "2025-01-02T09:00:00",
      end_time: "2025-01-02T10:00:00",
      status: "confirmado",
      date: new Date("2025-01-02T09:00:00"),
      clientName: "João Silva",
      phone: "+55 11 99999-9999",
      service: "Marketing Digital",
      notes: "Consulta sobre estratégias de marketing digital"
    },
    {
      id: "2",
      title: "Reunião de Planejamento - Maria Santos",
      start_time: "2025-01-02T14:30:00",
      end_time: "2025-01-02T15:30:00",
      status: "pendente",
      date: new Date("2025-01-02T14:30:00"),
      clientName: "Maria Santos",
      phone: "+55 11 88888-8888",
      service: "Planejamento",
      notes: "Reunião para definir estratégias"
    },
    {
      id: "3",
      title: "Follow-up - Pedro Costa",
      start_time: "2025-01-03T10:00:00",
      end_time: "2025-01-03T11:00:00",
      status: "confirmado",
      date: new Date("2025-01-03T10:00:00"),
      clientName: "Pedro Costa",
      phone: "+55 11 77777-7777",
      service: "Follow-up",
      notes: "Acompanhamento do projeto"
    },
    {
      id: "4",
      title: "Apresentação de Proposta - Ana Lima",
      start_time: "2025-01-04T16:00:00",
      end_time: "2025-01-04T17:00:00",
      status: "confirmado",
      date: new Date("2025-01-04T16:00:00"),
      clientName: "Ana Lima",
      phone: "+55 11 66666-6666",
      service: "Apresentação",
      notes: "Apresentação da proposta final"
    }
  ],
  corretor2: [
    {
      id: "5",
      title: "Consultoria E-commerce - Carlos Ferreira",
      start_time: "2025-01-02T08:00:00",
      end_time: "2025-01-02T09:00:00",
      status: "confirmado",
      date: new Date("2025-01-02T08:00:00"),
      clientName: "Carlos Ferreira",
      phone: "+55 11 55555-5555",
      service: "E-commerce",
      notes: "Consultoria para loja virtual"
    },
    {
      id: "6",
      title: "Treinamento Equipe - Fernanda Oliveira",
      start_time: "2025-01-02T11:00:00",
      end_time: "2025-01-02T12:00:00",
      status: "pendente",
      date: new Date("2025-01-02T11:00:00"),
      clientName: "Fernanda Oliveira",
      phone: "+55 11 44444-4444",
      service: "Treinamento",
      notes: "Treinamento da equipe de vendas"
    },
    {
      id: "7",
      title: "Auditoria Digital - Roberto Alves",
      start_time: "2025-01-03T13:30:00",
      end_time: "2025-01-03T14:30:00",
      status: "confirmado",
      date: new Date("2025-01-03T13:30:00"),
      clientName: "Roberto Alves",
      phone: "+55 11 33333-3333",
      service: "Auditoria",
      notes: "Auditoria dos processos digitais"
    },
    {
      id: "8",
      title: "Reunião Mensal - Juliana Ramos",
      start_time: "2025-01-05T09:30:00",
      end_time: "2025-01-05T10:30:00",
      status: "confirmado",
      date: new Date("2025-01-05T09:30:00"),
      clientName: "Juliana Ramos",
      phone: "+55 11 22222-2222",
      service: "Reunião",
      notes: "Reunião mensal de acompanhamento"
    }
  ],
  corretor3: [
    {
      id: "9",
      title: "Criação de Identidade Visual - Lucas Martins",
      start_time: "2025-01-02T15:00:00",
      end_time: "2025-01-02T16:00:00",
      status: "confirmado",
      date: new Date("2025-01-02T15:00:00"),
      clientName: "Lucas Martins",
      phone: "+55 11 11111-1111",
      service: "Design",
      notes: "Criação da identidade visual"
    },
    {
      id: "10",
      title: "Consultoria em Automação - Patricia Souza",
      start_time: "2025-01-03T08:30:00",
      end_time: "2025-01-03T09:30:00",
      status: "pendente",
      date: new Date("2025-01-03T08:30:00"),
      clientName: "Patricia Souza",
      phone: "+55 11 99999-0000",
      service: "Automação",
      notes: "Consultoria sobre automação de processos"
    },
    {
      id: "11",
      title: "Workshop de Conteúdo - Diego Santos",
      start_time: "2025-01-04T10:30:00",
      end_time: "2025-01-04T11:30:00",
      status: "confirmado",
      date: new Date("2025-01-04T10:30:00"),
      clientName: "Diego Santos",
      phone: "+55 11 88888-0000",
      service: "Workshop",
      notes: "Workshop sobre criação de conteúdo"
    },
    {
      id: "12",
      title: "Análise de Concorrência - Camila Torres",
      start_time: "2025-01-06T14:00:00",
      end_time: "2025-01-06T15:00:00",
      status: "cancelado",
      date: new Date("2025-01-06T14:00:00"),
      clientName: "Camila Torres",
      phone: "+55 11 77777-0000",
      service: "Análise",
      notes: "Análise da concorrência no mercado"
    }
  ]
};

// Combinar todos os dados para a opção "all"
mockScheduleData.all = [
  ...mockScheduleData.corretor1,
  ...mockScheduleData.corretor2,
  ...mockScheduleData.corretor3
];