import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { LocalAgenda } from '@/types/LocalAgenda';
import {
  CategoryHeaderProps,
  AgendaItemProps,
  CategorySectionProps,
  AgendaActionsProps,
  AgendaDetailsProps,
  EmptyStateProps,
  CategoryKey,
} from './types';
import { categoryUtils, formatUtils } from './utils';
import { ACCESSIBILITY_CONFIG } from './config';

/**
 * Componente de cabeçalho da categoria
 */
export const CategoryHeader: React.FC<CategoryHeaderProps> = ({
  category,
  count,
  isExpanded,
  onToggle,
  showCount = true,
  className = '',
  ...props
}) => {
  const config = categoryUtils.getCategoryConfig(category);
  const IconComponent = config.icon;
  const ariaLabel = `${config.label}: ${count} ${count === 1 ? 'agenda' : 'agendas'}`;

  return (
    <div
      className={`flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors ${className}`}
      onClick={onToggle}
      role="button"
      tabIndex={0}
      aria-label={ariaLabel}
      aria-expanded={isExpanded}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onToggle();
        }
      }}
      {...props}
    >
      <div className="flex items-center space-x-3">
        <IconComponent className="h-5 w-5 text-gray-600" />
        <div>
          <h3 className="font-medium text-gray-900">{config.label}</h3>
          {config.description && (
            <p className="text-sm text-gray-500">{config.description}</p>
          )}
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        {showCount && (
          <Badge variant="secondary" className={config.color}>
            {count}
          </Badge>
        )}
        <div className={`transform transition-transform duration-200 ${
          isExpanded ? 'rotate-180' : ''
        }`}>
          <svg
            className="h-4 w-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

/**
 * Componente de detalhes da agenda
 */
export const AgendaDetails: React.FC<AgendaDetailsProps> = ({
  agenda,
  showDescription = true,
  showDuration = true,
  showPrice = true,
  showParticipants = true,
  showBreakTime = false,
  compact = false,
  className = '',
}) => {
  const duration = formatUtils.formatDuration(agenda.duration || 0);
  const price = formatUtils.formatPrice(agenda.price);
  const participants = formatUtils.formatParticipants(agenda.maxParticipants);
  const breakTime = agenda.breakTime ? formatUtils.formatDuration(agenda.breakTime) : null;

  if (compact) {
    return (
      <div className={`space-y-1 ${className}`}>
        <h4 className="font-medium text-gray-900 text-sm">{agenda.title}</h4>
        <div className="flex items-center space-x-4 text-xs text-gray-500">
          {showDuration && <span>{duration}</span>}
          {showPrice && <span>{price}</span>}
          {showParticipants && <span>{participants}</span>}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <h4 className="font-medium text-gray-900">{agenda.title}</h4>
      
      {showDescription && agenda.description && (
        <p className="text-sm text-gray-600">
          {formatUtils.truncateText(agenda.description, 150)}
        </p>
      )}
      
      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
        {showDuration && (
          <div className="flex items-center space-x-1">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{duration}</span>
          </div>
        )}
        
        {showPrice && (
          <div className="flex items-center space-x-1">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
            <span>{price}</span>
          </div>
        )}
        
        {showParticipants && (
          <div className="flex items-center space-x-1">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>{participants}</span>
          </div>
        )}
        
        {showBreakTime && breakTime && (
          <div className="flex items-center space-x-1">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
            <span>Intervalo: {breakTime}</span>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Componente de ações da agenda
 */
export const AgendaActions: React.FC<AgendaActionsProps> = ({
  agenda,
  onEdit,
  onDelete,
  showEditButton = true,
  showDeleteButton = true,
  showDropdown = true,
  isLoading = false,
  className = '',
}) => {
  const handleEdit = () => onEdit?.(agenda);
  const handleDelete = () => onDelete?.(agenda);

  if (!showEditButton && !showDeleteButton) {
    return null;
  }

  if (showDropdown) {
    return (
      <div className={`flex items-center ${className}`}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              disabled={isLoading}
              aria-label={ACCESSIBILITY_CONFIG.ariaLabels.moreActions}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {showEditButton && (
              <DropdownMenuItem onClick={handleEdit} disabled={isLoading}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </DropdownMenuItem>
            )}
            {showDeleteButton && (
              <DropdownMenuItem 
                onClick={handleDelete} 
                disabled={isLoading}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {showEditButton && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleEdit}
          disabled={isLoading}
          aria-label={ACCESSIBILITY_CONFIG.ariaLabels.editButton}
        >
          <Edit className="h-4 w-4 mr-1" />
          Editar
        </Button>
      )}
      {showDeleteButton && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleDelete}
          disabled={isLoading}
          className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
          aria-label={ACCESSIBILITY_CONFIG.ariaLabels.deleteButton}
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Excluir
        </Button>
      )}
    </div>
  );
};

/**
 * Componente de item de agenda
 */
export const AgendaItem: React.FC<AgendaItemProps> = ({
  agenda,
  onEdit,
  onDelete,
  isFocused = false,
  compact = false,
  showActions = true,
  showAllDetails = true,
  isLoading = false,
  className = '',
  ...props
}) => {
  const ariaLabel = `Agenda: ${agenda.title}`;

  return (
    <div
      className={`
        p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors
        ${isFocused ? 'bg-blue-50 border-blue-200' : ''}
        ${compact ? 'py-2' : ''}
        ${className}
      `}
      role="listitem"
      aria-label={ariaLabel}
      {...props}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <AgendaDetails
            agenda={agenda}
            compact={compact}
            showDescription={showAllDetails}
            showDuration={showAllDetails}
            showPrice={showAllDetails}
            showParticipants={showAllDetails}
            showBreakTime={showAllDetails}
          />
        </div>
        
        {showActions && (
          <div className="ml-4 flex-shrink-0">
            <AgendaActions
              agenda={agenda}
              onEdit={onEdit}
              onDelete={onDelete}
              isLoading={isLoading}
            />
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Componente de seção de categoria
 */
export const CategorySection: React.FC<CategorySectionProps> = ({
  category,
  agendas,
  isExpanded,
  onToggle,
  onEdit,
  onDelete,
  focusedItem,
  compact = false,
  showActions = true,
  showCategoryCount = true,
  isLoading = false,
  className = '',
  ...props
}) => {
  const sectionId = `category-${category}`;
  const contentId = `content-${category}`;

  return (
    <div
      className={`border border-gray-200 rounded-lg overflow-hidden ${className}`}
      {...props}
    >
      <CategoryHeader
        category={category}
        count={agendas.length}
        isExpanded={isExpanded}
        onToggle={onToggle}
        showCount={showCategoryCount}
        id={sectionId}
        aria-controls={contentId}
      />
      
      {isExpanded && (
        <div
          id={contentId}
          role="region"
          aria-labelledby={sectionId}
          className="border-t border-gray-200"
        >
          <div role="list" aria-label={`Agendas da categoria ${categoryUtils.getCategoryConfig(category).label}`}>
            {agendas.map((agenda) => (
              <AgendaItem
                key={agenda.id}
                agenda={agenda}
                onEdit={onEdit}
                onDelete={onDelete}
                isFocused={focusedItem === agenda.id}
                compact={compact}
                showActions={showActions}
                isLoading={isLoading}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Componente de estado vazio
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  type = 'no-agendas',
  title,
  description,
  action,
  icon: IconComponent,
  className = '',
}) => {
  // Configurações padrão baseadas no tipo
  const getDefaultConfig = () => {
    switch (type) {
      case 'no-results':
        return {
          title: 'Nenhum resultado encontrado',
          description: 'Tente ajustar os filtros ou termo de busca.',
          icon: (
            <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          ),
        };
      case 'no-category':
        return {
          title: 'Categoria vazia',
          description: 'Não há agendas nesta categoria.',
          icon: (
            <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          ),
        };
      case 'loading':
        return {
          title: 'Carregando...',
          description: 'Aguarde enquanto carregamos as agendas.',
          icon: (
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          ),
        };
      case 'error':
        return {
          title: 'Erro ao carregar',
          description: 'Ocorreu um erro ao carregar as agendas.',
          icon: (
            <svg className="h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          ),
        };
      default: // 'no-agendas'
        return {
          title: 'Nenhuma agenda encontrada',
          description: 'Comece criando sua primeira agenda.',
          icon: (
            <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          ),
        };
    }
  };

  const defaultConfig = getDefaultConfig();
  const finalTitle = title || defaultConfig.title;
  const finalDescription = description || defaultConfig.description;
  const finalIcon = IconComponent ? <IconComponent className="h-12 w-12 text-gray-400" /> : defaultConfig.icon;

  return (
    <div className={`text-center py-12 px-4 ${className}`}>
      <div className="flex justify-center mb-4">
        {finalIcon}
      </div>
      
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {finalTitle}
      </h3>
      
      {finalDescription && (
        <p className="text-gray-500 mb-6 max-w-sm mx-auto">
          {finalDescription}
        </p>
      )}
      
      {action && (
        <div className="flex justify-center">
          {action}
        </div>
      )}
    </div>
  );
};

/**
 * Componente de loading skeleton
 */
export const LoadingSkeleton: React.FC<{ count?: number; compact?: boolean }> = ({ 
  count = 3, 
  compact = false 
}) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
          {/* Header skeleton */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-5 w-5 bg-gray-200 rounded animate-pulse" />
                <div className="space-y-1">
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
              <div className="h-6 w-8 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
          
          {/* Content skeleton */}
          <div className="p-4 space-y-4">
            {Array.from({ length: compact ? 2 : 3 }).map((_, itemIndex) => (
              <div key={itemIndex} className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
                  {!compact && (
                    <div className="h-3 w-full bg-gray-200 rounded animate-pulse" />
                  )}
                  <div className="flex space-x-4">
                    <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
                    <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
                    <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
                  </div>
                </div>
                <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};