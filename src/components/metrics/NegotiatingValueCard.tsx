import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

interface NegotiatingValueCardProps {
  totalValue: number;
  loading?: boolean;
  trend?: string;
  activePipelines?: number;
}

const NegotiatingValueCard: React.FC<NegotiatingValueCardProps> = ({
  totalValue,
  loading = false,
  trend,
  activePipelines = 0,
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <Card className="dark:bg-gray-800 transition-all duration-300 hover:shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-white">
          <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          Valor sendo Negociado
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
              {formatCurrency(totalValue)}
            </div>
            <div className="text-sm text-blue-600 dark:text-blue-400 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              <span>{activePipelines} negociações ativas</span>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Valor total em pipeline
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

export default NegotiatingValueCard;
