import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, TrendingUp, TrendingDown } from "lucide-react";

interface ResponseTimeCardProps {
  avgResponseTime: number;
  loading?: boolean;
  previousPeriod?: number;
}

const ResponseTimeCard: React.FC<ResponseTimeCardProps> = ({
  avgResponseTime,
  loading = false,
  previousPeriod = 3.2,
}) => {
  const improvement = previousPeriod - avgResponseTime;
  const isImproving = improvement > 0;
  const improvementPercentage = Math.abs((improvement / previousPeriod) * 100);

  return (
    <Card className="dark:bg-gray-800 transition-all duration-300 hover:shadow-lg">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full p-2 flex-shrink-0">
            <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
              Tempo Médio de Resposta
            </h3>
            <div className="text-xl font-bold text-gray-800 dark:text-white">
              {loading ? (
                <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              ) : (
                `${avgResponseTime}h`
              )}
            </div>
            <div
              className={`text-xs flex items-center ${
                isImproving
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {isImproving ? (
                <TrendingUp className="h-3 w-3 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1" />
              )}
              <span className="truncate">
                {isImproving ? "Melhorou" : "Piorou"} {improvementPercentage.toFixed(1)}%
              </span>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
              Comparado ao período anterior ({previousPeriod}h)
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResponseTimeCard;