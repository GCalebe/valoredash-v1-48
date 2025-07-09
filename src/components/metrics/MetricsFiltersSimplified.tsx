import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface MetricsFiltersSimplifiedProps {
  onPeriodChange?: (period: string) => void;
  onApplyFilters?: () => void;
}

const MetricsFiltersSimplified: React.FC<MetricsFiltersSimplifiedProps> = ({
  onPeriodChange,
  onApplyFilters,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState("today");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const periodOptions = [
    { label: "Hoje", value: "today" },
    { label: "Últimos 7 dias", value: "last7days" },
    { label: "Últimos 30 dias", value: "last30days" },
    { label: "Este mês", value: "thisMonth" },
    { label: "Personalizado", value: "custom" },
  ];

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
    onPeriodChange?.(period);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Período de Análise</Label>
        <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecione um período" />
          </SelectTrigger>
          <SelectContent>
            {periodOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedPeriod === "custom" && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="startDate">Data Início</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="endDate">Data Fim</Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
      )}

      {onApplyFilters && (
        <Button onClick={onApplyFilters} className="w-full">
          Aplicar Filtros
        </Button>
      )}
    </div>
  );
};

export default MetricsFiltersSimplified;