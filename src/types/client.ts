
export interface Contact {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string;
  avatar?: string; // Add missing avatar property
  
  // Cliente info
  clientName?: string | null;
  client_name?: string | null;
  clientSize?: string | null;
  clientType?: string | null;
  cpfCnpj?: string | null;
  asaasCustomerId?: string | null;
  
  // Status e estágio
  status?: "Active" | "Inactive" | string;
  kanbanStage?: string; // Optional - derived from kanban_stage_id
  kanban_stage_id?: string; // Database field name
  
  // Dados financeiros
  sales?: number;
  budget?: number;
  lead_value?: number;
  paymentMethod?: string;
  payment?: string;
  
  // Comunicação
  notes?: string;
  lastContact?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
  
  // Session/Chat
  sessionId?: string;
  session_id?: string;
  
  // Tags e categorização
  tags?: string[];
  responsibleUser?: string;
  clientSector?: string;
  clientObjective?: string;
  lossReason?: string;
  
  // Contratos
  contractNumber?: string;
  contractDate?: string;
  uploadedFiles?: string[];
  
  // Lead data
  conversion_probability?: number;
  lead_source?: string;
  last_interaction?: string;
  
  // Company data
  company?: string;
  position?: string;
  
  // Timestamps
  created_at?: string;
  updated_at?: string;
  
  // Estágio de consulta
  consultationStage?:
    | "Nova consulta"
    | "Qualificado"
    | "Chamada agendada"
    | "Preparando proposta"
    | "Proposta enviada"
    | "Acompanhamento"
    | "Negociação"
    | "Fatura enviada"
    | "Fatura paga – ganho"
    | "Projeto cancelado – perdido";
    
  // Campos personalizados
  customValues?: CustomFieldValue[];
  
  // Outros campos dinâmicos
  payments?: unknown;
}

export interface CustomFieldValue {
  field_id: string;
  field_value: string | string[] | number | boolean | null;
}
