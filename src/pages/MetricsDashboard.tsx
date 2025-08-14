import React from "react";
import { LineChart } from "lucide-react";
import { useClientStatsQuery } from "@/hooks/useClientStatsQuery";
import { useConversationMetricsQuery } from "@/hooks/useConversationMetricsQuery";
import { useDashboardRealtime } from "@/hooks/useDashboardRealtime";

// Import components
import DashboardHeader from "@/components/dashboard/DashboardHeader";
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
        {/* Chat Metrics Content */}
        <div className="w-full">
          <ChatMetricsTab stats={stats} metrics={metrics} loading={loading} />
        </div>
      </main>
    </div>
  );
};

export default MetricsDashboard;