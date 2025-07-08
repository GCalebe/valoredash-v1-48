import React, { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useDashboardMetricsQuery } from "@/hooks/useDashboardMetricsQuery";
import { useDashboardRealtime } from "@/hooks/useOptimizedRealtime";
import { useScheduleData } from "@/hooks/useScheduleData";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import MetricsCard from "@/components/dashboard/MetricsCard";
import ChatsCard from "@/components/dashboard/ChatsCard";
import KnowledgeCard from "@/components/dashboard/KnowledgeCard";
import ClientsCard from "@/components/dashboard/ClientsCard";
import EvolutionCard from "@/components/dashboard/EvolutionCard";
import ScheduleCard from "@/components/dashboard/ScheduleCard";
import AIStoreCard from "@/components/dashboard/AIStoreCard";
import UserAIAccessCard from "@/components/dashboard/UserAIAccessCard";
import SubscriptionCard from "@/components/dashboard/SubscriptionCard";
import { MemoizedCardGrid } from "@/components/ui/memoized-card";

const Dashboard = React.memo(() => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const { refetchScheduleData } = useScheduleData();

  // Otimized real-time updates
  useDashboardRealtime();
  
  // Fetch dashboard metrics with cache
  const { data: metrics, isLoading: metricsLoading, error: metricsError } = useDashboardMetricsQuery();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/");
    }
  }, [user, isLoading, navigate]);

  // Memoize cards data to prevent unnecessary re-renders
  const dashboardCards = useMemo(() => [
    { 
      component: <MetricsCard key="metrics" />,
      priority: 1 
    },
    { 
      component: <ChatsCard key="chats" />,
      priority: 2 
    },
    { 
      component: <KnowledgeCard key="knowledge" />,
      priority: 3 
    },
    { 
      component: <ClientsCard key="clients" />,
      priority: 1 
    },
    { 
      component: <EvolutionCard key="evolution" />,
      priority: 3 
    },
    { 
      component: <ScheduleCard key="schedule" />,
      priority: 2 
    },
    { 
      component: <AIStoreCard key="ai-store" />,
      priority: 3 
    },
    { 
      component: <UserAIAccessCard key="user-access" />,
      priority: 3 
    },
    { 
      component: <SubscriptionCard key="subscription" />,
      priority: 2 
    }
  ], []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-600 dark:bg-gray-900">
        <div className="h-16 w-16 border-4 border-t-transparent border-amber-500 rounded-full animate-spin"></div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      <DashboardHeader />

      <main className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-center mb-10 text-gray-800 dark:text-gray-100 transition-colors duration-300">
          Painel Administrativo Valore
        </h2>

        {/* Display metrics error if any */}
        {metricsError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg dark:bg-red-950 dark:border-red-800">
            <p className="text-red-800 dark:text-red-200">
              Erro ao carregar métricas: {metricsError.message}
            </p>
          </div>
        )}

        {/* Optimized grid with priority-based rendering */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {dashboardCards
            .sort((a, b) => a.priority - b.priority)
            .map(card => card.component)}
        </div>

        {/* Debug info in development */}
        {process.env.NODE_ENV === 'development' && metrics && (
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-950 dark:border-blue-800">
            <p className="text-blue-800 dark:text-blue-200 text-sm">
              Dashboard carregado com {Object.keys(metrics).length} métricas
            </p>
          </div>
        )}
      </main>
    </div>
  );
});

export default Dashboard;