import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  trend?: {
    value: number;
    label: string;
    direction: 'up' | 'down' | 'neutral';
  };
  loading?: boolean;
  iconBgClass?: string;
  iconTextClass?: string;
  isStale?: boolean;
  absoluteValue?: string | number;
  percentage?: number;
  className?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon,
  description,
  trend,
  loading = false,
  iconBgClass = "bg-primary/10",
  iconTextClass = "text-primary",
  isStale = false,
  absoluteValue,
  percentage,
  className,
}) => {
  const getTrendIcon = () => {
    if (!trend) return null;
    
    switch (trend.direction) {
      case 'up':
        return <TrendingUp className="h-3 w-3 text-green-600 dark:text-green-400" />;
      case 'down':
        return <TrendingDown className="h-3 w-3 text-red-600 dark:text-red-400" />;
      default:
        return <Minus className="h-3 w-3 text-gray-600 dark:text-gray-400" />;
    }
  };

  const getTrendColor = () => {
    if (!trend) return 'text-muted-foreground';
    
    switch (trend.direction) {
      case 'up':
        return 'text-green-600 dark:text-green-400';
      case 'down':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <Card className={cn("transition-all duration-300 hover:shadow-md", className)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-sm font-medium text-muted-foreground truncate">
                {title}
              </h3>
              {description && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-muted-foreground hover:text-primary cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">{description}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {isStale && (
                <Badge variant="outline" className="text-xs">
                  Desatualizado
                </Badge>
              )}
            </div>
            
            <div className="space-y-1">
              <div className="flex items-baseline gap-2">
                <div className="text-2xl font-bold text-foreground">
                  {loading ? (
                    <div className="h-8 w-20 bg-muted rounded animate-pulse" />
                  ) : (
                    value
                  )}
                </div>
                {percentage !== undefined && (
                  <span className="text-sm text-muted-foreground">
                    ({percentage}%)
                  </span>
                )}
              </div>
              
              {absoluteValue && (
                <div className="text-sm text-muted-foreground">
                  {typeof absoluteValue === 'number' 
                    ? absoluteValue.toLocaleString('pt-BR')
                    : absoluteValue
                  } no total
                </div>
              )}
            </div>

            {trend && (
              <div className={cn("flex items-center gap-1 mt-2 text-xs", getTrendColor())}>
                {getTrendIcon()}
                <span>{trend.label}</span>
              </div>
            )}
          </div>

          <div className={cn("rounded-full p-2 flex-shrink-0", iconBgClass)}>
            {React.cloneElement(icon as React.ReactElement, {
              className: cn("h-5 w-5", iconTextClass),
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MetricCard;