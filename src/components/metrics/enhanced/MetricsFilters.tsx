import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, Filter, RefreshCw, X } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface MetricsFiltersProps {
  datePeriod: string;
  customStartDate?: string;
  customEndDate?: string;
  onDatePeriodChange: (period: string) => void;
  onCustomDateChange: (startDate: string, endDate: string) => void;
  onReset: () => void;
}

const MetricsFilters: React.FC<MetricsFiltersProps> = ({
  datePeriod,
  customStartDate,
  customEndDate,
  onDatePeriodChange,
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
        {/* Período de Data */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            Período de Análise
          </Label>
          <Select value={datePeriod} onValueChange={onDatePeriodChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione um período" />
            </SelectTrigger>
            <SelectContent className="z-50 bg-background border">
              {periodOptions.map((option) => (
                <SelectItem 
                  key={option.value} 
                  value={option.value}
                  className="cursor-pointer hover:bg-accent focus:bg-accent"
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Datas Personalizadas */}
        {datePeriod === "custom" && (
          <div className="space-y-4">
            <Label>Período Personalizado</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Data Início</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !customStartDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {customStartDate ? (
                        format(new Date(customStartDate), "PPP", { locale: ptBR })
                      ) : (
                        <span>Selecione a data inicial</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 z-50 bg-background border" align="start">
                    <Calendar
                      selected={customStartDate ? new Date(customStartDate) : null}
                      onSelect={(date) => {
                        if (date) {
                          const startDate = format(date, 'yyyy-MM-dd');
                          const endDate = customEndDate || format(date, 'yyyy-MM-dd');
                          handleCustomDateChange('start', startDate);
                          if (!customEndDate) {
                            handleCustomDateChange('end', endDate);
                          }
                        }
                      }}
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Data Fim</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !customEndDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {customEndDate ? (
                        format(new Date(customEndDate), "PPP", { locale: ptBR })
                      ) : (
                        <span>Selecione a data final</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 z-50 bg-background border" align="start">
                    <Calendar
                      selected={customEndDate ? new Date(customEndDate) : null}
                      onSelect={(date) => {
                        if (date) {
                          const endDate = format(date, 'yyyy-MM-dd');
                          handleCustomDateChange('end', endDate);
                        }
                      }}
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
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
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MetricsFilters;