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

  // Novo: seleção por intervalo com um único calendário
  const handleRangeSelect = (range: { from?: Date; to?: Date } | undefined) => {
    if (!(range?.from && range?.to)) return;
    const startStr = format(range.from, 'yyyy-MM-dd');
    const endStr = format(range.to, 'yyyy-MM-dd');
    onCustomDateChange(startStr, endStr);
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

          {/* Calendário Personalizado: seleção de intervalo */}
          {datePeriod === "custom" && (
            <div className="space-y-4">
              <Label className="text-base font-medium">Datas Personalizadas</Label>
              <div className="space-y-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !(customStartDate && customEndDate) && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {customStartDate && customEndDate ? (
                        `${format(new Date(customStartDate), "dd/MM/yyyy", { locale: ptBR })} - ${format(new Date(customEndDate), "dd/MM/yyyy", { locale: ptBR })}`
                      ) : (
                        <span>Selecione o intervalo</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="range"
                      selected={{ from: customStartDate ? new Date(customStartDate) : undefined, to: customEndDate ? new Date(customEndDate) : undefined }}
                      onSelect={handleRangeSelect}
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