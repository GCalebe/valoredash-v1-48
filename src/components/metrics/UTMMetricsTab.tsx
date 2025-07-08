import React, { useState } from "react";
import { Share2, Users, Target, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import StatCard from "./StatCard";
import UTMAdvancedMetrics from "./UTMAdvancedMetrics";
import UTMCampaignChart from "./UTMCampaignChart";
import UTMSourceChart from "./UTMSourceChart";
import UTMTrackingTable from "./UTMTrackingTable";
import UTMConfigPanel from "./UTMConfigPanel";
import UTMDeviceDistributionChart from "./UTMDeviceDistributionChart";
import UTMCampaignFilter from "./UTMCampaignFilter";
import UTMDeviceFilter from "./UTMDeviceFilter";
import UTMGeoHeatmap from "./UTMGeoHeatmap";
import UTMCampaignRanking from "./UTMCampaignRanking";
import UTMTimeMetrics from "./UTMTimeMetrics";

interface UTMMetricsTabProps {
  utmMetrics: {
    totalCampaigns: number;
    totalLeads: number;
    conversionRate: number;
    campaignData: any[];
    sourceData: any[];
    deviceData: any[];
    geoData: any[];
    timeToConversion: {
      average: number;
      median: number;
      min: number;
      max: number;
    };
    topCampaigns: any[];
    recentTracking: any[];
    isStale?: boolean;
  };
  utmLoading: boolean;
  selectedCampaign: string;
  onCampaignChange: (campaign: string) => void;
}

const UTMMetricsTab: React.FC<UTMMetricsTabProps> = ({
  utmMetrics,
  utmLoading,
  selectedCampaign,
  onCampaignChange,
}) => {
  const [isConfigPanelOpen, setIsConfigPanelOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState("all");

  return (
    <div className="space-y-8">
      {/* UTM Header with Filters and Config Button */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
          Dashboard UTM Profissional
        </h3>
        <div className="flex items-center gap-4">
          <UTMCampaignFilter
            selectedCampaign={selectedCampaign}
            onCampaignChange={onCampaignChange}
          />
          <UTMDeviceFilter
            selectedDevice={selectedDevice}
            onDeviceChange={setSelectedDevice}
          />
          <Button
            onClick={() => setIsConfigPanelOpen(true)}
            className="flex items-center gap-2"
            variant="outline"
          >
            <Settings className="h-4 w-4" />
            Configurar UTMs
          </Button>
        </div>
      </div>

      {/* Bloco 1: Visão Geral */}
      <div className="space-y-6">
        <h4 className="text-lg font-medium text-gray-700 dark:text-gray-300 border-b pb-2">
          📊 Visão Geral
        </h4>

        {/* UTM KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
            title="Campanhas Ativas"
            value={utmMetrics.totalCampaigns}
            icon={<Share2 />}
            trend="Campanhas UTM únicas"
            loading={utmLoading}
            iconBgClass="bg-cyan-100 dark:bg-cyan-900/30"
            iconTextClass="text-cyan-600 dark:text-cyan-400"
            isStale={utmMetrics.isStale}
          />

          <StatCard
            title="Leads via UTM"
            value={utmMetrics.totalLeads}
            icon={<Users />}
            trend="Total de leads rastreados"
            loading={utmLoading}
            iconBgClass="bg-emerald-100 dark:bg-emerald-900/30"
            iconTextClass="text-emerald-600 dark:text-emerald-400"
            isStale={utmMetrics.isStale}
          />

          <StatCard
            title="Taxa de Conversão UTM"
            value={`${utmMetrics.conversionRate}%`}
            icon={<Target />}
            trend="Conversão de campanhas UTM"
            loading={utmLoading}
            iconBgClass="bg-amber-100 dark:bg-amber-900/30"
            iconTextClass="text-amber-600 dark:text-amber-400"
            isStale={utmMetrics.isStale}
          />
        </div>

        {/* Métricas de Tempo */}
        <UTMTimeMetrics
          timeToConversion={utmMetrics.timeToConversion}
          loading={utmLoading}
        />

        {/* Métricas Avançadas */}
        <div className="space-y-4">
          <h5 className="text-lg font-medium text-gray-700 dark:text-gray-300">
            📈 Métricas Avançadas
          </h5>
          <UTMAdvancedMetrics
            data={{
              ctr: 3.2,
              cpc: 1.45,
              roas: 380,
              conversionValuePerLead: 250,
              sessionDuration: 145,
              bounceRate: 42,
              topPerformingCampaign: "black_friday_2024",
              worstPerformingCampaign: "summer_sale",
            }}
            loading={utmLoading}
          />
        </div>
      </div>

      {/* Bloco 2: Gráficos */}
      <div className="space-y-6">
        <h4 className="text-lg font-medium text-gray-700 dark:text-gray-300 border-b pb-2">
          📈 Gráficos e Análises
        </h4>

        <UTMCampaignChart data={utmMetrics.campaignData} loading={utmLoading} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-6">
          <UTMSourceChart data={utmMetrics.sourceData} loading={utmLoading} />
          <UTMDeviceDistributionChart
            data={utmMetrics.deviceData}
            loading={utmLoading}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <UTMGeoHeatmap data={utmMetrics.geoData} loading={utmLoading} />
          <UTMCampaignRanking
            data={utmMetrics.topCampaigns}
            loading={utmLoading}
          />
        </div>
      </div>

      {/* Bloco 3: Tabela Detalhada */}
      <div className="space-y-6">
        <h4 className="text-lg font-medium text-gray-700 dark:text-gray-300 border-b pb-2">
          📋 Tabela Detalhada
        </h4>

        <div className="grid grid-cols-1 gap-6">
          <UTMTrackingTable
            data={utmMetrics.recentTracking}
            loading={utmLoading}
          />
        </div>
      </div>

      {/* UTM Config Panel */}
      <UTMConfigPanel
        open={isConfigPanelOpen}
        onOpenChange={setIsConfigPanelOpen}
      />
    </div>
  );
};

export default UTMMetricsTab;
