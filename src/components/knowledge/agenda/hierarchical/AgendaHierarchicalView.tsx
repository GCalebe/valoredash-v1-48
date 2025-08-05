import React from 'react';
import { Accordion } from '@/components/ui/accordion';
import { LocalAgenda } from '@/types/LocalAgenda';
import {
  AgendaHierarchicalViewProps,
  CategoryKey,
} from './types';
import {
  CategorySection,
  EmptyState,
  LoadingSkeleton,
} from './components';
import {
  useAgendaHierarchyComplete,
} from './hooks';
import {
  categoryUtils,
  sortUtils,
} from './utils';

/**
 * Componente principal para visualização hierárquica de agendas
 * 
 * Este componente refatorado oferece:
 * - Agrupamento automático por categorias
 * - Funcionalidades de busca e filtro
 * - Ordenação personalizável
 * - Navegação por teclado
 * - Exportação de dados
 * - Acessibilidade completa
 * - Performance otimizada
 */
export const AgendaHierarchicalView: React.FC<AgendaHierarchicalViewProps> = ({
  agendas,
  onEdit,
  onDelete,
  initialExpanded = [],
  initialFilter,
  initialSort = { field: 'title', direction: 'asc' },
  compact = false,
  showActions = true,
  showCategoryCount = true,
  showEmptyCategories = false,
  enableKeyboard = true,
  enableExport = false,
  isLoading = false,
  error,
  className = '',
  ...props
}) => {
  // Hook principal que gerencia todo o estado e funcionalidades
  const {
    agendas: processedAgendas,
    availableCategories,
    expandedCategories,
    toggleCategory,
    expandAll,
    collapseAll,
    isCategoryExpanded,
    filterConfig,
    isFilterActive,
    updateFilter,
    clearFilter,
    sortConfig,
    updateSort,
    searchTerm,
    setSearchTerm,
    hasSearchResults,
    totalSearchResults,
    searchInputRef,
    clearSearch,
    focusSearch,
    handleEdit,
    handleDelete,
    focusedItem,
    isLoading: hookIsLoading,
    hasError,
    errorMessage,
    clearAllErrors,
    exportToCSV,
    exportToJSON,
  } = useAgendaHierarchyComplete(agendas, {
    initialExpanded,
    initialFilter,
    initialSort,
    onEdit,
    onDelete,
    enableKeyboard,
    enableExport,
  });

  // Estado de loading combinado
  const finalIsLoading = isLoading || hookIsLoading;
  
  // Estado de erro combinado
  const finalError = error || errorMessage;
  const finalHasError = Boolean(finalError) || hasError;

  // Ordena categorias para exibição consistente
  const sortedCategories = React.useMemo(() => {
    return sortUtils.sortCategories(availableCategories, processedAgendas, 'alphabetical');
  }, [availableCategories, processedAgendas]);

  // Filtra categorias vazias se necessário
  const categoriesToShow = React.useMemo(() => {
    if (showEmptyCategories) {
      return sortedCategories;
    }
    return sortedCategories.filter(category => 
      processedAgendas[category] && processedAgendas[category].length > 0
    );
  }, [sortedCategories, processedAgendas, showEmptyCategories]);

  // Renderiza estado de loading
  if (finalIsLoading) {
    return (
      <div className={`space-y-4 ${className}`} {...props}>
        <LoadingSkeleton count={3} compact={compact} />
      </div>
    );
  }

  // Renderiza estado de erro
  if (finalHasError && finalError) {
    return (
      <div className={className} {...props}>
        <EmptyState
          type="error"
          title="Erro ao carregar agendas"
          description={finalError}
          action={
            <button
              onClick={clearAllErrors}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Tentar novamente
            </button>
          }
        />
      </div>
    );
  }

  // Renderiza estado vazio quando não há agendas
  if (agendas.length === 0) {
    return (
      <div className={className} {...props}>
        <EmptyState
          type="no-agendas"
          title="Nenhuma agenda encontrada"
          description="Comece criando sua primeira agenda para organizar seus compromissos."
        />
      </div>
    );
  }

  // Renderiza estado vazio quando não há resultados de busca/filtro
  if (categoriesToShow.length === 0) {
    const isSearching = searchTerm.trim().length > 0;
    const isFiltering = isFilterActive;
    
    return (
      <div className={className} {...props}>
        <EmptyState
          type="no-results"
          title={isSearching ? "Nenhum resultado encontrado" : "Nenhuma agenda corresponde aos filtros"}
          description={
            isSearching 
              ? `Não encontramos agendas que correspondam a "${searchTerm}".`
              : "Tente ajustar os filtros para ver mais resultados."
          }
          action={
            <div className="flex space-x-2">
              {isSearching && (
                <button
                  onClick={clearSearch}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  Limpar busca
                </button>
              )}
              {isFiltering && (
                <button
                  onClick={clearFilter}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Limpar filtros
                </button>
              )}
            </div>
          }
        />
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`} {...props}>
      {/* Informações de busca/filtro */}
      {(searchTerm.trim().length > 0 || isFilterActive) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-blue-800">
              {searchTerm.trim().length > 0 && (
                <span>
                  Buscando por: <strong>"{searchTerm}"</strong>
                </span>
              )}
              {isFilterActive && (
                <span>
                  {searchTerm.trim().length > 0 ? ' • ' : ''}Filtros ativos
                </span>
              )}
              <span className="text-blue-600">
                • {totalSearchResults} {totalSearchResults === 1 ? 'resultado' : 'resultados'}
              </span>
            </div>
            
            <div className="flex space-x-2">
              {searchTerm.trim().length > 0 && (
                <button
                  onClick={clearSearch}
                  className="text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  Limpar busca
                </button>
              )}
              {isFilterActive && (
                <button
                  onClick={clearFilter}
                  className="text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  Limpar filtros
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Controles de expansão */}
      {categoriesToShow.length > 1 && (
        <div className="flex justify-between items-center py-2">
          <div className="text-sm text-gray-600">
            {categoriesToShow.length} {categoriesToShow.length === 1 ? 'categoria' : 'categorias'}
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={expandAll}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
              disabled={expandedCategories.length === categoriesToShow.length}
            >
              Expandir todas
            </button>
            <span className="text-gray-300">•</span>
            <button
              onClick={collapseAll}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
              disabled={expandedCategories.length === 0}
            >
              Recolher todas
            </button>
          </div>
        </div>
      )}

      {/* Lista de categorias */}
      <Accordion type="multiple" value={expandedCategories} className="space-y-4">
        {categoriesToShow.map((category) => {
          const categoryAgendas = processedAgendas[category] || [];
          
          return (
            <CategorySection
              key={category}
              category={category}
              agendas={categoryAgendas}
              isExpanded={isCategoryExpanded(category)}
              onToggle={() => toggleCategory(category)}
              onEdit={handleEdit}
              onDelete={handleDelete}
              focusedItem={focusedItem}
              compact={compact}
              showActions={showActions}
              showCategoryCount={showCategoryCount}
              isLoading={finalIsLoading}
            />
          );
        })}
      </Accordion>

      {/* Informações de rodapé */}
      {categoriesToShow.length > 0 && (
        <div className="text-center text-sm text-gray-500 pt-4 border-t border-gray-200">
          Total: {totalSearchResults} {totalSearchResults === 1 ? 'agenda' : 'agendas'} em{' '}
          {categoriesToShow.length} {categoriesToShow.length === 1 ? 'categoria' : 'categorias'}
        </div>
      )}
    </div>
  );
};

// Exporta o componente como padrão para compatibilidade
export default AgendaHierarchicalView;