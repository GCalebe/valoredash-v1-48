
import React, { useMemo, useCallback } from 'react';
import { VirtualizedTable } from '@/components/ui/virtualized-list';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Eye, Edit, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Import Contact from centralized types
import type { Contact } from '@/types/client';

interface ClientsTableVirtualizedProps {
  contacts: Contact[];
  height?: number;
  onViewContact?: (contact: Contact) => void;
  onEditContact?: (contact: Contact) => void;
  onDeleteContact?: (contact: Contact) => void;
  isLoading?: boolean;
}

/**
 * Tabela virtualizada de clientes para renderização eficiente de grandes listas
 * Utiliza react-window para otimização de performance
 */
export const ClientsTableVirtualized = React.memo<ClientsTableVirtualizedProps>(({
  contacts,
  height = 600,
  onViewContact,
  onEditContact,
  onDeleteContact,
  isLoading = false,
}) => {
  
  // Memoizar as colunas da tabela
  const columns = useMemo(() => [
    {
      key: 'name' as keyof Contact,
      header: 'Nome',
      width: 200,
      render: (contact: Contact) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {contact.name}
          </span>
          {contact.email && (
            <span className="text-xs text-gray-500">
              {contact.email}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'company' as keyof Contact,
      header: 'Empresa',
      width: 150,
      render: (contact: Contact) => (
        <div className="flex flex-col">
          <span className="text-sm">
            {contact.company || contact.clientName || '-'}
          </span>
          {contact.position && (
            <span className="text-xs text-gray-500">
              {contact.position}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'kanban_stage_id' as keyof Contact,
      header: 'Status',
      width: 120,
      render: (contact: Contact) => {
        const stageColors = {
          'lead': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
          'contato-inicial': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
          'em-negociacao': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
          'fechado': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
          'perdido': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
        };
        
        const stage = contact.kanbanStage || 'lead';
        const colorClass = stageColors[stage as keyof typeof stageColors] || stageColors.lead;
        
        return (
          <Badge variant="outline" className={`text-xs ${colorClass}`}>
            {stage.replace('-', ' ').toUpperCase()}
          </Badge>
        );
      },
    },
    {
      key: 'lead_value' as keyof Contact,
      header: 'Valor',
      width: 100,
      render: (contact: Contact) => (
        <span className="text-sm font-medium">
          {contact.lead_value 
            ? `R$ ${contact.lead_value.toLocaleString('pt-BR')}` 
            : contact.sales
            ? `R$ ${contact.sales.toLocaleString('pt-BR')}`
            : '-'
          }
        </span>
      ),
    },
    {
      key: 'conversion_probability' as keyof Contact,
      header: 'Prob. Conv.',
      width: 100,
      render: (contact: Contact) => (
        <div className="flex items-center">
          {contact.conversion_probability ? (
            <>
              <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${contact.conversion_probability}%` }}
                ></div>
              </div>
              <span className="text-xs">
                {contact.conversion_probability}%
              </span>
            </>
          ) : (
            <span className="text-xs text-gray-500">-</span>
          )}
        </div>
      ),
    },
    {
      key: 'created_at' as keyof Contact,
      header: 'Criado',
      width: 120,
      render: (contact: Contact) => {
        try {
          return (
            <span className="text-xs text-gray-500">
              {contact.created_at && formatDistanceToNow(new Date(contact.created_at), {
                addSuffix: true,
                locale: ptBR,
              })}
            </span>
          );
        } catch {
          return <span className="text-xs text-gray-500">Data inválida</span>;
        }
      },
    },
    {
      key: 'actions' as keyof Contact,
      header: 'Ações',
      width: 80,
      render: (contact: Contact) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onViewContact && (
              <DropdownMenuItem onClick={() => onViewContact(contact)}>
                <Eye className="mr-2 h-4 w-4" />
                Visualizar
              </DropdownMenuItem>
            )}
            {onEditContact && (
              <DropdownMenuItem onClick={() => onEditContact(contact)}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
            )}
            {onDeleteContact && (
              <DropdownMenuItem 
                onClick={() => onDeleteContact(contact)}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ], [onViewContact, onEditContact, onDeleteContact]);

  // Callback otimizado para clique na linha
  const handleRowClick = useCallback((contact: Contact) => {
    if (onViewContact) {
      onViewContact(contact);
    }
  }, [onViewContact]);

  if (isLoading) {
    return (
      <div className="w-full border rounded-lg">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2 text-sm text-muted-foreground">
            Carregando contatos...
          </span>
        </div>
      </div>
    );
  }

  if (contacts.length === 0) {
    return (
      <div className="w-full border rounded-lg">
        <div className="flex flex-col items-center justify-center h-64 space-y-2">
          <div className="text-muted-foreground">
            <svg
              className="h-12 w-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium">Nenhum contato encontrado</h3>
          <p className="text-sm text-muted-foreground text-center max-w-sm">
            Não há contatos que correspondam aos filtros selecionados. 
            Tente ajustar os filtros ou adicionar novos contatos.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <VirtualizedTable
        data={contacts}
        columns={columns}
        height={height}
        rowHeight={70}
        onRowClick={handleRowClick}
        className="hover:bg-muted/50 transition-colors"
      />
      
      {/* Informações de performance para desenvolvimento */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-2 text-xs text-muted-foreground">
          Renderizando {contacts.length} contatos com virtualização
        </div>
      )}
    </div>
  );
});

ClientsTableVirtualized.displayName = 'ClientsTableVirtualized';
