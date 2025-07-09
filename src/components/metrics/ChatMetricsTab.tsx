import React from "react";
import { useClientStatsQuery } from "@/hooks/useClientStatsQuery";
import { useTransformedMetricsData } from "@/hooks/useTransformedMetricsData";

// Imported refactored sections
import MetricsHeader from "./sections/MetricsHeader";
import KPISection from "./sections/KPISection";
import TimeMetricsSection from "./sections/TimeMetricsSection";
import DetailedMetricsSection from "./sections/DetailedMetricsSection";
import PerformanceChartsSection from "./sections/PerformanceChartsSection";

// Remaining imports for sections not yet refactored
import LeadsGrowthChart from "./LeadsGrowthChart";
import LeadsByArrivalFunnelChart from "./LeadsByArrivalFunnelChart";
import NegotiatedValueCard from "./NegotiatedValueCard";
import NegotiatingValueCard from "./NegotiatingValueCard";
import RecentClientsTable from "./RecentClientsTable";
import LeadsTable from "./LeadsTable";
import SectionHeader from "./sections/SectionHeader";

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

  return (
    <div className="space-y-8">
      {/* Header com gradiente */}
      <MetricsHeader 
        title="Dashboard de Chat e Conversações"
        description="Acompanhe o desempenho das suas conversas e leads em tempo real"
      />

      {/* KPIs Principais */}
      <KPISection
        totalConversations={metricsData.totalConversations || 340}
        responseRate={metricsData.responseRate || 85}
        totalClients={clientData.totalClients || 120}
        newClientsThisMonth={clientData.newClientsThisMonth || 15}
        conversionRate={metricsData.conversionRate || 30}
        loading={isLoading}
      />

      {/* Métricas de Tempo */}
      <TimeMetricsSection
        avgResponseStartTime={metricsData.avgResponseStartTime || 45}
        avgClosingTime={metricsData.avgClosingTime || 5}
        loading={isLoading}
      />

      {/* Métricas Detalhadas */}
      <DetailedMetricsSection
        secondaryResponseRate={metricsData.secondaryResponseRate || 70}
        totalRespondidas={metricsData.totalRespondidas || 289}
        totalSecondaryResponses={metricsData.totalSecondaryResponses || 200}
        avgResponseTime={metricsData.avgResponseTime || 2}
        loading={isLoading}
      />

      {/* Gráficos de Performance */}
      <PerformanceChartsSection
        conversationData={conversationData}
        conversionFunnelData={conversionFunnelData}
        conversionByTimeData={conversionByTimeData}
        leadsAverageByTimeData={leadsAverageByTimeData}
        noShowRate={metricsData.noShowRate || 15}
        loading={isLoading}
        transformedDataLoading={transformedDataLoading}
      />

      {/* Análise de Leads */}
      <div className="space-y-4">
        <SectionHeader 
          title="🎯 Análise de Leads" 
          borderColor="border-red-200 dark:border-red-700" 
        />

        <div className="grid grid-cols-1 gap-6">
          <LeadsGrowthChart
            data={leadsGrowthData}
            loading={isLoading}
          />
        </div>

        <LeadsByArrivalFunnelChart
          data={funnelByDateData}
          loading={transformedDataLoading}
          noShowRate={metricsData.noShowRate || 12}
          onFilterChange={(date, stages, showNoShow) => {
            console.log("Filtro aplicado no Funil por Data de Chegada:", {
              date,
              stages,
              showNoShow,
            });
          }}
        />
      </div>

      {/* Métricas Financeiras */}
      <div className="space-y-4">
        <SectionHeader 
          title="💰 Métricas Financeiras" 
          borderColor="border-green-200 dark:border-green-700" 
        />

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
      
      {/* Tabelas Detalhadas */}
      <div className="space-y-4">
        <SectionHeader 
          title="📋 Dados Detalhados" 
          borderColor="border-indigo-200 dark:border-indigo-700" 
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentClientsTable
            clients={recentClientsData}
            loading={isLoading}
          />
          <LeadsTable leads={leadsData} loading={isLoading} />
        </div>
      </div>
    </div>
  );
};

export default ChatMetricsTab;