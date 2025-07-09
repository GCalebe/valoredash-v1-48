import { ContactFilters } from './contactsService';

export const contactsKeys = {
  all: ['contacts'] as const,
  lists: () => [...contactsKeys.all, 'list'] as const,
  list: (filters: ContactFilters) => [...contactsKeys.lists(), { filters }] as const,
  byStage: (stage: string) => [...contactsKeys.all, 'stage', stage] as const,
  bySource: (source: string) => [...contactsKeys.all, 'source', source] as const,
  details: () => [...contactsKeys.all, 'detail'] as const,
  detail: (id: string) => [...contactsKeys.details(), id] as const,
};