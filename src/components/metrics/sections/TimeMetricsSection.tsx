import React from 'react';
import AverageResponseStartCard from '../AverageResponseStartCard';
import AverageClosingTimeCard from '../AverageClosingTimeCard';
import SectionHeader from './SectionHeader';

interface TimeMetricsSectionProps {
  avgResponseStartTime: number;
  avgClosingTime: number;
  loading: boolean;
}

const TimeMetricsSection: React.FC<TimeMetricsSectionProps> = ({
  avgResponseStartTime,
  avgClosingTime,
  loading,
}) => {
  return (
    <div className="space-y-4">
      <SectionHeader 
        title="⏱️ Métricas de Tempo" 
        borderColor="border-cyan-200 dark:border-cyan-700" 
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AverageResponseStartCard
          avgStartTime={avgResponseStartTime}
          loading={loading}
          trend="Melhoria de 15% vs período anterior"
        />

        <AverageClosingTimeCard
          avgClosingTime={avgClosingTime}
          loading={loading}
          trend="Redução de 20% vs período anterior"
        />
      </div>
    </div>
  );
};

export default TimeMetricsSection;