// Lista estática de propriedades do cliente para filtros
export const clientProperties = [
  { id: "name", name: "Nome", type: "text" },
  { id: "email", name: "Email", type: "text" },
  { id: "phone", name: "Telefone", type: "text" },
  {
    id: "status",
    name: "Status",
    type: "select",
    options: ["Ganhos", "Perdidos"],
  },
  {
    id: "consultationStage",
    name: "Etapa da Consulta",
    type: "select",
    options: ["Agendada", "Realizada", "Cancelada"],
  },
  { id: "source", name: "Origem", type: "text" },
  { id: "city", name: "Cidade", type: "text" },
  { id: "state", name: "Estado", type: "text" },
  { id: "lastContact", name: "Último Contato", type: "date" },
  { id: "nextContact", name: "Próximo Contato", type: "date" },
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
    { id: "startsWith", name: "começa com" },
    { id: "endsWith", name: "termina com" },
    { id: "notEquals", name: "não é igual a" },
    { id: "notContains", name: "não contém" },
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

// Simple interface that avoids complex type inference
export interface ClientRecord {
  asaas_customer_id?: string | null;
  client_name?: string | null;
  client_size?: string | null;
  client_type?: string | null;
  cpf_cnpj?: string | null;
  created_at?: string;
  email?: string | null;
  id: number;
  kanban_stage?: string | null;
  nome?: string | null;
  nome_pet?: string | null;
  payments?: unknown;
  porte_pet?: string | null;
  raca_pet?: string | null;
  session_id?: string | null;
  telefone?: string | null;
}