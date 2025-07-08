import React from "react";
import {
  MessageCircle,
  Users,
  TrendingUp,
  Target,
  Clock,
  Percent,
} from "lucide-react";
import StatCard from "./StatCard";
import ConversationChart from "./ConversationChart";
import ConversionFunnelChart from "./ConversionFunnelChart";
import ConversionByTimeChart from "./ConversionByTimeChart";
import RecentClientsTable from "./RecentClientsTable";
import LeadsTable from "./LeadsTable";
import SecondaryResponseRateCard from "./SecondaryResponseRateCard";
import ResponseTimeCard from "./ResponseTimeCard";
import NegotiatedValueCard from "./NegotiatedValueCard";
import NegotiatingValueCard from "./NegotiatingValueCard";
import AverageResponseStartCard from "./AverageResponseStartCard";
import AverageClosingTimeCard from "./AverageClosingTimeCard";
import LeadsAverageByTimeChart from "./LeadsAverageByTimeChart";
import LeadsBySourceChart from "./LeadsBySourceChart";
import LeadsGrowthChart from "./LeadsGrowthChart";
import LeadsByArrivalFunnelChart from "./LeadsByArrivalFunnelChart";
import { useClientStatsQuery } from "@/hooks/useClientStatsQuery";

interface ChatMetricsTabProps {
  stats: any;
  metrics: any;
  loading: boolean;
}

const ChatMetricsTab: React.FC<ChatMetricsTabProps> = ({
  stats,
  metrics,
  loading,
}) => {
  const { stats: supabaseClientStats, loading: clientStatsLoading, isStale } = useClientStatsQuery();
  
  // Use Supabase data if available, fallback to props
  const clientData = React.useMemo(() => {
    if (supabaseClientStats && supabaseClientStats.length > 0) {
      const latestStats = supabaseClientStats[0];
      return {
        totalClients: latestStats.total_clients || 0,
        newClientsThisMonth: latestStats.new_clients_this_month || 0,
        recentClients: []
      };
    }
    return stats || { totalClients: 0, newClientsThisMonth: 0, recentClients: [] };
  }, [supabaseClientStats, stats]);
  
  const metricsData = metrics || {};
  
  // Combinar loading states
  const isLoading = loading || clientStatsLoading;

  return (
    <div className="space-y-8">
      {/* Header com gradiente */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-800 dark:to-purple-800 rounded-xl p-6 text-white">
        <h3 className="text-2xl font-bold mb-2">
          Dashboard de Chat e Conversações
        </h3>
        <p className="text-blue-100 dark:text-blue-200">
          Acompanhe o desempenho das suas conversas e leads em tempo real
        </p>
      </div>

      {/* Bloco 1: KPIs Principais */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300 border-b-2 border-blue-200 dark:border-blue-700 pb-2">
          📊 Indicadores de Atendimento
        </h4>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            title="Total de Conversas"
            value={metricsData.totalConversations || 340}
            icon={<MessageCircle />}
            trend="Conversas iniciadas este período"
            loading={isLoading}
            iconBgClass="bg-blue-100 dark:bg-blue-900/30"
            iconTextClass="text-blue-600 dark:text-blue-400"
          />

          <StatCard
            title="Taxa de Resposta"
            value={`${metricsData.responseRate || 85}%`}
            icon={<Percent />}
            trend="Conversas respondidas"
            loading={isLoading}
            iconBgClass="bg-green-100 dark:bg-green-900/30"
            iconTextClass="text-green-600 dark:text-green-400"
          />

          <StatCard
            title="Total de Clientes"
            value={clientData.totalClients || 120}
            icon={<Users />}
            trend={`+${clientData.newClientsThisMonth || 15} este mês`}
            loading={isLoading}
            iconBgClass="bg-purple-100 dark:bg-purple-900/30"
            iconTextClass="text-purple-600 dark:text-purple-400"
          />

          <StatCard
            title="Taxa de Conversão"
            value={`${metricsData.conversionRate || 30}%`}
            icon={<Target />}
            trend="De leads para clientes"
            loading={isLoading}
            iconBgClass="bg-orange-100 dark:bg-orange-900/30"
            iconTextClass="text-orange-600 dark:text-orange-400"
          />
        </div>
      </div>

      {/* Bloco 2: Métricas de Tempo */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300 border-b-2 border-cyan-200 dark:border-cyan-700 pb-2">
          ⏱️ Métricas de Tempo
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AverageResponseStartCard
            avgStartTime={metricsData.avgResponseStartTime || 45}
            loading={isLoading}
            trend="Melhoria de 15% vs período anterior"
          />

          <AverageClosingTimeCard
            avgClosingTime={metricsData.avgClosingTime || 5}
            loading={isLoading}
            trend="Redução de 20% vs período anterior"
          />
        </div>
      </div>


      {/* Bloco 4: Métricas Secundárias */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300 border-b-2 border-purple-200 dark:border-purple-700 pb-2">
          📈 Métricas Detalhadas
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SecondaryResponseRateCard
            value={metricsData.secondaryResponseRate || 70}
            totalRespondidas={metricsData.totalRespondidas || 289}
            totalSecondaryResponses={metricsData.totalSecondaryResponses || 200}
            loading={isLoading}
          />

          <ResponseTimeCard
            avgResponseTime={metricsData.avgResponseTime || 2}
            loading={isLoading}
          />
        </div>
      </div>

      {/* Bloco 5: Gráficos de Performance */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300 border-b-2 border-yellow-200 dark:border-yellow-700 pb-2">
          📈 Análise de Performance
        </h4>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ConversationChart
            data={metricsData.conversationData || []}
            loading={isLoading}
          />
          <ConversionFunnelChart
            data={metricsData.funnelData || []}
            loading={isLoading}
            noShowRate={metricsData.noShowRate || 15}
            onFilterChange={(date, stages, showNoShow) => {
              console.log("Filtro aplicado no Funil de Conversão:", {
                date,
                stages,
                showNoShow,
              });
              // Aqui você pode implementar a lógica para filtrar os dados com base nos parâmetros
            }}
          />
        </div>

        <ConversionByTimeChart
          data={metricsData.conversionByTimeData || []}
          loading={isLoading}
        />

        <LeadsAverageByTimeChart
          data={metricsData.leadsAverageByTimeData || []}
          loading={isLoading}
        />
      </div>

      {/* Bloco 6: Análise de Leads */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300 border-b-2 border-red-200 dark:border-red-700 pb-2">
          🎯 Análise de Leads
        </h4>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LeadsBySourceChart
            data={metricsData.leadsBySource || []}
            loading={isLoading}
          />
          <LeadsGrowthChart
            data={metricsData.leadsOverTime || []}
            loading={isLoading}
          />
        </div>

        <LeadsByArrivalFunnelChart
          data={metricsData.leadsByArrivalFunnel || []}
          loading={isLoading}
          noShowRate={metricsData.noShowRate || 12}
          onFilterChange={(date, stages, showNoShow) => {
            console.log("Filtro aplicado no Funil por Data de Chegada:", {
              date,
              stages,
              showNoShow,
            });
            // Aqui você pode implementar a lógica para filtrar os dados com base nos parâmetros
          }}
        />
      </div>

      {/* Bloco 3: Métricas Financeiras */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300 border-b-2 border-green-200 dark:border-green-700 pb-2">
          💰 Métricas Financeiras
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <NegotiatedValueCard
            totalValue={metricsData.negotiatedValue || 50000}
            totalDeals={3}
            averageValue={metricsData.averageNegotiatedValue || 16666}
            loading={isLoading}
            trend="Crescimento de 19% vs período anterior"
            previousPeriodValue={metricsData.previousPeriodValue || 42000}
          />

          <NegotiatingValueCard
            totalValue={metricsData.totalNegotiatingValue || 125000}
            loading={loading}
            trend="Em processo de fechamento"
            activePipelines={8}
          />
        </div>
      </div>
      
      {/* Bloco 7: Tabelas Detalhadas */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300 border-b-2 border-indigo-200 dark:border-indigo-700 pb-2">
          📋 Dados Detalhados
        </h4>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentClientsTable
            clients={clientData.recentClients || []}
            loading={isLoading}
          />
          <LeadsTable leads={metricsData.leadsData || []} loading={isLoading} />
        </div>
      </div>
    </div>
  );
};

export default ChatMetricsTab;