import React, { useCallback } from "react";
import { useConsolidatedMetrics } from "@/hooks/useConsolidatedMetrics";
import { useRealTimeMetrics } from "@/hooks/useRealTimeMetrics";
import { useValidatedData } from "@/hooks/useValidatedData";
import { useMetricsFilters } from "@/hooks/useMetricsFilters";

// Enhanced components
import MetricsFilters from "./enhanced/MetricsFilters";
import MetricCard from "./enhanced/MetricCard";
import NewLeadsOverTimeChart from "./enhanced/NewLeadsOverTimeChart";
import ConversationsChart from "./enhanced/ConversationsChart";
import AdManagerSection from "./enhanced/AdManagerSection";
import KanbanStagesFunnelChart from "./KanbanStagesFunnelChart";

// Imported refactored sections
import MetricsHeader from "./sections/MetricsHeader";
import SectionHeader from "./sections/SectionHeader";

// Individual filters
import SectionDateFilter from "./filters/SectionDateFilter";
import { useIndividualMetricsFilters } from "@/hooks/useIndividualMetricsFilters";

// Icons
import { MessageCircle, Users, Target, Clock, TrendingUp, DollarSign, Star, RefreshCw, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ChatMetricsTabProps {
  stats: unknown;
  metrics: unknown;
  loading: boolean;
}

const ChatMetricsTab: React.FC<ChatMetricsTabProps> = ({
  stats,
  metrics,
  loading,
}) => {
  // Novos hooks consolidados
  const {
    metrics: consolidatedMetrics,
    timeSeriesData,
    leadsBySource,
    loading: consolidatedLoading,
    error: consolidatedError,
  } = useConsolidatedMetrics();
  
  // Get filters from separate hook  
  const { filters } = useMetricsFilters();
  
  // Real-time updates
  const { lastUpdate, updateCount, forceRefresh, isConnected } = useRealTimeMetrics();
  
  // Validação de dados
  const {
    metrics: validatedMetrics,
    timeSeries: validatedTimeSeries,
    dataQuality,
    allErrors,
    allWarnings,
    isDataReliable,
    hasWarnings,
  } = useValidatedData(consolidatedMetrics, timeSeriesData, consolidatedMetrics?.lastUpdated);
  
  // Filters hook
  const {
    updateDatePeriod,
    updateCustomDateRange,
    resetFilters,
  } = useMetricsFilters();

  // Individual section filters
  const indicatorsFilter = useIndividualMetricsFilters('indicators', filters);
  const timeAnalysisFilter = useIndividualMetricsFilters('timeAnalysis', filters);
  const funnelFilter = useIndividualMetricsFilters('funnel', filters);
  const adManagerFilter = useIndividualMetricsFilters('adManager', filters);

  const handleDatePeriodChange = useCallback((period: string) => {
    console.log('🎯 ChatMetricsTab: handleDatePeriodChange chamado com:', period);
    updateDatePeriod(period);
  }, [updateDatePeriod]);
  
  // Estado de loading consolidado
  const isLoading = loading || consolidatedLoading;
  
  // Preparar dados dos gráficos usando dados validados
  const newLeadsData = validatedTimeSeries.data?.map((item: any) => ({
    date: item.date,
    leads: item.leads,
    converted: item.converted,
  })) || [];

  const conversationsDataForChart = validatedTimeSeries.data?.map((item: any) => ({
    date: item.date,
    iniciadas: item.iniciadas,
    respondidas: item.respondidas,
    naoRespondidas: item.naoRespondidas,
  })) || [];
  
  // Usar dados validados ou fallback
  const safeMetrics = validatedMetrics.data as any || {};

  return (
    <div className="space-y-6">
      {/* Header com gradiente */}
      <MetricsHeader 
        title="Dashboard de Métricas Avançado"
        description="Análise completa de performance, leads e conversões em tempo real"
      />

      {/* Status da Conexão e Qualidade dos Dados */}
      {!isDataReliable && (
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
          <CardContent className="flex items-center gap-3 p-4">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                Qualidade dos dados: {dataQuality.score}/100
              </p>
              <p className="text-xs text-orange-600 dark:text-orange-300">
                {allErrors.length > 0 && `${allErrors.length} erro(s). `}
                {allWarnings.length > 0 && `${allWarnings.length} aviso(s).`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={isConnected ? "default" : "destructive"}>
                {isConnected ? "Conectado" : "Desconectado"}
              </Badge>
              <Button size="sm" variant="outline" onClick={forceRefresh}>
                <RefreshCw className="h-4 w-4 mr-1" />
                Atualizar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Header com Filtros */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
          Métricas de Conversas
        </h3>
        <MetricsFilters
          datePeriod={filters.dataPeriod}
          customStartDate={filters.customStartDate}
          customEndDate={filters.customEndDate}
          onDatePeriodChange={handleDatePeriodChange}
          onCustomDateChange={updateCustomDateRange}
          onReset={resetFilters}
        />
      </div>

      {/* KPIs Reformulados */}
      <div className="space-y-4">
        <SectionHeader 
          title="📊 Indicadores Principais" 
          borderColor="border-blue-200 dark:border-blue-700"
        >
          <SectionDateFilter
            sectionId="indicators"
            datePeriod={indicatorsFilter.filters.dataPeriod}
            customStartDate={indicatorsFilter.filters.customStartDate}
            customEndDate={indicatorsFilter.filters.customEndDate}
            isInheritingGlobal={indicatorsFilter.isInheritingGlobal}
            onDatePeriodChange={indicatorsFilter.updateDatePeriod}
            onCustomDateChange={indicatorsFilter.updateCustomDateRange}
            onToggleInheritGlobal={indicatorsFilter.toggleInheritGlobal}
            onReset={indicatorsFilter.resetFilters}
          />
          <Badge variant="outline" className="text-xs">
            {safeMetrics.isStale ? "Dados desatualizados" : "Tempo real"}
          </Badge>
          {lastUpdate && (
            <span className="text-xs text-muted-foreground">
              Última atualização: {lastUpdate.toLocaleTimeString('pt-BR')}
            </span>
          )}
        </SectionHeader>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <MetricCard
            title="Total de Leads"
            value={safeMetrics.totalLeads || 0}
            icon={<Users />}
            description="Número total de leads captados no período selecionado"
            absoluteValue={safeMetrics.totalLeads || 0}
            trend={{
              value: 12.5,
              label: "+12.5% vs período anterior",
              direction: 'up'
            }}
            iconBgClass="bg-blue-100 dark:bg-blue-900/30"
            iconTextClass="text-blue-600 dark:text-blue-400"
            loading={isLoading}
            isStale={safeMetrics.isStale}
          />

          <MetricCard
            title="Respostas¹"
            value={safeMetrics.conversasNaoRespondidas || 0}
            icon={<MessageCircle />}
            description="Leads que ainda não receberam resposta da equipe"
            absoluteValue={safeMetrics.conversasNaoRespondidas || 0}
            percentage={safeMetrics.totalConversations > 0 ? 
              Math.round((safeMetrics.conversasNaoRespondidas / safeMetrics.totalConversations) * 100) : 0
            }
            trend={{
              value: -5.2,
              label: "-5.2% vs período anterior",
              direction: 'down'
            }}
            iconBgClass="bg-red-100 dark:bg-red-900/30"
            iconTextClass="text-red-600 dark:text-red-400"
            loading={isLoading}
            isStale={safeMetrics.isStale}
          />

          <MetricCard
            title="Taxa de Conversão"
            value={`${safeMetrics.conversionRate?.toFixed(1) || 0}%`}
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
            isStale={safeMetrics.isStale}
          />

          <MetricCard
            title="Ticket Médio"
            value={`R$ ${(safeMetrics.ticketMedio || 0).toLocaleString('pt-BR')}`}
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
            isStale={safeMetrics.isStale}
          />

          <MetricCard           
            title={<>Tempo de<br />Resposta</>}
            value={`${safeMetrics.avgResponseTime?.toFixed(1) || 0}h`}
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
            isStale={safeMetrics.isStale}
          />

          <MetricCard
            title="Respostas²"
            value={`${safeMetrics.responseRate?.toFixed(1) || 0}%`}
            icon={<Star />}
            description="Percentual de conversas que receberam resposta"
            trend={{
              value: 0,
              label: "Mantendo o nível",
              direction: 'neutral'
            }}
            iconBgClass="bg-purple-100 dark:bg-purple-900/30"
            iconTextClass="text-purple-600 dark:text-purple-400"
            loading={isLoading}
            isStale={safeMetrics.isStale}
          />
        </div>
      </div>

      {/* Novos Gráficos */}
      <div className="space-y-4">
        <SectionHeader 
          title="📈 Análise Temporal" 
          borderColor="border-indigo-200 dark:border-indigo-700"
        >
          <SectionDateFilter
            sectionId="timeAnalysis"
            datePeriod={timeAnalysisFilter.filters.dataPeriod}
            customStartDate={timeAnalysisFilter.filters.customStartDate}
            customEndDate={timeAnalysisFilter.filters.customEndDate}
            isInheritingGlobal={timeAnalysisFilter.isInheritingGlobal}
            onDatePeriodChange={timeAnalysisFilter.updateDatePeriod}
            onCustomDateChange={timeAnalysisFilter.updateCustomDateRange}
            onToggleInheritGlobal={timeAnalysisFilter.toggleInheritGlobal}
            onReset={timeAnalysisFilter.resetFilters}
          />
        </SectionHeader>

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

      {/* Funil do Kanban */}
      <div className="space-y-4">
        <SectionHeader 
          title="🎯 Funil de Conversão por Estágios" 
          borderColor="border-emerald-200 dark:border-emerald-700"
        >
          <SectionDateFilter
            sectionId="funnel"
            datePeriod={funnelFilter.filters.dataPeriod}
            customStartDate={funnelFilter.filters.customStartDate}
            customEndDate={funnelFilter.filters.customEndDate}
            isInheritingGlobal={funnelFilter.isInheritingGlobal}
            onDatePeriodChange={funnelFilter.updateDatePeriod}
            onCustomDateChange={funnelFilter.updateCustomDateRange}
            onToggleInheritGlobal={funnelFilter.toggleInheritGlobal}
            onReset={funnelFilter.resetFilters}
          />
        </SectionHeader>

        <KanbanStagesFunnelChart />
      </div>

      {/* Seção do Gerenciador de Anúncios */}
      <div className="space-y-4">
        <SectionHeader 
          title="📊 Gerenciador de Anúncios" 
          borderColor="border-purple-200 dark:border-purple-700"
        >
          <SectionDateFilter
            sectionId="adManager"
            datePeriod={adManagerFilter.filters.dataPeriod}
            customStartDate={adManagerFilter.filters.customStartDate}
            customEndDate={adManagerFilter.filters.customEndDate}
            isInheritingGlobal={adManagerFilter.isInheritingGlobal}
            onDatePeriodChange={adManagerFilter.updateDatePeriod}
            onCustomDateChange={adManagerFilter.updateCustomDateRange}
            onToggleInheritGlobal={adManagerFilter.toggleInheritGlobal}
            onReset={adManagerFilter.resetFilters}
          />
        </SectionHeader>
        <AdManagerSection loading={isLoading} />
      </div>
    </div>
  );
};

export default ChatMetricsTab;