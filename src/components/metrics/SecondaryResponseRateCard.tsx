import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircleMore } from "lucide-react";

interface SecondaryResponseRateCardProps {
  value: number;
  totalRespondidas: number;
  totalSecondaryResponses: number;
  loading?: boolean;
  showChart?: boolean;
}

const SecondaryResponseRateCard: React.FC<SecondaryResponseRateCardProps> = ({
  value,
  totalRespondidas,
  totalSecondaryResponses,
  loading = false,
  showChart = false,
}) => {
  return (
    <Card className="dark:bg-gray-800 transition-all duration-300 hover:shadow-lg">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-100 dark:bg-indigo-900/30 rounded-full p-2 flex-shrink-0">
            <MessageCircleMore className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
              Taxa de Resposta Secundária
            </h3>
            <div className="text-xl font-bold text-gray-800 dark:text-white">
              {loading ? (
                <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              ) : (
                `${value}%`
              )}
            </div>
            <div className="text-xs text-indigo-600 dark:text-indigo-400 flex items-center">
              <MessageCircleMore className="h-3 w-3 mr-1" />
              <span className="truncate">
                {totalSecondaryResponses} respostas secundárias de {totalRespondidas} conversas
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SecondaryResponseRateCard;