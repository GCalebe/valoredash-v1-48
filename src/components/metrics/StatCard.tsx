import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  loading?: boolean;
  iconBgClass?: string;
  iconTextClass?: string;
  isStale?: boolean;
}

const StatCard = ({
  title,
  value,
  icon,
  trend,
  loading = false,
  iconBgClass = "bg-purple-100 dark:bg-purple-900/30",
  iconTextClass = "text-purple-600 dark:text-purple-400",
  isStale = false,
}: StatCardProps) => {
  return (
    <Card className="dark:bg-gray-800 transition-all duration-300 hover:shadow-lg relative">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={cn("rounded-full p-2 flex-shrink-0", iconBgClass)}>
            {React.cloneElement(icon as React.ReactElement, {
              className: cn("h-4 w-4", iconTextClass),
            })}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
              {title}
            </h3>
            <div className="flex items-center gap-2">
              <div className="text-xl font-bold text-gray-800 dark:text-white">
                {loading ? (
                  <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                ) : (
                  value
                )}
              </div>
              {isStale && (
                <span
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs font-medium animate-pulse"
                  title="Último dado não pôde ser atualizado"
                >
                  <AlertCircle className="h-3 w-3" />
                </span>
              )}
            </div>
            {trend && (
              <div className="mt-1 flex items-center text-xs text-green-600 dark:text-green-400">
                <TrendingUp className="h-3 w-3 mr-1" />
                <span className="truncate">
                  {loading ? (
                    <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  ) : (
                    trend
                  )}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;