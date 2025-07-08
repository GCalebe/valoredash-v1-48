import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TrendingUp,
  TrendingDown,
  Target,
  DollarSign,
  Users,
  MousePointer,
  Clock,
  Zap,
} from "lucide-react";
import StatCard from "./StatCard";

interface UTMAdvancedMetricsProps {
  data: {
    ctr: number;
    cpc: number;
    roas: number;
    conversionValuePerLead: number;
    sessionDuration: number;
    bounceRate: number;
    topPerformingCampaign: string;
    worstPerformingCampaign: string;
  };
  loading?: boolean;
}

const UTMAdvancedMetrics: React.FC<UTMAdvancedMetricsProps> = ({
  data,
  loading,
}) => {
  const mockData = {
    ctr: 3.2,
    cpc: 1.45,
    roas: 380,
    conversionValuePerLead: 250,
    sessionDuration: 145,
    bounceRate: 42,
    topPerformingCampaign: "black_friday_2024",
    worstPerformingCampaign: "summer_sale",
  };

  const metricsData = loading ? mockData : { ...mockData, ...data };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="CTR Médio"
          value={`${metricsData.ctr}%`}
          icon={<MousePointer />}
          trend="Taxa de cliques das campanhas"
          loading={loading}
          iconBgClass="bg-blue-100 dark:bg-blue-900/30"
          iconTextClass="text-blue-600 dark:text-blue-400"
        />

        <StatCard
          title="CPC Médio"
          value={`R$ ${metricsData.cpc}`}
          icon={<DollarSign />}
          trend="Custo por clique"
          loading={loading}
          iconBgClass="bg-green-100 dark:bg-green-900/30"
          iconTextClass="text-green-600 dark:text-green-400"
        />

        <StatCard
          title="ROAS"
          value={`${metricsData.roas}%`}
          icon={<TrendingUp />}
          trend="Retorno sobre investimento"
          loading={loading}
          iconBgClass="bg-purple-100 dark:bg-purple-900/30"
          iconTextClass="text-purple-600 dark:text-purple-400"
        />

        <StatCard
          title="Valor por Lead"
          value={`R$ ${metricsData.conversionValuePerLead}`}
          icon={<Target />}
          trend="Valor médio de conversão"
          loading={loading}
          iconBgClass="bg-orange-100 dark:bg-orange-900/30"
          iconTextClass="text-orange-600 dark:text-orange-400"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Duração da Sessão"
          value={`${metricsData.sessionDuration}s`}
          icon={<Clock />}
          trend="Tempo médio no site"
          loading={loading}
          iconBgClass="bg-cyan-100 dark:bg-cyan-900/30"
          iconTextClass="text-cyan-600 dark:text-cyan-400"
        />

        <StatCard
          title="Taxa de Rejeição"
          value={`${metricsData.bounceRate}%`}
          icon={<TrendingDown />}
          trend="Visitantes que saem rapidamente"
          loading={loading}
          iconBgClass="bg-red-100 dark:bg-red-900/30"
          iconTextClass="text-red-600 dark:text-red-400"
        />

        <Card className="col-span-1 md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-md font-medium text-gray-500 dark:text-gray-400">
              Performance das Campanhas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-green-500" />
                <span className="text-sm">Melhor: </span>
                <span className="font-medium text-green-600">
                  {metricsData.topPerformingCampaign}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-red-500" />
                <span className="text-sm">Pior: </span>
                <span className="font-medium text-red-600">
                  {metricsData.worstPerformingCampaign}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UTMAdvancedMetrics;
