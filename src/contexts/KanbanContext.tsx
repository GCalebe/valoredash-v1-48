import React, { createContext, useContext, useReducer, useCallback, useMemo } from 'react';
import { Contact } from '@/types/client';
import { KanbanStage } from '@/hooks/useKanbanStagesSupabase';

// Tipos para o estado do Kanban
interface KanbanState {
  contacts: Contact[];
  stages: KanbanStage[];
  searchTerm: string;
  selectedContact: Contact | null;
  isLoading: boolean;
  draggedContactId: string | null;
  isUpdatingStage: boolean;
  filters: {
    status?: string;
    tags?: string[];
    dateRange?: { start: Date; end: Date };
  };
  optimisticUpdates: Map<string, Partial<Contact>>;
}

// Tipos para as ações
type KanbanAction =
  | { type: 'SET_CONTACTS'; payload: Contact[] }
  | { type: 'SET_STAGES'; payload: KanbanStage[] }
  | { type: 'SET_SEARCH_TERM'; payload: string }
  | { type: 'SET_SELECTED_CONTACT'; payload: Contact | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_DRAGGED_CONTACT'; payload: string | null }
  | { type: 'SET_UPDATING_STAGE'; payload: boolean }
  | { type: 'SET_FILTERS'; payload: Partial<KanbanState['filters']> }
  | { type: 'ADD_CONTACT'; payload: Contact }
  | { type: 'UPDATE_CONTACT'; payload: { id: string; updates: Partial<Contact> } }
  | { type: 'DELETE_CONTACT'; payload: string }
  | { type: 'MOVE_CONTACT'; payload: { contactId: string; newStageId: string } }
  | { type: 'ADD_OPTIMISTIC_UPDATE'; payload: { contactId: string; updates: Partial<Contact> } }
  | { type: 'REMOVE_OPTIMISTIC_UPDATE'; payload: string }
  | { type: 'CLEAR_OPTIMISTIC_UPDATES' };

// Estado inicial
const initialState: KanbanState = {
  contacts: [],
  stages: [],
  searchTerm: '',
  selectedContact: null,
  isLoading: false,
  draggedContactId: null,
  isUpdatingStage: false,
  filters: {},
  optimisticUpdates: new Map(),
};

// Reducer otimizado
const kanbanReducer = (state: KanbanState, action: KanbanAction): KanbanState => {
  switch (action.type) {
    case 'SET_CONTACTS':
      return { ...state, contacts: action.payload };
    
    case 'SET_STAGES':
      return { ...state, stages: action.payload };
    
    case 'SET_SEARCH_TERM':
      return { ...state, searchTerm: action.payload };
    
    case 'SET_SELECTED_CONTACT':
      return { ...state, selectedContact: action.payload };
    
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_DRAGGED_CONTACT':
      return { ...state, draggedContactId: action.payload };
    
    case 'SET_UPDATING_STAGE':
      return { ...state, isUpdatingStage: action.payload };
    
    case 'SET_FILTERS':
      return { 
        ...state, 
        filters: { ...state.filters, ...action.payload } 
      };
    
    case 'ADD_CONTACT':
      return {
        ...state,
        contacts: [action.payload, ...state.contacts],
      };
    
    case 'UPDATE_CONTACT': {
      const { id, updates } = action.payload;
      return {
        ...state,
        contacts: state.contacts.map(contact =>
          contact.id === id ? { ...contact, ...updates } : contact
        ),
      };
    }
    
    case 'DELETE_CONTACT':
      return {
        ...state,
        contacts: state.contacts.filter(contact => contact.id !== action.payload),
        selectedContact: state.selectedContact?.id === action.payload ? null : state.selectedContact,
      };
    
    case 'MOVE_CONTACT': {
      const { contactId, newStageId } = action.payload;
      return {
        ...state,
        contacts: state.contacts.map(contact =>
          contact.id === contactId 
            ? { ...contact, kanban_stage_id: newStageId }
            : contact
        ),
      };
    }
    
    case 'ADD_OPTIMISTIC_UPDATE': {
      const { contactId, updates } = action.payload;
      const newOptimisticUpdates = new Map(state.optimisticUpdates);
      newOptimisticUpdates.set(contactId, {
        ...newOptimisticUpdates.get(contactId),
        ...updates,
      });
      return {
        ...state,
        optimisticUpdates: newOptimisticUpdates,
      };
    }
    
    case 'REMOVE_OPTIMISTIC_UPDATE': {
      const newOptimisticUpdates = new Map(state.optimisticUpdates);
      newOptimisticUpdates.delete(action.payload);
      return {
        ...state,
        optimisticUpdates: newOptimisticUpdates,
      };
    }
    
    case 'CLEAR_OPTIMISTIC_UPDATES':
      return {
        ...state,
        optimisticUpdates: new Map(),
      };
    
    default:
      return state;
  }
};

// Contexto
interface KanbanContextType {
  state: KanbanState;
  actions: {
    setContacts: (contacts: Contact[]) => void;
    setStages: (stages: KanbanStage[]) => void;
    setSearchTerm: (term: string) => void;
    setSelectedContact: (contact: Contact | null) => void;
    setLoading: (loading: boolean) => void;
    setDraggedContact: (contactId: string | null) => void;
    setUpdatingStage: (updating: boolean) => void;
    setFilters: (filters: Partial<KanbanState['filters']>) => void;
    addContact: (contact: Contact) => void;
    updateContact: (id: string, updates: Partial<Contact>) => void;
    deleteContact: (id: string) => void;
    moveContact: (contactId: string, newStageId: string) => void;
    addOptimisticUpdate: (contactId: string, updates: Partial<Contact>) => void;
    removeOptimisticUpdate: (contactId: string) => void;
    clearOptimisticUpdates: () => void;
  };
  selectors: {
    getContactsByStage: (stageId: string) => Contact[];
    getFilteredContacts: () => Contact[];
    getContactsWithOptimisticUpdates: () => Contact[];
    getStageById: (stageId: string) => KanbanStage | undefined;
    getContactById: (contactId: string) => Contact | undefined;
  };
}

const KanbanContext = createContext<KanbanContextType | undefined>(undefined);

// Provider otimizado
export const KanbanProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(kanbanReducer, initialState);

  // Actions memoizadas
  const actions = useMemo(() => ({
    setContacts: (contacts: Contact[]) => 
      dispatch({ type: 'SET_CONTACTS', payload: contacts }),
    
    setStages: (stages: KanbanStage[]) => 
      dispatch({ type: 'SET_STAGES', payload: stages }),
    
    setSearchTerm: (term: string) => 
      dispatch({ type: 'SET_SEARCH_TERM', payload: term }),
    
    setSelectedContact: (contact: Contact | null) => 
      dispatch({ type: 'SET_SELECTED_CONTACT', payload: contact }),
    
    setLoading: (loading: boolean) => 
      dispatch({ type: 'SET_LOADING', payload: loading }),
    
    setDraggedContact: (contactId: string | null) => 
      dispatch({ type: 'SET_DRAGGED_CONTACT', payload: contactId }),
    
    setUpdatingStage: (updating: boolean) => 
      dispatch({ type: 'SET_UPDATING_STAGE', payload: updating }),
    
    setFilters: (filters: Partial<KanbanState['filters']>) => 
      dispatch({ type: 'SET_FILTERS', payload: filters }),
    
    addContact: (contact: Contact) => 
      dispatch({ type: 'ADD_CONTACT', payload: contact }),
    
    updateContact: (id: string, updates: Partial<Contact>) => 
      dispatch({ type: 'UPDATE_CONTACT', payload: { id, updates } }),
    
    deleteContact: (id: string) => 
      dispatch({ type: 'DELETE_CONTACT', payload: id }),
    
    moveContact: (contactId: string, newStageId: string) => 
      dispatch({ type: 'MOVE_CONTACT', payload: { contactId, newStageId } }),
    
    addOptimisticUpdate: (contactId: string, updates: Partial<Contact>) => 
      dispatch({ type: 'ADD_OPTIMISTIC_UPDATE', payload: { contactId, updates } }),
    
    removeOptimisticUpdate: (contactId: string) => 
      dispatch({ type: 'REMOVE_OPTIMISTIC_UPDATE', payload: contactId }),
    
    clearOptimisticUpdates: () => 
      dispatch({ type: 'CLEAR_OPTIMISTIC_UPDATES' }),
  }), []);

  // Selectors memoizados
  const selectors = useMemo(() => ({
    getContactsByStage: (stageId: string) => {
      return state.contacts.filter(contact => contact.kanban_stage_id === stageId);
    },
    
    getFilteredContacts: () => {
      let filtered = state.contacts;
      
      // Filtro por termo de busca
      if (state.searchTerm) {
        const searchLower = state.searchTerm.toLowerCase();
        filtered = filtered.filter(contact => 
          contact.name?.toLowerCase().includes(searchLower) ||
          contact.email?.toLowerCase().includes(searchLower) ||
          contact.phone?.toLowerCase().includes(searchLower) ||
          contact.client_name?.toLowerCase().includes(searchLower)
        );
      }
      
      // Filtro por status
      if (state.filters.status) {
        filtered = filtered.filter(contact => contact.status === state.filters.status);
      }
      
      // Filtro por tags
      if (state.filters.tags && state.filters.tags.length > 0) {
        filtered = filtered.filter(contact => 
          contact.tags?.some(tag => state.filters.tags?.includes(tag))
        );
      }
      
      // Filtro por data
      if (state.filters.dateRange) {
        const { start, end } = state.filters.dateRange;
        filtered = filtered.filter(contact => {
          const contactDate = new Date(contact.created_at);
          return contactDate >= start && contactDate <= end;
        });
      }
      
      return filtered;
    },
    
    getContactsWithOptimisticUpdates: () => {
      return state.contacts.map(contact => {
        const optimisticUpdate = state.optimisticUpdates.get(contact.id);
        return optimisticUpdate ? { ...contact, ...optimisticUpdate } : contact;
      });
    },
    
    getStageById: (stageId: string) => {
      return state.stages.find(stage => stage.id === stageId);
    },
    
    getContactById: (contactId: string) => {
      const contact = state.contacts.find(c => c.id === contactId);
      if (!contact) return undefined;
      
      const optimisticUpdate = state.optimisticUpdates.get(contactId);
      return optimisticUpdate ? { ...contact, ...optimisticUpdate } : contact;
    },
  }), [state]);

  // Valor do contexto memoizado
  const contextValue = useMemo(() => ({
    state,
    actions,
    selectors,
  }), [state, actions, selectors]);

  return (
    <KanbanContext.Provider value={contextValue}>
      {children}
    </KanbanContext.Provider>
  );
};

// Hook para usar o contexto
export const useKanbanContext = () => {
  const context = useContext(KanbanContext);
  if (context === undefined) {
    throw new Error('useKanbanContext must be used within a KanbanProvider');
  }
  return context;
};

// Hooks especializados para performance
export const useKanbanState = () => {
  const { state } = useKanbanContext();
  return state;
};

export const useKanbanActions = () => {
  const { actions } = useKanbanContext();
  return actions;
};

export const useKanbanSelectors = () => {
  const { selectors } = useKanbanContext();
  return selectors;
};

// Hook para contatos de um estágio específico (otimizado)
export const useKanbanStageContacts = (stageId: string) => {
  const { selectors } = useKanbanContext();
  
  return useMemo(() => 
    selectors.getContactsByStage(stageId),
    [selectors, stageId]
  );
};

// Hook para contatos filtrados (otimizado)
export const useKanbanFilteredContacts = () => {
  const { selectors } = useKanbanContext();
  
  return useMemo(() => 
    selectors.getFilteredContacts(),
    [selectors]
  );
};