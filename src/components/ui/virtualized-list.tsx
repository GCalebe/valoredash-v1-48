import React, { useMemo, useCallback } from 'react';
import { FixedSizeList as List, VariableSizeList } from 'react-window';
import { cn } from '@/lib/utils';

interface VirtualizedListProps<T> {
  items: T[];
  height: number;
  itemHeight: number | ((index: number) => number);
  renderItem: (item: T, index: number, style: React.CSSProperties) => React.ReactNode;
  className?: string;
  onScroll?: (props: any) => void;
  overscanCount?: number;
  variableSize?: boolean;
}

/**
 * Componente de lista virtualizada para renderização eficiente de grandes datasets
 * Utiliza react-window para otimização de performance
 */
export function VirtualizedList<T>({
  items,
  height,
  itemHeight,
  renderItem,
  className,
  onScroll,
  overscanCount = 5,
  variableSize = false,
}: VirtualizedListProps<T>) {
  
  // Memoizar a função de renderização para evitar re-criações
  const Item = useCallback(({ index, style }: { index: number; style: React.CSSProperties }) => {
    const item = items[index];
    if (!item) return null;
    
    return (
      <div style={style}>
        {renderItem(item, index, style)}
      </div>
    );
  }, [items, renderItem]);

  // Memoizar o componente de lista
  const ListComponent = useMemo(() => {
    const listProps = {
      height,
      width: "100%",
      itemCount: items.length,
      onScroll,
      overscanCount,
      className: cn('virtualized-list', className),
    };

    if (variableSize && typeof itemHeight === 'function') {
      return (
        <VariableSizeList
          {...listProps}
          itemSize={itemHeight}
        >
          {Item}
        </VariableSizeList>
      );
    }

    return (
      <List
        {...listProps}
        itemSize={typeof itemHeight === 'number' ? itemHeight : 50}
      >
        {Item}
      </List>
    );
  }, [
    height,
    items.length,
    itemHeight,
    onScroll,
    overscanCount,
    className,
    variableSize,
    Item
  ]);

  if (items.length === 0) {
    return (
      <div 
        className={cn(
          'flex items-center justify-center text-muted-foreground',
          className
        )}
        style={{ height }}
      >
        Nenhum item encontrado
      </div>
    );
  }

  return ListComponent;
}

/**
 * Hook para calcular altura dinâmica de itens
 */
export const useVariableItemHeight = <T,>(
  items: T[],
  getItemHeight: (item: T, index: number) => number,
  defaultHeight: number = 50
) => {
  return useCallback((index: number) => {
    const item = items[index];
    if (!item) return defaultHeight;
    return getItemHeight(item, index);
  }, [items, getItemHeight, defaultHeight]);
};

/**
 * Componente específico para tabelas virtualizadas
 */
interface VirtualizedTableProps<T> {
  data: T[];
  columns: Array<{
    key: keyof T;
    header: string;
    width?: number;
    render?: (item: T, index: number) => React.ReactNode;
  }>;
  rowHeight?: number;
  height?: number;
  className?: string;
  onRowClick?: (item: T, index: number) => void;
}

export function VirtualizedTable<T>({
  data,
  columns,
  rowHeight = 60,
  height = 400,
  className,
  onRowClick,
}: VirtualizedTableProps<T>) {
  
  const renderRow = useCallback((item: T, index: number, style: React.CSSProperties) => (
    <div 
      style={style}
      className={cn(
        'flex items-center border-b border-border hover:bg-muted/50',
        onRowClick && 'cursor-pointer',
        className
      )}
      onClick={() => onRowClick?.(item, index)}
    >
      {columns.map((column, colIndex) => (
        <div 
          key={String(column.key)}
          className="px-4 py-2 flex-1"
          style={{ 
            width: column.width || `${100 / columns.length}%`,
            minWidth: column.width || 'auto'
          }}
        >
          {column.render ? column.render(item, index) : String(item[column.key] || '')}
        </div>
      ))}
    </div>
  ), [columns, onRowClick, className]);

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center border-b-2 border-border bg-muted/50 font-semibold">
        {columns.map((column) => (
          <div 
            key={String(column.key)}
            className="px-4 py-3 flex-1"
            style={{ 
              width: column.width || `${100 / columns.length}%`,
              minWidth: column.width || 'auto'
            }}
          >
            {column.header}
          </div>
        ))}
      </div>

      {/* Virtualized Body */}
      <VirtualizedList
        items={data}
        height={height}
        itemHeight={rowHeight}
        renderItem={renderRow}
        className="border border-t-0"
      />
    </div>
  );
}

/**
 * Componente de loading skeleton para listas virtualizadas
 */
interface VirtualizedSkeletonProps {
  height: number;
  itemHeight: number;
  itemCount?: number;
}

export const VirtualizedSkeleton = React.memo<VirtualizedSkeletonProps>(({
  height,
  itemHeight,
  itemCount = 10,
}) => {
  const skeletonItems = useMemo(() => 
    Array.from({ length: itemCount }, (_, i) => i), 
    [itemCount]
  );

  const renderSkeletonItem = useCallback((item: number, index: number) => (
    <div className="flex items-center space-x-4 p-4 animate-pulse">
      <div className="h-4 bg-muted rounded w-1/4"></div>
      <div className="h-4 bg-muted rounded w-1/2"></div>
      <div className="h-4 bg-muted rounded w-1/4"></div>
    </div>
  ), []);

  return (
    <VirtualizedList
      items={skeletonItems}
      height={height}
      itemHeight={itemHeight}
      renderItem={renderSkeletonItem}
    />
  );
});

VirtualizedSkeleton.displayName = 'VirtualizedSkeleton';