import React from 'react';
import ConversationChart from '../ConversationChart';
import ConversionFunnelChart from '../ConversionFunnelChart';
import ConversionByTimeChart from '../ConversionByTimeChart';
import LeadsAverageByTimeChart from '../LeadsAverageByTimeChart';
import SectionHeader from './SectionHeader';

interface PerformanceChartsSectionProps {
  conversationData: any[];
  conversionFunnelData: any[];
  conversionByTimeData: any[];
  leadsAverageByTimeData: any[];
  noShowRate: number;
  loading: boolean;
  transformedDataLoading: boolean;
}

const PerformanceChartsSection: React.FC<PerformanceChartsSectionProps> = ({
  conversationData,
  conversionFunnelData,
  conversionByTimeData,
  leadsAverageByTimeData,
  noShowRate,
  loading,
  transformedDataLoading,
}) => {
  const handleFilterChange = (date: any, stages: any, showNoShow: any) => {
    console.log("Filtro aplicado no Funil de Conversão:", {
      date,
      stages,
      showNoShow,
    });
  };

  return (
    <div className="space-y-4">
      <SectionHeader 
        title="📈 Análise de Performance" 
        borderColor="border-yellow-200 dark:border-yellow-700" 
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ConversationChart
          data={conversationData}
          loading={loading}
        />
        <ConversionFunnelChart
          data={conversionFunnelData}
          loading={transformedDataLoading}
          noShowRate={noShowRate}
          onFilterChange={handleFilterChange}
        />
      </div>

      <ConversionByTimeChart
        data={conversionByTimeData}
        loading={loading}
      />

      <LeadsAverageByTimeChart
        data={leadsAverageByTimeData}
        loading={loading}
      />
    </div>
  );
};

export default PerformanceChartsSection;