import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign } from "lucide-react";

interface NegotiatedValueCardProps {
  totalValue: number;
  totalDeals?: number;
  averageValue: number;
  loading?: boolean;
  trend?: string;
  previousPeriodValue?: number;
}

const NegotiatedValueCard: React.FC<NegotiatedValueCardProps> = ({
  totalValue,
  totalDeals = 0,
  averageValue,
  loading = false,
  trend,
  previousPeriodValue,
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
          <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
          Valor Negociado
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
            <div className="text-sm text-green-600 dark:text-green-400 flex items-center">
              <DollarSign className="h-3 w-3 mr-1" />
              <span>{totalDeals} negócios fechados</span>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Ticket médio: {formatCurrency(averageValue)}
            </div>
            {trend && (
              <div className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                {trend}
              </div>
            )}
            {previousPeriodValue && (
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Período anterior: {formatCurrency(previousPeriodValue)}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NegotiatedValueCard;
