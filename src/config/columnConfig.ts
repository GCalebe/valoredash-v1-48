import { Contact } from "@/types/client";

// Definição de tipos para configuração de colunas
export interface ColumnConfig {
  id: string;
  label: string;
  accessor: keyof Contact | ((contact: Contact) => any);
  isVisible: boolean;
  priority: number; // Quanto menor, mais importante (usado para responsividade)
  minWidth?: number;
  maxWidth?: number;
  renderCell?: (contact: Contact) => React.ReactNode;
}

// Configuração padrão das colunas
export const defaultColumnConfig: ColumnConfig[] = [
  {
    id: "name",
    label: "Nome",
    accessor: "name",
    isVisible: true,
    priority: 1,
    minWidth: 150,
  },
  {
    id: "contact",
    label: "Contato",
    accessor: (contact) => ({ phone: contact.phone, email: contact.email }),
    isVisible: true,
    priority: 2,
    minWidth: 150,
  },
  {
    id: "clientName",
    label: "Cliente/Empresa",
    accessor: "clientName",
    isVisible: true,
    priority: 3,
    minWidth: 150,
  },
  {
    id: "tags",
    label: "Tags",
    accessor: "tags",
    isVisible: true,
    priority: 4,
    minWidth: 120,
  },
  {
    id: "consultationStage",
    label: "Estágio",
    accessor: "consultationStage",
    isVisible: true,
    priority: 5,
    minWidth: 120,
  },
  {
    id: "status",
    label: "Status",
    accessor: "status",
    isVisible: true,
    priority: 3,
    minWidth: 100,
  },
  {
    id: "kanbanStage",
    label: "Segmento",
    accessor: "kanbanStage",
    isVisible: true,
    priority: 4,
    minWidth: 120,
  },
  {
    id: "lastMessage",
    label: "Última Mensagem",
    accessor: (contact) => ({
      message: contact.lastMessage,
      time: contact.lastMessageTime || contact.lastContact,
      unreadCount: contact.unreadCount,
    }),
    isVisible: true,
    priority: 6,
    minWidth: 200,
  },
  {
    id: "budget",
    label: "Orçamento",
    accessor: "budget",
    isVisible: false,
    priority: 7,
    minWidth: 100,
  },
  {
    id: "clientObjective",
    label: "Objetivo",
    accessor: "clientObjective",
    isVisible: false,
    priority: 8,
    minWidth: 150,
  },
  {
    id: "responsibleUser",
    label: "Responsável",
    accessor: "responsibleUser",
    isVisible: false,
    priority: 7,
    minWidth: 120,
  },
];

// Função para obter configuração de colunas (com possibilidade de carregar do localStorage)
export const getColumnConfig = (): ColumnConfig[] => {
  try {
    const savedConfig = localStorage.getItem("clientTableColumnConfig");
    if (savedConfig) {
      return JSON.parse(savedConfig);
    }
  } catch (error) {
    console.error("Erro ao carregar configuração de colunas:", error);
  }
  return defaultColumnConfig;
};

// Função para salvar configuração de colunas
export const saveColumnConfig = (config: ColumnConfig[]): void => {
  try {
    localStorage.setItem("clientTableColumnConfig", JSON.stringify(config));
  } catch (error) {
    console.error("Erro ao salvar configuração de colunas:", error);
  }
};
