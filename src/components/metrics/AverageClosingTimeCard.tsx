import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-white">
          <Target className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          Tempo Médio de Fechamento
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex flex-col space-y-4">
            <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
        ) : (
          <div className="flex flex-col space-y-2">
            <div className="text-3xl font-bold text-gray-800 dark:text-white">
              {formatTime(avgClosingTime)}
            </div>
            <div className="text-sm text-orange-600 dark:text-orange-400">
              Janela média de compra
            </div>
            {trend && (
              <div className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                {trend}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AverageClosingTimeCard;
