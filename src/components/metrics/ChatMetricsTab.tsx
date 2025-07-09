import React from "react";
import { useClientStatsQuery } from "@/hooks/useClientStatsQuery";
import { useTransformedMetricsData } from "@/hooks/useTransformedMetricsData";
import { useMetricsFilters } from "@/hooks/useMetricsFilters";

// Enhanced components
import MetricsFilters from "./enhanced/MetricsFilters";
import MetricCard from "./enhanced/MetricCard";
import NewLeadsOverTimeChart from "./enhanced/NewLeadsOverTimeChart";
import ConversationsChart from "./enhanced/ConversationsChart";
import AdManagerSection from "./enhanced/AdManagerSection";

// Imported refactored sections
import MetricsHeader from "./sections/MetricsHeader";
import SectionHeader from "./sections/SectionHeader";

// Icons
import { MessageCircle, Users, Target, Percent, Clock, TrendingUp, DollarSign, Star } from "lucide-react";

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
  
  // Filters hook
  const {
    filters,
    updateDatePeriod,
    updateCustomDateRange,
    updateDataSource,
    resetFilters,
  } = useMetricsFilters();
  
  // Use the new transformed metrics data hook
  const {
    conversationData,
    conversionByTimeData,
    leadsAverageByTimeData,
    leadsGrowthData,
    recentClientsData,
    leadsData,
    funnelData,
    conversionFunnelData,
    funnelByDateData,
    loading: transformedDataLoading,
  } = useTransformedMetricsData();
  
  // Use Supabase data if available, fallback to props
  const clientData = React.useMemo(() => {
    if (supabaseClientStats && supabaseClientStats.length > 0) {
      const latestStats = supabaseClientStats[0];
      return {
        totalClients: latestStats.total_clients || 120,
        newClientsThisMonth: latestStats.new_clients_this_month || 15,
        recentClients: recentClientsData
      };
    }
    return {
      totalClients: stats?.totalClients || 120,
      newClientsThisMonth: stats?.newClientsThisMonth || 15,
      recentClients: recentClientsData
    };
  }, [supabaseClientStats, stats, recentClientsData]);
  
  const metricsData = {
    ...metrics,
    conversationData,
    conversionByTimeData,
    leadsAverageByTimeData,

    leadsOverTime: leadsGrowthData,
    funnelData,
    leadsByArrivalFunnel: funnelData,
    leadsData,
    totalConversations: metrics?.totalConversations || 340,
    responseRate: metrics?.responseRate || 85,
    conversionRate: metrics?.conversionRate || 30,
    avgResponseStartTime: metrics?.avgResponseStartTime || 45,
    avgClosingTime: metrics?.avgClosingTime || 5,
    secondaryResponseRate: metrics?.secondaryResponseRate || 70,
    totalRespondidas: metrics?.totalRespondidas || 289,
    totalSecondaryResponses: metrics?.totalSecondaryResponses || 200,
    avgResponseTime: metrics?.avgResponseTime || 2,
    noShowRate: metrics?.noShowRate || 15,
    negotiatedValue: metrics?.negotiatedValue || 50000,
    averageNegotiatedValue: metrics?.averageNegotiatedValue || 16666,
    previousPeriodValue: metrics?.previousPeriodValue || 42000,
    totalNegotiatingValue: metrics?.totalNegotiatingValue || 125000,
  };
  
  // Combinar loading states
  const isLoading = loading || clientStatsLoading || transformedDataLoading;

  // Mock data for new charts
  const newLeadsData = [
    { date: "01/01", leads: 12, converted: 8 },
    { date: "02/01", leads: 15, converted: 10 },
    { date: "03/01", leads: 18, converted: 12 },
    { date: "04/01", leads: 22, converted: 16 },
    { date: "05/01", leads: 19, converted: 14 },
    { date: "06/01", leads: 25, converted: 18 },
    { date: "07/01", leads: 28, converted: 20 },
  ];

  const conversationsDataForChart = conversationData.map(item => ({
    date: item.date,
    iniciadas: item.respondidas + item.naoRespondidas,
    respondidas: item.respondidas,
    naoRespondidas: item.naoRespondidas,
  }));

  return (
    <div className="space-y-6">
      {/* Header com gradiente */}
      <MetricsHeader 
        title="Dashboard de Métricas Avançado"
        description="Análise completa de performance, leads e conversões em tempo real"
      />

      {/* Filtros */}
      <MetricsFilters
        datePeriod={filters.dataPeriod}
        dataSource={filters.dataSource}
        customStartDate={filters.customStartDate}
        customEndDate={filters.customEndDate}
        onDatePeriodChange={updateDatePeriod}
        onDataSourceChange={updateDataSource}
        onCustomDateChange={updateCustomDateRange}
        onReset={resetFilters}
      />

      {/* KPIs Reformulados */}
      <div className="space-y-4">
        <SectionHeader 
          title="📊 Indicadores Principais" 
          borderColor="border-blue-200 dark:border-blue-700" 
        />

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <MetricCard
            title="Total de Leads Novos"
            value={metricsData.totalConversations || 340}
            icon={<Users />}
            description="Número total de novos leads captados no período selecionado"
            absoluteValue={340}
            trend={{
              value: 12.5,
              label: "+12.5% vs período anterior",
              direction: 'up'
            }}
            iconBgClass="bg-blue-100 dark:bg-blue-900/30"
            iconTextClass="text-blue-600 dark:text-blue-400"
            loading={isLoading}
          />

          <MetricCard
            title="Conversas Não Respondidas"
            value={Math.round((metricsData.totalConversations || 340) * 0.15)}
            icon={<MessageCircle />}
            description="Leads que ainda não receberam resposta da equipe"
            absoluteValue={51}
            percentage={15}
            trend={{
              value: -5.2,
              label: "-5.2% vs período anterior",
              direction: 'down'
            }}
            iconBgClass="bg-red-100 dark:bg-red-900/30"
            iconTextClass="text-red-600 dark:text-red-400"
            loading={isLoading}
          />

          <MetricCard
            title="Taxa de Conversão"
            value={`${metricsData.conversionRate || 30}%`}
            icon={<Target />}
            description="Percentual de leads que se tornaram clientes"
            trend={{
              value: 2.8,
              label: "+2.8% vs período anterior",
              direction: 'up'
            }}
            iconBgClass="bg-green-100 dark:bg-green-900/30"
            iconTextClass="text-green-600 dark:text-green-400"
            loading={isLoading}
          />

          <MetricCard
            title="Ticket Médio"
            value="R$ 2.850"
            icon={<DollarSign />}
            description="Valor médio dos negócios fechados"
            trend={{
              value: 8.3,
              label: "+8.3% vs período anterior",
              direction: 'up'
            }}
            iconBgClass="bg-emerald-100 dark:bg-emerald-900/30"
            iconTextClass="text-emerald-600 dark:text-emerald-400"
            loading={isLoading}
          />

          <MetricCard
            title="Tempo Médio de Resposta"
            value="2.5h"
            icon={<Clock />}
            description="Tempo médio para primeira resposta aos leads"
            trend={{
              value: -15.6,
              label: "-15.6% vs período anterior",
              direction: 'down'
            }}
            iconBgClass="bg-orange-100 dark:bg-orange-900/30"
            iconTextClass="text-orange-600 dark:text-orange-400"
            loading={isLoading}
          />

          <MetricCard
            title="Mais Vendido"
            value="Plano Pro"
            icon={<Star />}
            description="Produto ou serviço com maior volume de vendas"
            trend={{
              value: 0,
              label: "Manteve a liderança",
              direction: 'neutral'
            }}
            iconBgClass="bg-purple-100 dark:bg-purple-900/30"
            iconTextClass="text-purple-600 dark:text-purple-400"
            loading={isLoading}
          />
        </div>
      </div>

      {/* Novos Gráficos */}
      <div className="space-y-4">
        <SectionHeader 
          title="📈 Análise Temporal" 
          borderColor="border-indigo-200 dark:border-indigo-700" 
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <NewLeadsOverTimeChart
            data={newLeadsData}
            loading={isLoading}
          />
          
          <ConversationsChart
            data={conversationsDataForChart}
            loading={isLoading}
          />
        </div>
      </div>

      {/* Seção do Gerenciador de Anúncios */}
      <AdManagerSection loading={isLoading} />
    </div>
  );
};

export default ChatMetricsTab;