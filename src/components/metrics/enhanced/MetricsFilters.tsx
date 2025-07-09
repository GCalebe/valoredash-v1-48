import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Filter, RefreshCw, X } from "lucide-react";

interface MetricsFiltersProps {
  datePeriod: string;
  dataSource: string;
  customStartDate?: string;
  customEndDate?: string;
  onDatePeriodChange: (period: string) => void;
  onDataSourceChange: (source: string) => void;
  onCustomDateChange: (startDate: string, endDate: string) => void;
  onReset: () => void;
}

const MetricsFilters: React.FC<MetricsFiltersProps> = ({
  datePeriod,
  dataSource,
  customStartDate,
  customEndDate,
  onDatePeriodChange,
  onDataSourceChange,
  onCustomDateChange,
  onReset,
}) => {
  const periodOptions = [
    { label: "Hoje", value: "today" },
    { label: "Últimos 7 dias", value: "last7days" },
    { label: "Últimos 30 dias", value: "last30days" },
    { label: "Este mês", value: "thisMonth" },
    { label: "Personalizado", value: "custom" },
  ];

  const sourceOptions = [
    { label: "Todas as fontes", value: "all" },
    { label: "Facebook", value: "facebook" },
    { label: "Google", value: "google" },
    { label: "Instagram", value: "instagram" },
    { label: "WhatsApp", value: "whatsapp" },
    { label: "Site", value: "site" },
    { label: "Outros", value: "others" },
  ];

  const handleCustomDateChange = (field: 'start' | 'end', value: string) => {
    const start = field === 'start' ? value : customStartDate || '';
    const end = field === 'end' ? value : customEndDate || '';
    
    if (start && end) {
      onCustomDateChange(start, end);
    }
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (datePeriod !== 'last7days') count++;
    if (dataSource !== 'all') count++;
    return count;
  };

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-5 w-5 text-primary" />
            Filtros de Métricas
            {getActiveFiltersCount() > 0 && (
              <Badge variant="secondary" className="ml-2">
                {getActiveFiltersCount()} aplicado{getActiveFiltersCount() > 1 ? 's' : ''}
              </Badge>
            )}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Limpar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Período de Data */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Período de Análise
            </Label>
            <Select value={datePeriod} onValueChange={onDatePeriodChange}>
              <SelectTrigger>
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

          {/* Fonte de Dados */}
          <div className="space-y-2">
            <Label>Fonte de Dados</Label>
            <Select value={dataSource} onValueChange={onDataSourceChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma fonte" />
              </SelectTrigger>
              <SelectContent>
                {sourceOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Datas Personalizadas */}
        {datePeriod === "custom" && (
          <div className="space-y-2">
            <Label>Período Personalizado</Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate" className="text-sm text-muted-foreground">
                  Data Início
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={customStartDate || ''}
                  onChange={(e) => handleCustomDateChange('start', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="endDate" className="text-sm text-muted-foreground">
                  Data Fim
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={customEndDate || ''}
                  onChange={(e) => handleCustomDateChange('end', e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Filtros Ativos */}
        {getActiveFiltersCount() > 0 && (
          <div className="flex flex-wrap gap-2 pt-2 border-t">
            {datePeriod !== 'last7days' && (
              <Badge variant="outline" className="flex items-center gap-1">
                Período: {periodOptions.find(p => p.value === datePeriod)?.label}
                <X 
                  className="h-3 w-3 cursor-pointer hover:text-destructive" 
                  onClick={() => onDatePeriodChange('last7days')}
                />
              </Badge>
            )}
            {dataSource !== 'all' && (
              <Badge variant="outline" className="flex items-center gap-1">
                Fonte: {sourceOptions.find(s => s.value === dataSource)?.label}
                <X 
                  className="h-3 w-3 cursor-pointer hover:text-destructive" 
                  onClick={() => onDataSourceChange('all')}
                />
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MetricsFilters;