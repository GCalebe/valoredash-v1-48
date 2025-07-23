import { Agenda } from '@/hooks/useAgendas';

/**
 * Encontra uma agenda pelo nome e retorna o ID
 * @param agendas Lista de agendas
 * @param agendaName Nome da agenda a ser encontrada
 * @returns ID da agenda ou undefined se não encontrada
 */
export function findAgendaIdByName(agendas: Agenda[], agendaName: string): string | undefined {
  const agenda = agendas.find(a => a.name === agendaName);
  return agenda?.id;
}

/**
 * Encontra uma agenda pelo ID e retorna o nome
 * @param agendas Lista de agendas
 * @param agendaId ID da agenda a ser encontrada
 * @returns Nome da agenda ou undefined se não encontrada
 */
export function findAgendaNameById(agendas: Agenda[], agendaId: string): string | undefined {
  const agenda = agendas.find(a => a.id === agendaId);
  return agenda?.name;
}