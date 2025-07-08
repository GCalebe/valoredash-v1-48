import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      <CardHeader className="pb-2 flex flex-row justify-between items-center">
        <CardTitle className="text-md font-medium text-gray-500 dark:text-gray-400">
          {title}
        </CardTitle>
        {isStale && (
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs font-semibold animate-pulse"
            title="Último dado não pôde ser atualizado"
          >
            <AlertCircle className="h-4 w-4" />
            Desatualizado
          </span>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center">
          <div className="text-3xl font-bold text-gray-800 dark:text-white">
            {loading ? (
              <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            ) : (
              value
            )}
          </div>
          <div className={cn("rounded-full p-2", iconBgClass)}>
            {React.cloneElement(icon as React.ReactElement, {
              className: cn("h-5 w-5", iconTextClass),
            })}
          </div>
        </div>
        {trend && (
          <div className="mt-2 flex items-center text-sm text-green-600 dark:text-green-400">
            <TrendingUp className="h-3 w-3 mr-1" />
            <span>
              {loading ? (
                <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              ) : (
                trend
              )}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StatCard;
