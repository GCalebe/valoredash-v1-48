
import React, { useState } from "react";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useKanbanStages } from "@/hooks/useKanbanStages";
import MetricsFilters from "./MetricsFilters";

interface FunnelChartSettingsProps {
  selectedStages: string[];
  onStagesChange: (stages: string[]) => void;
  customDate: Date | null;
  setCustomDate: (date: Date) => void;
  showNoShowRate?: boolean;
  onShowNoShowRateChange?: (show: boolean) => void;
}

export function FunnelChartSettings({
  selectedStages,
  onStagesChange,
  customDate,
  setCustomDate,
  showNoShowRate = false,
  onShowNoShowRateChange,
}: FunnelChartSettingsProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { stages, loading } = useKanbanStages();
  const [localSelectedStages, setLocalSelectedStages] =
    useState<string[]>(selectedStages);
  const [localShowNoShowRate, setLocalShowNoShowRate] =
    useState<boolean>(showNoShowRate);

  const handleSave = () => {
    onStagesChange(localSelectedStages);
    if (onShowNoShowRateChange) {
      onShowNoShowRateChange(localShowNoShowRate);
    }
    setIsDialogOpen(false);
  };

  const handleStageToggle = (stageTitle: string) => {
    setLocalSelectedStages((prev) => {
      if (prev.includes(stageTitle)) {
        return prev.filter((s) => s !== stageTitle);
      } else {
        return [...prev, stageTitle];
      }
    });
  };

  const handleSelectAll = () => {
    setLocalSelectedStages(stages.map((stage) => stage.title));
  };

  const handleSelectNone = () => {
    setLocalSelectedStages([]);
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => {
          setLocalSelectedStages(selectedStages);
          setLocalShowNoShowRate(showNoShowRate);
          setIsDialogOpen(true);
        }}
        className="text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
      >
        <Settings className="h-4 w-4" />
        <span className="sr-only">Configurações do Gráfico</span>
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Configurações do Funil de Conversão</DialogTitle>
            <DialogDescription>
              Personalize o período de análise e os estágios exibidos no
              gráfico.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-6">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Período de Análise</h4>
              <MetricsFilters
                selectedDate={customDate}
                onDateChange={setCustomDate}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Estágios do Kanban</h4>
                <div className="space-x-2">
                  <Button variant="outline" size="sm" onClick={handleSelectAll}>
                    Selecionar Todos
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectNone}
                  >
                    Limpar
                  </Button>
                </div>
              </div>

              <div className="max-h-60 overflow-y-auto space-y-2 border rounded-md p-2">
                {loading ? (
                  <div className="flex justify-center p-4">
                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                  stages.map((stage) => (
                    <div key={stage.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`stage-${stage.id}`}
                        checked={localSelectedStages.includes(stage.title)}
                        onCheckedChange={() => handleStageToggle(stage.title)}
                      />
                      <Label htmlFor={`stage-${stage.id}`} className="text-sm">
                        {stage.title}
                      </Label>
                    </div>
                  ))
                )}
              </div>
            </div>

            {onShowNoShowRateChange && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="show-no-show-rate"
                  checked={localShowNoShowRate}
                  onCheckedChange={(checked) =>
                    setLocalShowNoShowRate(!!checked)
                  }
                />
                <Label htmlFor="show-no-show-rate" className="text-sm">
                  Exibir Taxa de No-Show
                </Label>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>Aplicar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
