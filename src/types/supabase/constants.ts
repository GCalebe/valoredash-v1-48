// Validation constants extracted from supabase types
export const KANBAN_STAGES = [
  "Nova consulta",
  "Qualificado",
  "Chamada agendada",
  "Preparando proposta",
  "Proposta enviada",
  "Acompanhamento",
  "Negociação",
  "Fatura enviada",
  "Fatura paga – ganho",
  "Projeto cancelado – perdido",
] as const;

export const CLIENT_SECTORS = [
  "tecnologia",
  "saude",
  "comercio",
  "educacao",
  "financeiro",
  "outros",
] as const;

export const CLIENT_SIZES = ["Pequeno", "Médio", "Grande"] as const;

export const PAYMENT_METHODS = [
  "cartao",
  "pix",
  "boleto",
  "transferencia",
] as const;

export type KanbanStage = (typeof KANBAN_STAGES)[number];
export type ClientSector = (typeof CLIENT_SECTORS)[number];
export type ClientSize = (typeof CLIENT_SIZES)[number];
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];
