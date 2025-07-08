import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-white">
          <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          Tempo Médio de Início
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
              {formatTime(avgStartTime)}
            </div>
            <div className="text-sm text-blue-600 dark:text-blue-400">
              Tempo para primeira resposta
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

export default AverageResponseStartCard;
