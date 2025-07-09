import React from 'react';
import { MessageCircle, Users, Target, Percent } from 'lucide-react';
import StatCard from '../StatCard';
import SectionHeader from './SectionHeader';

interface KPISectionProps {
  totalConversations: number;
  responseRate: number;
  totalClients: number;
  newClientsThisMonth: number;
  conversionRate: number;
  loading: boolean;
}

const KPISection: React.FC<KPISectionProps> = ({
  totalConversations,
  responseRate,
  totalClients,
  newClientsThisMonth,
  conversionRate,
  loading,
}) => {
  return (
    <div className="space-y-4">
      <SectionHeader 
        title="📊 Indicadores Principais" 
        borderColor="border-blue-200 dark:border-blue-700" 
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total de Conversas"
          value={totalConversations}
          icon={<MessageCircle />}
          trend="Conversas iniciadas este período"
          loading={loading}
          iconBgClass="bg-blue-100 dark:bg-blue-900/30"
          iconTextClass="text-blue-600 dark:text-blue-400"
        />

        <StatCard
          title="Taxa de Resposta"
          value={`${responseRate}%`}
          icon={<Percent />}
          trend="Conversas respondidas"
          loading={loading}
          iconBgClass="bg-green-100 dark:bg-green-900/30"
          iconTextClass="text-green-600 dark:text-green-400"
        />

        <StatCard
          title="Total de Clientes"
          value={totalClients}
          icon={<Users />}
          trend={`+${newClientsThisMonth} este mês`}
          loading={loading}
          iconBgClass="bg-purple-100 dark:bg-purple-900/30"
          iconTextClass="text-purple-600 dark:text-purple-400"
        />

        <StatCard
          title="Taxa de Conversão"
          value={`${conversionRate}%`}
          icon={<Target />}
          trend="De leads para clientes"
          loading={loading}
          iconBgClass="bg-orange-100 dark:bg-orange-900/30"
          iconTextClass="text-orange-600 dark:text-orange-400"
        />
      </div>
    </div>
  );
};

export default KPISection;