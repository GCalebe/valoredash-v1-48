
import React, { useEffect, useState } from "react";
import { LineChart, MessageCircle, Share2 } from "lucide-react";
import { useClientStats } from "@/hooks/useClientStats";
import { useConversationMetrics } from "@/hooks/useConversationMetrics";
import { useDashboardRealtime } from "@/hooks/useDashboardRealtime";
import { useUTMTracking } from "@/hooks/useUTMTracking";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Import components
import DashboardHeader from "@/components/metrics/DashboardHeader";
import MetricsFilters from "@/components/metrics/MetricsFilters";
import ChatMetricsTab from "@/components/metrics/ChatMetricsTab";
import UTMMetricsTab from "@/components/metrics/UTMMetricsTab";

const MetricsDashboard = () => {
  const [dateFilter, setDateFilter] = useState("week");
  const [customDate, setCustomDate] = useState<Date | null>(null);
  const { stats, loading: statsLoading, refetchStats } = useClientStats();
  const {
    metrics,
    loading: metricsLoading,
    refetchMetrics,
  } = useConversationMetrics(dateFilter, customDate);
  const [selectedCampaign, setSelectedCampaign] = useState("all");
  const [selectedDevice, setSelectedDevice] = useState("all");

  const {
    metrics: utmMetrics,
    loading: utmLoading,
    refetchUTMData,
  } = useUTMTracking(selectedCampaign, selectedDevice);

  // Initialize real-time updates for the metrics dashboard
  useDashboardRealtime();

  // Fetch data when component mounts or filters change
  useEffect(() => {
    refetchStats();
    refetchMetrics();
    refetchUTMData();
  }, [
    refetchStats,
    refetchMetrics,
    refetchUTMData,
    selectedCampaign,
    selectedDevice,
    dateFilter,
    customDate,
  ]);

  const loading = statsLoading || metricsLoading;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}
      <DashboardHeader />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-800 dark:text-white">
            <LineChart className="h-6 w-6 text-petshop-blue dark:text-blue-400" />
            Dashboard de Métricas
          </h2>
          <MetricsFilters
            selectedDate={customDate}
            onDateChange={setCustomDate}
          />
        </div>

        {/* Tabs for Chat and UTM Metrics */}
        <Tabs defaultValue="chat" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Métricas de Chat
            </TabsTrigger>
            <TabsTrigger value="utm" className="flex items-center gap-2">
              <Share2 className="h-4 w-4" />
              Métricas UTM
            </TabsTrigger>
          </TabsList>

          {/* Chat Metrics Tab */}
          <TabsContent value="chat">
            <ChatMetricsTab stats={stats} metrics={metrics} loading={loading} />
          </TabsContent>

          {/* UTM Metrics Tab */}
          <TabsContent value="utm">
            <UTMMetricsTab
              utmMetrics={utmMetrics}
              utmLoading={utmLoading}
              selectedCampaign={selectedCampaign}
              onCampaignChange={setSelectedCampaign}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default MetricsDashboard;
