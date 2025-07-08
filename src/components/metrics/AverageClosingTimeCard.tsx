import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Target } from "lucide-react";

interface AverageClosingTimeCardProps {
  avgClosingTime: number;
  loading?: boolean;
  trend?: string;
}

const AverageClosingTimeCard: React.FC<AverageClosingTimeCardProps> = ({
  avgClosingTime,
  loading = false,
  trend,
}) => {
  const formatTime = (days: number) => {
    if (days < 1) {
      const hours = Math.floor(days * 24);
      return `${hours}h`;
    }
    return `${days} dias`;
  };

  return (
    <Card className="dark:bg-gray-800 transition-all duration-300 hover:shadow-lg">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="bg-orange-100 dark:bg-orange-900/30 rounded-full p-2 flex-shrink-0">
            <Target className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
              Tempo Médio de Fechamento
            </h3>
            <div className="text-xl font-bold text-gray-800 dark:text-white">
              {loading ? (
                <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              ) : (
                formatTime(avgClosingTime)
              )}
            </div>
            <div className="text-xs text-orange-600 dark:text-orange-400 truncate">
              Janela média de compra
            </div>
            {trend && (
              <div className="text-xs text-gray-600 dark:text-gray-300 mt-1 truncate">
                {trend}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AverageClosingTimeCard;