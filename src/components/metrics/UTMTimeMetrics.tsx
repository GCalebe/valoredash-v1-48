import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, TrendingUp, TrendingDown, BarChart3 } from "lucide-react";

interface UTMTimeMetricsProps {
  timeToConversion: {
    average: number;
    median: number;
    min: number;
    max: number;
  };
  loading?: boolean;
}

const UTMTimeMetrics: React.FC<UTMTimeMetricsProps> = ({
  timeToConversion,
  loading,
}) => {
  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Tempo para Conversão</CardTitle>
          <CardDescription>Análise temporal das conversões</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[100px]">
            <div className="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatTime = (hours: number) => {
    if (hours < 1) {
      return `${Math.round(hours * 60)}min`;
    } else if (hours < 24) {
      return `${hours.toFixed(1)}h`;
    } else {
      const days = Math.floor(hours / 24);
      const remainingHours = Math.round(hours % 24);
      return `${days}d ${remainingHours}h`;
    }
  };

  const metrics = [
    {
      title: "Tempo Médio",
      value: formatTime(timeToConversion.average),
      icon: <BarChart3 className="h-4 w-4" />,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      title: "Tempo Mediano",
      value: formatTime(timeToConversion.median),
      icon: <Clock className="h-4 w-4" />,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/30",
    },
    {
      title: "Mais Rápido",
      value: formatTime(timeToConversion.min),
      icon: <TrendingUp className="h-4 w-4" />,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
    },
    {
      title: "Mais Lento",
      value: formatTime(timeToConversion.max),
      icon: <TrendingDown className="h-4 w-4" />,
      color: "text-red-600",
      bgColor: "bg-red-100 dark:bg-red-900/30",
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">⏱️ Tempo para Conversão</CardTitle>
        <CardDescription>
          Análise temporal das conversões (primeiro toque até conversão)
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {metrics.map((metric) => (
            <div key={metric.title} className="flex items-center gap-2">
              <div className={`p-2 rounded-full ${metric.bgColor}`}>
                <div className={metric.color}>{metric.icon}</div>
              </div>
              <div>
                <div className="text-sm font-medium">{metric.value}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {metric.title}
                </div>
              </div>
            </div>
          ))}
        </div>

        {timeToConversion.average === 0 && (
          <div className="text-center py-4 text-gray-500">
            Nenhum dado de conversão temporal disponível
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UTMTimeMetrics;