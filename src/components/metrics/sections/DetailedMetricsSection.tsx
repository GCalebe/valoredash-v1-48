import React from 'react';
import SecondaryResponseRateCard from '../SecondaryResponseRateCard';
import ResponseTimeCard from '../ResponseTimeCard';
import SectionHeader from './SectionHeader';

interface DetailedMetricsSectionProps {
  secondaryResponseRate: number;
  totalRespondidas: number;
  totalSecondaryResponses: number;
  avgResponseTime: number;
  loading: boolean;
}

const DetailedMetricsSection: React.FC<DetailedMetricsSectionProps> = ({
  secondaryResponseRate,
  totalRespondidas,
  totalSecondaryResponses,
  avgResponseTime,
  loading,
}) => {
  return (
    <div className="space-y-4">
      <SectionHeader 
        title="📈 Métricas Detalhadas" 
        borderColor="border-purple-200 dark:border-purple-700" 
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SecondaryResponseRateCard
          value={secondaryResponseRate}
          totalRespondidas={totalRespondidas}
          totalSecondaryResponses={totalSecondaryResponses}
          loading={loading}
        />

        <ResponseTimeCard
          avgResponseTime={avgResponseTime}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default DetailedMetricsSection;