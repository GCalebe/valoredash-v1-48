// Campos fixos do contato/cliente (sincronizados com schema do banco)
export const fixedClientProperties = [
  { id: "name", name: "Nome", type: "text", dbField: "name", category: "basic" },
  { id: "email", name: "Email", type: "text", dbField: "email" },
  { id: "phone", name: "Telefone", type: "text", dbField: "phone" },
  { id: "client_name", name: "Nome do Cliente", type: "text", dbField: "client_name", category: "commercial" },
  { id: "client_size", name: "Porte do Cliente", type: "select", dbField: "client_size", options: ["Pequeno", "Médio", "Grande"], category: "commercial" },
  { id: "client_type", name: "Tipo do Cliente", type: "text", dbField: "client_type", category: "commercial" },
  { id: "cpf_cnpj", name: "CPF/CNPJ", type: "text", dbField: "cpf_cnpj", category: "documents" },
  {
    id: "status",
    name: "Status",
    type: "select",
    dbField: "status",
    options: ["Ganhos", "Perdidos", "Em Andamento", "Qualificado", "Não Qualificado"],
  },
  { id: "kanban_stage_id", name: "Etapa do Kanban", type: "text", dbField: "kanban_stage_id", category: "commercial" },
  { id: "session_id", name: "ID da Sessão", type: "text", dbField: "session_id" },
  { id: "asaas_customer_id", name: "ID Cliente Asaas", type: "text", dbField: "asaas_customer_id" },
  { id: "nome_pet", name: "Nome do Pet", type: "text", dbField: "nome_pet", category: "basic" },
  { id: "raca_pet", name: "Raça do Pet", type: "text", dbField: "raca_pet", category: "basic" },
  { id: "porte_pet", name: "Porte do Pet", type: "select", dbField: "porte_pet", options: ["Pequeno", "Médio", "Grande"], category: "basic" },
  { id: "created_at", name: "Data de Criação", type: "date", dbField: "created_at", category: "basic" },
  { id: "updated_at", name: "Última Atualização", type: "date", dbField: "updated_at", category: "basic" },
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
  ],
  select: [
    { id: "equals", name: "é igual a" },
    { id: "notEquals", name: "não é igual a" },
  ],
  date: [
    { id: "equals", name: "é igual a" },
    { id: "before", name: "é antes de" },
    { id: "after", name: "é depois de" },
    { id: "between", name: "está entre" },
  ],
};

// Tipos de condição para grupos
export type ConditionType = "AND" | "OR";

// Interface para representar um registro de cliente (sincronizada com schema do banco)
export interface ClientRecord {
  id: string;
  name: string;
  email: string;
  phone?: string;
  client_name?: string;
  client_size?: string;
  client_type?: string;
  cpf_cnpj?: string;
  status: string;
  kanban_stage_id?: string;
  session_id?: string;
  asaas_customer_id?: string;
  nome_pet?: string;
  raca_pet?: string;
  porte_pet?: string;
  created_at?: string;
  updated_at?: string;
  tags?: string[];
  customFields?: Record<string, any>;
}