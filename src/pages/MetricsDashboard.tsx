import React from "react";
import { LineChart } from "lucide-react";
import { useClientStatsQuery } from "@/hooks/useClientStatsQuery";
import { useConversationMetricsQuery } from "@/hooks/useConversationMetricsQuery";
import { useDashboardRealtime } from "@/hooks/useDashboardRealtime";

// Import components
import DashboardHeader from "@/components/metrics/DashboardHeader";
import ChatMetricsTab from "@/components/metrics/ChatMetricsTab";

const MetricsDashboard = () => {
  // React Query hooks - automatic data fetching and caching
  const { stats, loading: statsLoading } = useClientStatsQuery();
  const { metrics, loading: metricsLoading } = useConversationMetricsQuery();
  
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

        {/* Chat Metrics Content */}
        <div className="w-full">
          <ChatMetricsTab stats={stats} metrics={metrics} loading={loading} />
        </div>
        
        {/* Componente de teste removido */}
      </main>
    </div>
  );
};

export default MetricsDashboard;