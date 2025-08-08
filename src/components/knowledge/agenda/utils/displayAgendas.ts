// @ts-nocheck
import { LocalAgenda } from "../../tabs/AgendaForm";

type SortBy = 'name' | 'date' | 'created_at';

export function computeDisplayAgendas(
  baseAgendas: LocalAgenda[],
  searchTerm: string,
  sortBy: SortBy,
  sortOrder: 'asc' | 'desc',
): LocalAgenda[] {
  const term = searchTerm.trim().toLowerCase();

  const filtered = baseAgendas.filter((agenda) => {
    if (!term) return true;
    return (
      agenda.title.toLowerCase().includes(term) ||
      agenda.description.toLowerCase().includes(term) ||
      String(agenda.category).toLowerCase().includes(term)
    );
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'name') {
      const cmp = a.title.localeCompare(b.title);
      return sortOrder === 'asc' ? cmp : -cmp;
    }
    const cmp = String(a.id).localeCompare(String(b.id));
    return sortOrder === 'asc' ? cmp : -cmp;
  });

  return sorted;
}


