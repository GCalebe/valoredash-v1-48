import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useKanbanStagesSupabase } from "@/hooks/useKanbanStagesSupabase";

interface ConsultationStageSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const getProgressValue = (stage: string, stages: string[]) => {
  const index = stages.indexOf(stage);
  if (index === -1) return 0;
  return ((index + 1) / stages.length) * 100;
};

const getProgressColor = (stage: string) => {
  // Identifica estágios de ganho e perda baseado em palavras-chave
  const lowerStage = stage.toLowerCase();
  
  if (lowerStage.includes('ganho') || lowerStage.includes('converteram') || lowerStage.includes('pago') || lowerStage.includes('fechado')) {
    return "bg-green-500 dark:bg-green-400";
  }
  if (lowerStage.includes('perdido') || lowerStage.includes('cancelado') || lowerStage.includes('rejeitado')) {
    return "bg-red-500 dark:bg-red-400";
  }
  return "bg-blue-500 dark:bg-blue-400";
};

const ConsultationStageSelector = ({
  value,
  onChange,
}: ConsultationStageSelectorProps) => {
  const { stages, loading } = useKanbanStagesSupabase();
  
  // Converte as etapas do kanban para array de strings
  const consultationStages = stages.map(stage => stage.title);
  
  const progressValue = getProgressValue(value, consultationStages);
  const progressColor = getProgressColor(value);
  
  if (loading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Funil
          </h3>
        </div>
        <div className="h-10 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
        <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Funil
        </h3>
      </div>

      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
          <SelectValue placeholder="Selecione o estágio" />
        </SelectTrigger>
        <SelectContent className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
          {consultationStages.map((stage) => (
            <SelectItem
              key={stage}
              value={stage}
              className="text-gray-900 dark:text-white"
            >
              {stage}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="space-y-2">
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>Progresso</span>
          <span>{Math.round(progressValue)}%</span>
        </div>
        <div className="relative">
          <Progress value={progressValue} className="h-2" />
          <div
            className={`absolute top-0 left-0 h-2 rounded-full transition-all ${progressColor}`}
            style={{ width: `${progressValue}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default ConsultationStageSelector;
