import React, { useEffect, useState } from "react";
import { LineChart, MessageCircle, Share2 } from "lucide-react";
import { useClientStatsQuery } from "@/hooks/useClientStatsQuery";
import { useConversationMetricsQuery } from "@/hooks/useConversationMetricsQuery";
import { useDashboardRealtime } from "@/hooks/useDashboardRealtime";
import { useUTMMetricsQuery } from "@/hooks/useUTMMetricsQuery";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Import components
import DashboardHeader from "@/components/metrics/DashboardHeader";
import ChatMetricsTab from "@/components/metrics/ChatMetricsTab";
import KanbanStagesFunnelChart from "@/components/metrics/KanbanStagesFunnelChart";
// import UTMMetricsTab from "@/components/metrics/UTMMetricsTab";
// PageTest removido conforme solicitado

const MetricsDashboard = () => {
  const [dateFilter, setDateFilter] = useState("week");
  const [selectedCampaign, setSelectedCampaign] = useState("all");
  const [selectedDevice, setSelectedDevice] = useState("all");

  // React Query hooks - automatic data fetching and caching
  const { stats, loading: statsLoading } = useClientStatsQuery();
  const { metrics, loading: metricsLoading } = useConversationMetricsQuery();
  const { data: utmMetrics = [], isLoading: utmLoading } = useUTMMetricsQuery();
  
  // Initialize real-time updates for the metrics dashboard
  useDashboardRealtime();

  const loading = statsLoading || metricsLoading;

  return (
    <div className="h-full bg-gray-100 dark:bg-gray-900 transition-colors duration-300 overflow-auto">
      {/* Header */}
      <DashboardHeader />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 pb-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-800 dark:text-white">
            <LineChart className="h-6 w-6 text-petshop-blue dark:text-blue-400" />
            Dashboard de Métricas
          </h2>
        </div>

        {/* Tabs for Chat and UTM Metrics */}
        <Tabs defaultValue="chat" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Métricas de Chat
            </TabsTrigger>
            <TabsTrigger value="funnel" className="flex items-center gap-2">
              <LineChart className="h-4 w-4" />
              Funil de Estágios
            </TabsTrigger>
            {/* <TabsTrigger value="utm" className="flex items-center gap-2">
              <Share2 className="h-4 w-4" />
              Métricas UTM
            </TabsTrigger> */}
          </TabsList>

          {/* Chat Metrics Tab */}
          <TabsContent value="chat">
            <ChatMetricsTab stats={stats} metrics={metrics} loading={loading} />
          </TabsContent>

          {/* Kanban Stages Funnel Tab */}
          <TabsContent value="funnel">
            <div className="grid gap-6">
              <KanbanStagesFunnelChart />
            </div>
          </TabsContent>

          {/* UTM Metrics Tab */}
          {/* <TabsContent value="utm">
            <UTMMetricsTab
              utmMetrics={utmMetrics}
              utmLoading={utmLoading}
              selectedCampaign={selectedCampaign}
              onCampaignChange={setSelectedCampaign}
            />
          </TabsContent> */}
        </Tabs>
        
        {/* Componente de teste removido */}
      </main>
    </div>
  );
};

export default MetricsDashboard;