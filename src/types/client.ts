export interface Contact {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string;
  clientName?: string | null;
  client_name?: string | null;
  clientSize?: string | null;
  clientType?: string | null;
  cpfCnpj?: string | null;
  asaasCustomerId?: string | null;
  payments?: any;
  status?: "Active" | "Inactive" | string;
  notes?: string;
  lastContact?: string;
  kanbanStage?: string; // << aqui: permitir qualquer valor de stage
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
  sessionId?: string;
  session_id?: string;
  // Novos campos
  tags?: string[];
  responsibleUser?: string;
  sales?: number;
  clientSector?: string;
  budget?: number;
  paymentMethod?: string;
  clientObjective?: string;
  lossReason?: string;
  contractNumber?: string;
  contractDate?: string;
  payment?: string;
  uploadedFiles?: string[];
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
}

export interface CustomFieldValue {
  field_id: string;
  field_value: string | string[] | number | boolean | null;
}
