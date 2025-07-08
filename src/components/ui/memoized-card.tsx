import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MemoizedCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  loading?: boolean;
  onClick?: () => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary';
}

/**
 * Card otimizado com memoização para evitar re-renders desnecessários
 * Usado principalmente no Dashboard e componentes de métricas
 */
export const MemoizedCard = React.memo<MemoizedCardProps>(({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
  loading = false,
  onClick,
  variant = 'default'
}) => {
  // Formatar valor de forma memoizada
  const formattedValue = React.useMemo(() => {
    if (loading) return '...';
    
    if (typeof value === 'number') {
      // Formatar números grandes
      if (value >= 1000000) {
        return `${(value / 1000000).toFixed(1)}M`;
      } else if (value >= 1000) {
        return `${(value / 1000).toFixed(1)}K`;
      }
      return value.toLocaleString('pt-BR');
    }
    
    return value;
  }, [value, loading]);

  // Classe do trend memoizada
  const trendClasses = React.useMemo(() => {
    if (!trend) return '';
    
    return cn(
      'text-xs font-medium',
      trend.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
    );
  }, [trend]);

  const cardClasses = React.useMemo(() => {
    return cn(
      'transition-all duration-200',
      onClick && 'cursor-pointer hover:shadow-md hover:scale-105',
      loading && 'animate-pulse',
      className
    );
  }, [onClick, loading, className]);

  const variantClasses = React.useMemo(() => {
    switch (variant) {
      case 'destructive':
        return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950';
      case 'outline':
        return 'border-2';
      case 'secondary':
        return 'bg-secondary';
      default:
        return '';
    }
  }, [variant]);

  return (
    <Card 
      className={cn(cardClasses, variantClasses)} 
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {Icon && (
          <Icon className={cn(
            "h-4 w-4",
            loading ? "text-muted-foreground" : "text-primary"
          )} />
        )}
      </CardHeader>
      
      <CardContent>
        <div className="text-2xl font-bold">
          {formattedValue}
        </div>
        
        {description && (
          <p className="text-xs text-muted-foreground mt-1">
            {description}
          </p>
        )}
        
        {trend && (
          <div className={trendClasses}>
            {trend.isPositive ? '+' : ''}{trend.value.toFixed(1)}%
          </div>
        )}
      </CardContent>
    </Card>
  );
}, (prevProps, nextProps) => {
  // Comparação customizada para otimizar re-renders
  return (
    prevProps.title === nextProps.title &&
    prevProps.value === nextProps.value &&
    prevProps.description === nextProps.description &&
    prevProps.loading === nextProps.loading &&
    prevProps.trend?.value === nextProps.trend?.value &&
    prevProps.trend?.isPositive === nextProps.trend?.isPositive &&
    prevProps.variant === nextProps.variant
  );
});

MemoizedCard.displayName = 'MemoizedCard';

/**
 * Card de loading otimizado
 */
export const MemoizedCardSkeleton = React.memo(() => (
  <Card className="animate-pulse">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <div className="h-4 w-24 bg-muted rounded"></div>
      <div className="h-4 w-4 bg-muted rounded"></div>
    </CardHeader>
    <CardContent>
      <div className="h-8 w-16 bg-muted rounded mb-2"></div>
      <div className="h-3 w-32 bg-muted rounded"></div>
    </CardContent>
  </Card>
));

MemoizedCardSkeleton.displayName = 'MemoizedCardSkeleton';

/**
 * Grid de cards otimizado para renderização em lote
 */
interface MemoizedCardGridProps {
  cards: MemoizedCardProps[];
  className?: string;
  columns?: 1 | 2 | 3 | 4 | 6;
}

export const MemoizedCardGrid = React.memo<MemoizedCardGridProps>(({
  cards,
  className,
  columns = 3
}) => {
  const gridClasses = React.useMemo(() => {
    const colClasses = {
      1: 'grid-cols-1',
      2: 'grid-cols-1 md:grid-cols-2',
      3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
      6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6',
    };
    
    return cn(
      'grid gap-6',
      colClasses[columns],
      className
    );
  }, [columns, className]);

  return (
    <div className={gridClasses}>
      {cards.map((card, index) => (
        <MemoizedCard key={`${card.title}-${index}`} {...card} />
      ))}
    </div>
  );
});

MemoizedCardGrid.displayName = 'MemoizedCardGrid';