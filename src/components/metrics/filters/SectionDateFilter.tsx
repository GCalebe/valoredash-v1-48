import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Calendar as CalendarIcon, Filter } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface SectionDateFilterProps {
  sectionId: string;
  datePeriod: string;
  customStartDate?: string;
  customEndDate?: string;
  isInheritingGlobal: boolean;
  onDatePeriodChange: (period: string) => void;
  onCustomDateChange: (startDate: string, endDate: string) => void;
  onToggleInheritGlobal: () => void;
  onReset: () => void;
  compact?: boolean;
}

const SectionDateFilter: React.FC<SectionDateFilterProps> = ({
  sectionId,
  datePeriod,
  customStartDate,
  customEndDate,
  isInheritingGlobal,
  onDatePeriodChange,
  onCustomDateChange,
  onToggleInheritGlobal,
  onReset,
  compact = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const periodOptions = [
    { label: "Hoje", value: "today" },
    { label: "Últimos 7 dias", value: "last7days" },
    { label: "Últimos 30 dias", value: "last30days" },
    { label: "Este mês", value: "thisMonth" },
    { label: "Personalizado", value: "custom" },
  ];

  const handleRangeSelect = (range: { from?: Date; to?: Date } | undefined) => {
    if (!(range?.from && range?.to)) return;
    const startStr = format(range.from, 'yyyy-MM-dd');
    const endStr = format(range.to, 'yyyy-MM-dd');
    onCustomDateChange(startStr, endStr);
  };

  const getCurrentPeriodLabel = () => {
    if (isInheritingGlobal) return "Filtro Global";
    const option = periodOptions.find(p => p.value === datePeriod);
    return option?.label || "Últimos 7 dias";
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className={cn(
            "gap-2 text-xs",
            !isInheritingGlobal && "border-primary/50 bg-primary/5"
          )}
        >
          <CalendarIcon className="h-3 w-3" />
          {compact ? getCurrentPeriodLabel().substring(0, 8) + "..." : getCurrentPeriodLabel()}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">Filtro de Data</h4>
            <div className="flex items-center space-x-2">
              <Switch
                id={`inherit-${sectionId}`}
                checked={isInheritingGlobal}
                onCheckedChange={onToggleInheritGlobal}
              />
              <Label htmlFor={`inherit-${sectionId}`} className="text-xs">
                Usar Global
              </Label>
            </div>
          </div>

          {!isInheritingGlobal && (
            <>
              {/* Period Selection */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Período</Label>
                <Select value={datePeriod} onValueChange={onDatePeriodChange}>
                  <SelectTrigger className="w-full h-8">
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

              {/* Custom Date Range */}
              {datePeriod === "custom" && (
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Datas Personalizadas</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className={cn(
                          "w-full justify-start text-left font-normal h-8",
                          !(customStartDate && customEndDate) && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-3 w-3" />
                        {customStartDate && customEndDate ? (
                          `${format(new Date(customStartDate), "dd/MM/yy", { locale: ptBR })} - ${format(new Date(customEndDate), "dd/MM/yy", { locale: ptBR })}`
                        ) : (
                          <span className="text-xs">Selecione o intervalo</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="range"
                        selected={{ 
                          from: customStartDate ? new Date(customStartDate) : undefined, 
                          to: customEndDate ? new Date(customEndDate) : undefined 
                        }}
                        onSelect={handleRangeSelect}
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={onReset}
                  className="flex-1 h-8"
                >
                  Reset
                </Button>
                <Button 
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 h-8"
                >
                  Aplicar
                </Button>
              </div>
            </>
          )}

          {isInheritingGlobal && (
            <div className="text-xs text-muted-foreground text-center py-4">
              Esta seção está usando o filtro global.<br />
              Desative "Usar Global" para personalizar.
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default SectionDateFilter;