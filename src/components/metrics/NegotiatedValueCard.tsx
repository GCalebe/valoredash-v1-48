import React from "react";
import { Card, CardContent } from "@/components/ui/card";
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
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Card className="dark:bg-gray-800 transition-all duration-300 hover:shadow-lg">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-2 flex-shrink-0">
            <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
              Valor Negociado
            </h3>
            <div className="text-xl font-bold text-gray-800 dark:text-white">
              {loading ? (
                <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              ) : (
                formatCurrency(totalValue)
              )}
            </div>
            <div className="text-xs text-green-600 dark:text-green-400 flex items-center">
              <DollarSign className="h-3 w-3 mr-1" />
              <span className="truncate">{totalDeals} negócios fechados</span>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
              Ticket médio: {formatCurrency(averageValue)}
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

export default NegotiatedValueCard;