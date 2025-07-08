import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-white">
          <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          Tempo Médio de Resposta
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex flex-col space-y-4">
            <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="h-4 w-28 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
        ) : (
          <div className="flex flex-col space-y-2">
            <div className="text-3xl font-bold text-gray-800 dark:text-white">
              {avgResponseTime}h
            </div>
            <div
              className={`text-sm flex items-center ${
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
              <span>
                {isImproving ? "Melhorou" : "Piorou"}{" "}
                {improvementPercentage.toFixed(1)}%
              </span>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Comparado ao período anterior ({previousPeriod}h)
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-300 mt-1">
              Meta: menos de 2h
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ResponseTimeCard;
