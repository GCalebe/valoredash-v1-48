
import { ScheduleEvent } from "@/hooks/useScheduleData";

export const mockScheduleData: Record<string, ScheduleEvent[]> = {
  all: [],
  corretor1: [
    {
      id: "1",
      title: "Consulta de Marketing Digital - João Silva",
      start_time: "2025-01-02T09:00:00",
      end_time: "2025-01-02T10:00:00",
      status: "confirmado"
    },
    {
      id: "2",
      title: "Reunião de Planejamento - Maria Santos",
      start_time: "2025-01-02T14:30:00",
      end_time: "2025-01-02T15:30:00",
      status: "pendente"
    },
    {
      id: "3",
      title: "Follow-up - Pedro Costa",
      start_time: "2025-01-03T10:00:00",
      end_time: "2025-01-03T11:00:00",
      status: "confirmado"
    },
    {
      id: "4",
      title: "Apresentação de Proposta - Ana Lima",
      start_time: "2025-01-04T16:00:00",
      end_time: "2025-01-04T17:00:00",
      status: "confirmado"
    }
  ],
  corretor2: [
    {
      id: "5",
      title: "Consultoria E-commerce - Carlos Ferreira",
      start_time: "2025-01-02T08:00:00",
      end_time: "2025-01-02T09:00:00",
      status: "confirmado"
    },
    {
      id: "6",
      title: "Treinamento Equipe - Fernanda Oliveira",
      start_time: "2025-01-02T11:00:00",
      end_time: "2025-01-02T12:00:00",
      status: "pendente"
    },
    {
      id: "7",
      title: "Auditoria Digital - Roberto Alves",
      start_time: "2025-01-03T13:30:00",
      end_time: "2025-01-03T14:30:00",
      status: "confirmado"
    },
    {
      id: "8",
      title: "Reunião Mensal - Juliana Ramos",
      start_time: "2025-01-05T09:30:00",
      end_time: "2025-01-05T10:30:00",
      status: "confirmado"
    }
  ],
  corretor3: [
    {
      id: "9",
      title: "Criação de Identidade Visual - Lucas Martins",
      start_time: "2025-01-02T15:00:00",
      end_time: "2025-01-02T16:00:00",
      status: "confirmado"
    },
    {
      id: "10",
      title: "Consultoria em Automação - Patricia Souza",
      start_time: "2025-01-03T08:30:00",
      end_time: "2025-01-03T09:30:00",
      status: "pendente"
    },
    {
      id: "11",
      title: "Workshop de Conteúdo - Diego Santos",
      start_time: "2025-01-04T10:30:00",
      end_time: "2025-01-04T11:30:00",
      status: "confirmado"
    },
    {
      id: "12",
      title: "Análise de Concorrência - Camila Torres",
      start_time: "2025-01-06T14:00:00",
      end_time: "2025-01-06T15:00:00",
      status: "cancelado"
    }
  ]
};

// Combinar todos os dados para a opção "all"
mockScheduleData.all = [
  ...mockScheduleData.corretor1,
  ...mockScheduleData.corretor2,
  ...mockScheduleData.corretor3
];
