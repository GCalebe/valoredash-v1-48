import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, AlertCircle } from "lucide-react";
import { FunnelChartSettings } from "./FunnelChartSettings";
import { useKanbanStages } from "@/hooks/useKanbanStages";

interface FunnelData {
  name: string;
  value: number;
  percentage: number;
  color?: string;
}

interface ConversionFunnelChartProps {
  data: FunnelData[];
  loading?: boolean;
  onFilterChange?: (
    date: Date,
    stages: string[],
    showNoShowRate: boolean,
  ) => void;
  noShowRate?: number;
}

const ConversionFunnelChart: React.FC<ConversionFunnelChartProps> = ({
  data,
  loading = false,
  onFilterChange,
  noShowRate,
}) => {
  const [customDate, setCustomDate] = useState<Date>(new Date());
  const [selectedStages, setSelectedStages] = useState<string[]>([]);
  const [showNoShowRate, setShowNoShowRate] = useState<boolean>(false);
  const [filteredData, setFilteredData] = useState<FunnelData[]>(data);
  const { stages } = useKanbanStages();

  // Cores predefinidas para os estágios do funil
  const stageColors = [
    "#4f46e5", // indigo-600
    "#0891b2", // cyan-600
    "#059669", // emerald-600
    "#65a30d", // lime-600
    "#ca8a04", // yellow-600
    "#ea580c", // orange-600
    "#dc2626", // red-600
    "#9333ea", // purple-600
    "#2563eb", // blue-600
    "#0d9488", // teal-600
  ];

  // Inicializa os estágios selecionados com todos os estágios disponíveis
  useEffect(() => {
    if (stages.length > 0 && selectedStages.length === 0) {
      setSelectedStages(stages.map((stage) => stage.title));
    }
  }, [stages]);

  // Filtra os dados com base nos estágios selecionados e aplica cores
  useEffect(() => {
    if (data.length > 0) {
      let filtered = data;

      // Filtra por estágios selecionados
      if (selectedStages.length > 0) {
        filtered = data.filter((item) => selectedStages.includes(item.name));
      }

      // Aplica cores aos estágios
      filtered = filtered.map((item, index) => ({
        ...item,
        color: item.color || stageColors[index % stageColors.length],
      }));

      setFilteredData(filtered);

      // Notifica sobre mudanças nos filtros
      if (onFilterChange) {
        onFilterChange(customDate, selectedStages, showNoShowRate);
      }
    } else {
      setFilteredData([]);
    }
  }, [data, selectedStages, customDate, showNoShowRate, onFilterChange]);

  return (
    <Card className="dark:bg-gray-800 transition-all duration-300 hover:shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-white">
          <PieChart className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          Funil de Conversão de Leads
        </CardTitle>
        <FunnelChartSettings
          selectedStages={selectedStages}
          onStagesChange={setSelectedStages}
          customDate={customDate}
          setCustomDate={setCustomDate}
          showNoShowRate={showNoShowRate}
          onShowNoShowRateChange={setShowNoShowRate}
        />
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-80 flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-green-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="h-80 flex flex-col justify-center space-y-4">
              {filteredData.length > 0 ? (
                filteredData.map((stage, index) => (
                  <div key={index} className="flex flex-col">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {stage.name}
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-gray-800 dark:text-white">
                          {stage.value}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {stage.percentage}%
                        </span>
                      </div>
                    </div>
                    <div className="relative h-8 w-full overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-700">
                      <div
                        className="h-full rounded-lg transition-all duration-500 ease-in-out"
                        style={{
                          width: `${stage.percentage}%`,
                          backgroundColor: stage.color,
                        }}
                      ></div>
                    </div>
                    {index < filteredData.length - 1 && (
                      <div className="flex justify-center my-1">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-gray-400 dark:text-gray-600"
                        >
                          <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                  <AlertCircle className="h-8 w-8 mb-2" />
                  <p>Nenhum estágio selecionado</p>
                </div>
              )}
            </div>

            {/* Legenda de cores */}
            <div className="flex flex-wrap gap-3 pt-2">
              {filteredData.map((stage, index) => (
                <div
                  key={`legend-${index}`}
                  className="flex items-center gap-1"
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: stage.color }}
                  ></div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {stage.name}
                  </span>
                </div>
              ))}
            </div>

            {/* Taxa de No-Show */}
            {showNoShowRate && noShowRate !== undefined && (
              <div className="flex items-center justify-between pt-2 mt-2 border-t border-gray-200 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Taxa de No-Show:
                </span>
                <span className="text-sm font-bold text-red-600 dark:text-red-400">
                  {noShowRate}%
                </span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ConversionFunnelChart;
