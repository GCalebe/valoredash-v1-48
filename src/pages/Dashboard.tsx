import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useDashboardRealtimeQuery } from "@/hooks/useDashboardRealtimeQuery";
import { useScheduleData } from "@/hooks/useScheduleData";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import MetricsCard from "@/components/dashboard/MetricsCard";
import ChatsCard from "@/components/dashboard/ChatsCard";
import KnowledgeCard from "@/components/dashboard/KnowledgeCard";
import ClientsCard from "@/components/dashboard/ClientsCard";
import EvolutionCard from "@/components/dashboard/EvolutionCard";
import ScheduleCard from "@/components/dashboard/ScheduleCard";
// import AIStoreCard from "@/components/dashboard/AIStoreCard"; // Temporariamente removido
// import UserAIAccessCard from "@/components/dashboard/UserAIAccessCard"; // Temporariamente removido
import AccountManagementCard from "@/components/dashboard/AccountManagementCard";
import NavigationTest from "@/components/NavigationTest";
// DiagnosticPanel removido conforme solicitado

const Dashboard = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const { refetchScheduleData } = useScheduleData();

  // Initialize real-time updates for the dashboard
  useDashboardRealtimeQuery({ refetchScheduleData: async () => refetchScheduleData() });

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/");
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-blue-600 dark:bg-gray-900">
        <div className="h-16 w-16 border-4 border-t-transparent border-amber-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      <DashboardHeader />

      <main className="flex-1 flex flex-col items-center justify-start px-4 py-6 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100 transition-colors duration-300 text-center">
          Painel Administrativo
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto w-full mb-8">
          <MetricsCard />
          <ChatsCard />
          <KnowledgeCard />
          <ClientsCard />
          <EvolutionCard />
          <ScheduleCard />
          {/* AIStoreCard temporariamente removido */}
          {/* UserAIAccessCard temporariamente removido */}
          <AccountManagementCard />
        </div>
        
        {/* Componente de diagnóstico removido */}
      </main>
    </div>
  );
};

export default Dashboard;