// Campos fixos do contato/cliente (sincronizados com schema do banco)
export const fixedClientProperties = [
  // === CATEGORIA: BÁSICO ===
  { id: "name", name: "Nome", type: "text", dbField: "name", category: "basic" },
  { id: "email", name: "Email", type: "text", dbField: "email", category: "basic" },
  { id: "phone", name: "Telefone", type: "text", dbField: "phone", category: "basic" },
  { id: "created_at", name: "Data de Criação", type: "date", dbField: "created_at", category: "basic" },
  { id: "updated_at", name: "Última Atualização", type: "date", dbField: "updated_at", category: "basic" },

  // === CATEGORIA: KANBAN ===
  { id: "kanban_stage_id", name: "Etapa do Kanban", type: "kanban_stage", dbField: "kanban_stage_id", category: "kanban" },
  { 
    id: "consultation_stage", 
    name: "Estágio de Consulta", 
    type: "select", 
    dbField: "consultation_stage", 
    category: "kanban",
    options: [
      "Nova consulta",
      "Qualificado", 
      "Chamada agendada",
      "Preparando proposta",
      "Proposta enviada",
      "Acompanhamento",
      "Negociação",
      "Fatura enviada",
      "Fatura paga – ganho",
      "Projeto cancelado – perdido"
    ]
  },
  { id: "tags", name: "Tags", type: "multi_select", dbField: "tags", category: "kanban" },
  { id: "responsible_hosts", name: "Responsáveis", type: "multi_select", dbField: "responsible_hosts", category: "kanban" },

  // === CATEGORIA: COMERCIAL ===
  { id: "client_name", name: "Nome do Cliente", type: "text", dbField: "client_name", category: "commercial" },
  { id: "client_size", name: "Porte do Cliente", type: "select", dbField: "client_size", options: ["Pequeno", "Médio", "Grande"], category: "commercial" },
  { id: "client_type", name: "Tipo do Cliente", type: "text", dbField: "client_type", category: "commercial" },
  { id: "sales", name: "Vendas", type: "number", dbField: "sales", category: "commercial" },
  { id: "budget", name: "Orçamento", type: "number", dbField: "budget", category: "commercial" },
  { id: "payment_method", name: "Método de Pagamento", type: "text", dbField: "payment_method", category: "commercial" },
  { 
    id: "status",
    name: "Status",
    type: "select",
    dbField: "status",
    category: "commercial",
    options: ["Active", "Inactive", "Ganhos", "Perdidos", "Em Andamento", "Qualificado", "Não Qualificado"]
  },

  // === CATEGORIA: TEMPORAL ===
  { id: "last_contact", name: "Último Contato", type: "date", dbField: "last_contact", category: "temporal" },
  { id: "last_message_time", name: "Última Mensagem", type: "date", dbField: "last_message_time", category: "temporal" },
  { id: "contract_date", name: "Data do Contrato", type: "date", dbField: "contract_date", category: "temporal" },

  // === CATEGORIA: DOCUMENTOS/IDENTIFICAÇÃO ===
  { id: "cpf_cnpj", name: "CPF/CNPJ", type: "text", dbField: "cpf_cnpj", category: "documents" },
  { id: "session_id", name: "ID da Sessão", type: "text", dbField: "session_id", category: "documents" },
  { id: "asaas_customer_id", name: "ID Cliente Asaas", type: "text", dbField: "asaas_customer_id", category: "documents" },
  { id: "contract_number", name: "Número do Contrato", type: "text", dbField: "contract_number", category: "documents" },

  // === CATEGORIA: PERSONALIZADOS (PET - EXEMPLO) ===
  { id: "nome_pet", name: "Nome do Pet", type: "text", dbField: "nome_pet", category: "personalized" },
  { id: "raca_pet", name: "Raça do Pet", type: "text", dbField: "raca_pet", category: "personalized" },
  { id: "porte_pet", name: "Porte do Pet", type: "select", dbField: "porte_pet", options: ["Pequeno", "Médio", "Grande"], category: "personalized" },
];

// Lista de tags disponíveis
export const availableTags = [
  "Entraram",
  "Conversaram",
  "Agendaram",
  "Compareceram",
  "Negociaram",
  "Postergaram",
  "Converteram",
];

// Operadores de comparação disponíveis por tipo de campo
export const operatorsByType = {
  text: [
    { id: "equals", name: "é igual a" },
    { id: "contains", name: "contém" },
    { id: "starts_with", name: "começa com" },
    { id: "ends_with", name: "termina com" },
    { id: "not_equals", name: "não é igual a" },
    { id: "not_contains", name: "não contém" },
    { id: "is_empty", name: "está vazio" },
    { id: "is_not_empty", name: "não está vazio" },
  ],
  select: [
    { id: "equals", name: "é igual a" },
    { id: "not_equals", name: "não é igual a" },
    { id: "in", name: "está em" },
    { id: "not_in", name: "não está em" },
  ],
  multi_select: [
    { id: "contains", name: "contém" },
    { id: "not_contains", name: "não contém" },
    { id: "contains_all", name: "contém todos" },
    { id: "contains_any", name: "contém qualquer" },
    { id: "is_empty", name: "está vazio" },
    { id: "is_not_empty", name: "não está vazio" },
  ],
  number: [
    { id: "equals", name: "é igual a" },
    { id: "not_equals", name: "não é igual a" },
    { id: "greater_than", name: "é maior que" },
    { id: "greater_than_or_equal", name: "é maior ou igual a" },
    { id: "less_than", name: "é menor que" },
    { id: "less_than_or_equal", name: "é menor ou igual a" },
    { id: "between", name: "está entre" },
    { id: "is_empty", name: "está vazio" },
    { id: "is_not_empty", name: "não está vazio" },
  ],
  date: [
    { id: "equals", name: "é igual a" },
    { id: "not_equals", name: "não é igual a" },
    { id: "before", name: "é antes de" },
    { id: "after", name: "é depois de" },
    { id: "between", name: "está entre" },
    { id: "last_days", name: "últimos X dias" },
    { id: "next_days", name: "próximos X dias" },
    { id: "is_empty", name: "está vazio" },
    { id: "is_not_empty", name: "não está vazio" },
  ],
  kanban_stage: [
    { id: "equals", name: "é igual a" },
    { id: "not_equals", name: "não é igual a" },
    { id: "in", name: "está em" },
    { id: "not_in", name: "não está em" },
  ],
};

// Tipos de condição para grupos
export type ConditionType = "AND" | "OR";

// Categorias de campos para organização
export const fieldCategories = {
  basic: { name: "Básico", icon: "User", description: "Informações básicas do contato" },
  kanban: { name: "Kanban", icon: "Columns", description: "Status e etapas do processo" },
  commercial: { name: "Comercial", icon: "DollarSign", description: "Dados comerciais e vendas" },
  temporal: { name: "Temporal", icon: "Calendar", description: "Datas e histórico temporal" },
  documents: { name: "Documentos", icon: "FileText", description: "Identificação e documentos" },
  personalized: { name: "Personalizados", icon: "Settings", description: "Campos específicos do negócio" }
} as const;

// Interface para representar um registro de cliente (sincronizada com schema do banco)
export interface ClientRecord {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  client_name?: string;
  client_size?: string;
  client_type?: string;
  cpf_cnpj?: string;
  status: string;
  kanban_stage_id?: string;
  consultation_stage?: string;
  session_id?: string;
  asaas_customer_id?: string;
  contract_number?: string;
  nome_pet?: string;
  raca_pet?: string;
  porte_pet?: string;
  created_at?: string;
  updated_at?: string;
  last_contact?: string;
  last_message_time?: string;
  contract_date?: string;
  sales?: number;
  budget?: number;
  payment_method?: string;
  tags?: string[];
  responsible_hosts?: string[];
  customFields?: Record<string, any>;
}