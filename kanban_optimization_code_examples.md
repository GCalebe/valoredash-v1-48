# Exemplos de Código para Otimizações do Kanban

Este documento contém exemplos de código para implementar algumas das otimizações sugeridas no checklist. Estes exemplos são apenas guias e podem precisar ser adaptados ao contexto específico da aplicação.

## 1. Otimizações de Consultas

### 1.1 Paginação com Cursor

```typescript
// Modificação para optimizedContactsService.ts
export const fetchContactsList = async (
  supabase: SupabaseClient,
  filters: ContactFilters,
  pageSize: number = 20,
  cursor?: { created_at: string; id: string }
): Promise<{ data: EnhancedContactData[]; nextCursor: { created_at: string; id: string } | null }> => {
  let query = supabase
    .from('contacts')
    .select(
      'id, name, email, phone, client_name, status, tags, kanban_stage_id, created_at, updated_at'
    )
    .eq('user_id', filters.user_id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })
    .limit(pageSize + 1); // Buscar um item a mais para determinar se há próxima página

  // Aplicar cursor para paginação eficiente
  if (cursor) {
    query = query.or(
      `created_at.lt.${cursor.created_at},and(created_at.eq.${cursor.created_at},id.lt.${cursor.id})`
    );
  }

  // Aplicar filtros adicionais
  if (filters.kanban_stage_id) {
    query = query.eq('kanban_stage_id', filters.kanban_stage_id);
  }

  if (filters.status) {
    query = query.eq('status', filters.status);
  }

  if (filters.tags && filters.tags.length > 0) {
    query = query.contains('tags', filters.tags);
  }

  if (filters.search) {
    // Usar o índice de busca textual
    query = query.textSearch(
      'name,email,phone,client_name',
      filters.search,
      { config: 'portuguese' }
    );
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching contacts:', error);
    throw error;
  }

  // Verificar se há próxima página
  let nextCursor = null;
  if (data && data.length > pageSize) {
    const lastItem = data[pageSize - 1];
    nextCursor = {
      created_at: lastItem.created_at,
      id: lastItem.id
    };
    // Remover o item extra usado para verificar se há próxima página
    data.pop();
  }

  return {
    data: data || [],
    nextCursor
  };
};
```

### 1.2 Carregamento Lazy de Detalhes

```typescript
// Função para carregar detalhes de um contato específico
export const fetchContactDetails = async (
  supabase: SupabaseClient,
  contactId: string,
  userId: string
): Promise<EnhancedContactData | null> => {
  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .eq('id', contactId)
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Error fetching contact details:', error);
    throw error;
  }

  return data;
};
```

## 2. Otimizações de Cache

### 2.1 Configuração do React Query

```typescript
// Configuração do React Query com staleTime e cacheTime otimizados
import { QueryClient, QueryClientProvider } from 'react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      cacheTime: 30 * 60 * 1000, // 30 minutos
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// No componente App
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Resto da aplicação */}
    </QueryClientProvider>
  );
}
```

### 2.2 Hooks com React Query

```typescript
// Hook para buscar contatos por estágio com React Query
import { useQuery, useQueryClient } from 'react-query';
import { fetchContactsByKanbanStage } from '../lib/optimizedContactsService';

export const useContactsByKanbanStage = (userId: string, stageId: string) => {
  const queryClient = useQueryClient();
  
  return useQuery(
    ['contacts', 'kanban-stage', stageId, userId],
    () => fetchContactsByKanbanStage(supabase, userId, stageId),
    {
      enabled: !!userId && !!stageId,
      onSuccess: (data) => {
        // Pré-cache individual contacts
        data.forEach((contact) => {
          queryClient.setQueryData(
            ['contact', contact.id],
            contact
          );
        });
      },
    }
  );
};

// Hook para atualizar estágio do Kanban com invalidação seletiva de cache
import { useMutation } from 'react-query';
import { updateContactKanbanStage } from '../lib/optimizedContactsService';

export const useUpdateKanbanStage = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    ({ contactId, newStageId, userId }: { contactId: string; newStageId: string; userId: string }) =>
      updateContactKanbanStage(supabase, contactId, newStageId, userId),
    {
      onMutate: async ({ contactId, newStageId, userId }) => {
        // Cancelar queries em andamento
        await queryClient.cancelQueries(['contacts', 'kanban-stage']);
        
        // Snapshot do estado anterior para rollback
        const previousContact = queryClient.getQueryData(['contact', contactId]);
        
        // Atualizar o cache otimisticamente
        queryClient.setQueryData(['contact', contactId], (old: any) => ({
          ...old,
          kanban_stage_id: newStageId,
        }));
        
        // Retornar contexto com dados para rollback
        return { previousContact, contactId };
      },
      onError: (err, variables, context) => {
        // Rollback em caso de erro
        if (context?.previousContact) {
          queryClient.setQueryData(
            ['contact', context.contactId],
            context.previousContact
          );
        }
      },
      onSettled: (data, error, { newStageId, userId }) => {
        // Invalidar queries afetadas para refetch
        queryClient.invalidateQueries(['contacts', 'kanban-stage']);
        queryClient.invalidateQueries(['contacts', 'stats']);
      },
    }
  );
};
```

## 3. Otimizações de Renderização

### 3.1 Virtualização com react-window

```tsx
// Modificação para KanbanView.tsx usando react-window
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';

// Dentro do componente KanbanView
const renderKanbanStages = () => {
  return (
    <div className="kanban-container" ref={containerRef}>
      <AutoSizer>
        {({ width, height }) => (
          <List
            className="kanban-stages-list"
            width={width}
            height={height}
            itemCount={stages.length}
            itemSize={320} // Largura de cada coluna
            layout="horizontal"
          >
            {({ index, style }) => {
              const stage = stages[index];
              const stageContacts = contactsByStage[stage.id] || [];
              
              return (
                <div style={style} key={stage.id}>
                  <KanbanStageColumn
                    stage={stage}
                    contacts={stageContacts}
                    isUpdating={updatingStageId === stage.id}
                    onEditStage={handleEditStage}
                  />
                </div>
              );
            }}
          </List>
        )}
      </AutoSizer>
    </div>
  );
};
```

### 3.2 Memoização de Componentes

```tsx
// Otimização do KanbanClientCard.tsx com React.memo
import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import ClientCard from './ClientCard';
import { EnhancedContactData } from '../lib/types';

interface KanbanClientCardProps {
  contact: EnhancedContactData;
  index: number;
}

const KanbanClientCard: React.FC<KanbanClientCardProps> = ({ contact, index }) => {
  return (
    <Draggable draggableId={contact.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`kanban-client-card ${snapshot.isDragging ? 'is-dragging' : ''}`}
        >
          <ClientCard contact={contact} />
        </div>
      )}
    </Draggable>
  );
};

// Usar React.memo para evitar re-renderizações desnecessárias
export default React.memo(KanbanClientCard, (prevProps, nextProps) => {
  // Comparação personalizada para determinar se deve re-renderizar
  return (
    prevProps.contact.id === nextProps.contact.id &&
    prevProps.contact.updated_at === nextProps.contact.updated_at &&
    prevProps.index === nextProps.index
  );
});
```

### 3.3 Otimização com useCallback

```tsx
// Otimização das funções de manipulação de eventos no KanbanView.tsx
import { useCallback } from 'react';

// Dentro do componente KanbanView
const handleDragEnd = useCallback(
  (result: DropResult) => {
    // Implementação existente...
  },
  [contactsByStage, stages, updateContactKanbanStage]
);

const handleDragStart = useCallback(
  (initial: DragStart) => {
    // Implementação existente...
  },
  []
);

const handleMouseDown = useCallback(
  (e: React.MouseEvent) => {
    // Implementação existente...
  },
  [containerRef]
);

const handleMouseMove = useCallback(
  (e: React.MouseEvent) => {
    // Implementação existente...
  },
  [isScrolling, startX, containerRef]
);

const handleMouseUp = useCallback(() => {
  // Implementação existente...
}, []);

const handleMouseLeave = useCallback(() => {
  // Implementação existente...
}, []);
```

## 4. Otimizações de Dados

### 4.1 Implementação de Context API

```tsx
// KanbanContext.tsx
import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { EnhancedContactData, KanbanStage } from '../lib/types';

type KanbanState = {
  contactsByStage: Record<string, EnhancedContactData[]>;
  stages: KanbanStage[];
  isLoading: boolean;
  error: Error | null;
};

type KanbanAction =
  | { type: 'SET_CONTACTS_BY_STAGE'; payload: Record<string, EnhancedContactData[]> }
  | { type: 'SET_STAGES'; payload: KanbanStage[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: Error | null }
  | { type: 'MOVE_CONTACT'; payload: { contactId: string; sourceStageId: string; destinationStageId: string } };

const KanbanContext = createContext<
  { state: KanbanState; dispatch: React.Dispatch<KanbanAction> } | undefined
>(undefined);

const kanbanReducer = (state: KanbanState, action: KanbanAction): KanbanState => {
  switch (action.type) {
    case 'SET_CONTACTS_BY_STAGE':
      return { ...state, contactsByStage: action.payload };
    case 'SET_STAGES':
      return { ...state, stages: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'MOVE_CONTACT': {
      const { contactId, sourceStageId, destinationStageId } = action.payload;
      const newContactsByStage = { ...state.contactsByStage };
      
      // Encontrar o contato na lista de origem
      const sourceContacts = [...(newContactsByStage[sourceStageId] || [])];
      const contactIndex = sourceContacts.findIndex(c => c.id === contactId);
      
      if (contactIndex === -1) return state;
      
      // Remover o contato da lista de origem
      const [contact] = sourceContacts.splice(contactIndex, 1);
      newContactsByStage[sourceStageId] = sourceContacts;
      
      // Adicionar o contato à lista de destino
      const destinationContacts = [...(newContactsByStage[destinationStageId] || [])];
      destinationContacts.unshift({ ...contact, kanban_stage_id: destinationStageId });
      newContactsByStage[destinationStageId] = destinationContacts;
      
      return { ...state, contactsByStage: newContactsByStage };
    }
    default:
      return state;
  }
};

const KanbanProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(kanbanReducer, {
    contactsByStage: {},
    stages: [],
    isLoading: false,
    error: null,
  });

  return (
    <KanbanContext.Provider value={{ state, dispatch }}>
      {children}
    </KanbanContext.Provider>
  );
};

const useKanban = () => {
  const context = useContext(KanbanContext);
  if (context === undefined) {
    throw new Error('useKanban must be used within a KanbanProvider');
  }
  return context;
};

export { KanbanProvider, useKanban };
```

### 4.2 Uso do Context no KanbanView

```tsx
// Modificação no KanbanView.tsx para usar o Context
import { useKanban } from '../context/KanbanContext';
import { useContactsByKanbanStage, useKanbanStages } from '../hooks/useKanbanHooks';

const KanbanView: React.FC = () => {
  const { state, dispatch } = useKanban();
  const { stages, contactsByStage, isLoading, error } = state;
  
  const { data: fetchedStages, isLoading: stagesLoading } = useKanbanStages(userId);
  
  // Efeito para atualizar os estágios no context
  useEffect(() => {
    if (fetchedStages) {
      dispatch({ type: 'SET_STAGES', payload: fetchedStages });
    }
  }, [fetchedStages, dispatch]);
  
  // Carregar contatos para cada estágio
  useEffect(() => {
    if (stages.length > 0) {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const fetchAllStageContacts = async () => {
        try {
          const contactsMap: Record<string, EnhancedContactData[]> = {};
          
          // Carregar contatos para cada estágio em paralelo
          await Promise.all(
            stages.map(async (stage) => {
              const { data } = await fetchContactsByKanbanStage(supabase, userId, stage.id);
              contactsMap[stage.id] = data || [];
            })
          );
          
          dispatch({ type: 'SET_CONTACTS_BY_STAGE', payload: contactsMap });
          dispatch({ type: 'SET_ERROR', payload: null });
        } catch (err) {
          dispatch({ type: 'SET_ERROR', payload: err as Error });
        } finally {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      };
      
      fetchAllStageContacts();
    }
  }, [stages, userId, dispatch]);
  
  // Função para mover um contato entre estágios
  const moveContact = useCallback(
    (contactId: string, sourceStageId: string, destinationStageId: string) => {
      // Atualizar o estado local imediatamente (otimista)
      dispatch({
        type: 'MOVE_CONTACT',
        payload: { contactId, sourceStageId, destinationStageId },
      });
      
      // Atualizar no banco de dados
      updateContactKanbanStage(supabase, contactId, destinationStageId, userId)
        .catch((error) => {
          // Em caso de erro, reverter a mudança
          dispatch({
            type: 'MOVE_CONTACT',
            payload: { contactId, sourceStageId: destinationStageId, destinationStageId: sourceStageId },
          });
          
          toast({
            title: 'Erro ao mover contato',
            description: 'Não foi possível mover o contato. Tente novamente.',
            variant: 'destructive',
          });
        });
    },
    [dispatch, userId]
  );
  
  // Resto do componente...
};
```

## 5. Monitoramento de Performance

### 5.1 Implementação de Métricas de Performance

```typescript
// performanceMonitor.ts
const performanceMetrics = {
  kanbanLoadTime: 0,
  dragOperationTime: 0,
  renderTime: 0,
};

export const startMeasure = (metricName: keyof typeof performanceMetrics) => {
  return performance.now();
};

export const endMeasure = (metricName: keyof typeof performanceMetrics, startTime: number) => {
  const endTime = performance.now();
  const duration = endTime - startTime;
  performanceMetrics[metricName] = duration;
  
  // Log para desenvolvimento
  console.log(`Performance metric - ${metricName}: ${duration.toFixed(2)}ms`);
  
  // Enviar para serviço de analytics em produção
  if (process.env.NODE_ENV === 'production') {
    // Implementar envio para serviço de analytics
  }
  
  return duration;
};

// Uso no KanbanView.tsx
import { startMeasure, endMeasure } from '../utils/performanceMonitor';

// No useEffect para carregar dados
useEffect(() => {
  const startTime = startMeasure('kanbanLoadTime');
  
  // Lógica de carregamento...
  
  // No final do carregamento
  endMeasure('kanbanLoadTime', startTime);
}, []);

// Na função handleDragEnd
const handleDragEnd = (result: DropResult) => {
  const startTime = startMeasure('dragOperationTime');
  
  // Lógica de drag and drop...
  
  // No final da operação
  endMeasure('dragOperationTime', startTime);
};
```

Estes exemplos de código fornecem um ponto de partida para implementar as otimizações sugeridas no checklist. Adapte-os conforme necessário para se adequar à estrutura e requisitos específicos da sua aplicação.