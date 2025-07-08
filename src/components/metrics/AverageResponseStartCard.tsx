import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Clock } from "lucide-react";

interface AverageResponseStartCardProps {
  avgStartTime: number;
  loading?: boolean;
  trend?: string;
}

const AverageResponseStartCard: React.FC<AverageResponseStartCardProps> = ({
  avgStartTime,
  loading = false,
  trend,
}) => {
  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}min`;
  };

  return (
    <Card className="dark:bg-gray-800 transition-all duration-300 hover:shadow-lg">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full p-2 flex-shrink-0">
            <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
              Tempo Médio de Início
            </h3>
            <div className="text-xl font-bold text-gray-800 dark:text-white">
              {loading ? (
                <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              ) : (
                formatTime(avgStartTime)
              )}
            </div>
            <div className="text-xs text-blue-600 dark:text-blue-400 truncate">
              Tempo para primeira resposta
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

export default AverageResponseStartCard;