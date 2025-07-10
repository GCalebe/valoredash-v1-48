import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Filter, Calendar as CalendarIcon } from "lucide-react";
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
  const [isOpen, setIsOpen] = useState(false);

  const periodOptions = [
    { label: "Hoje", value: "today" },
    { label: "Últimos 7 dias", value: "last7days" },
    { label: "Últimos 30 dias", value: "last30days" },
    { label: "Este mês", value: "thisMonth" },
    { label: "Personalizado", value: "custom" },
  ];

  const handleCustomDateSelect = (date: Date | undefined, type: 'start' | 'end') => {
    if (!date) return;
    
    const dateStr = format(date, 'yyyy-MM-dd');
    
    if (type === 'start') {
      const endDate = customEndDate || dateStr;
      onCustomDateChange(dateStr, endDate);
    } else {
      const startDate = customStartDate || dateStr;
      onCustomDateChange(startDate, dateStr);
    }
  };

  const getCurrentPeriodLabel = () => {
    const option = periodOptions.find(p => p.value === datePeriod);
    return option?.label || "Últimos 7 dias";
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2"
        >
          <Filter className="h-4 w-4" />
          Filtros
        </Button>
      </SheetTrigger>
      
      <SheetContent side="right" className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            Filtros de Métricas
          </SheetTitle>
        </SheetHeader>
        
        <div className="space-y-6 mt-6">
          {/* Período Atual */}
          <div className="p-3 bg-muted rounded-lg">
            <div className="text-sm text-muted-foreground">Período atual:</div>
            <div className="font-medium">{getCurrentPeriodLabel()}</div>
            {datePeriod === "custom" && customStartDate && customEndDate && (
              <div className="text-sm text-muted-foreground mt-1">
                {format(new Date(customStartDate), "dd/MM/yyyy", { locale: ptBR })} - {format(new Date(customEndDate), "dd/MM/yyyy", { locale: ptBR })}
              </div>
            )}
          </div>

          {/* Seleção de Período */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Período de Análise</Label>
            <Select value={datePeriod} onValueChange={onDatePeriodChange}>
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

          {/* Calendário Personalizado */}
          {datePeriod === "custom" && (
            <div className="space-y-4">
              <Label className="text-base font-medium">Datas Personalizadas</Label>
              
              {/* Data de Início */}
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Data de Início</Label>
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
                        format(new Date(customStartDate), "dd/MM/yyyy", { locale: ptBR })
                      ) : (
                        <span>Selecione a data inicial</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      selected={customStartDate ? new Date(customStartDate) : undefined}
                      onSelect={(date) => handleCustomDateSelect(date, 'start')}
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Data de Fim */}
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Data de Fim</Label>
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
                        format(new Date(customEndDate), "dd/MM/yyyy", { locale: ptBR })
                      ) : (
                        <span>Selecione a data final</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      selected={customEndDate ? new Date(customEndDate) : undefined}
                      onSelect={(date) => handleCustomDateSelect(date, 'end')}
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}

          {/* Botões de Ação */}
          <div className="flex gap-2 pt-4">
            <Button 
              variant="outline" 
              onClick={onReset}
              className="flex-1"
            >
              Limpar Filtros
            </Button>
            <Button 
              onClick={() => setIsOpen(false)}
              className="flex-1"
            >
              Aplicar
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MetricsFilters;