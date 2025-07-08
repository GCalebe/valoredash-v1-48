import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";

interface ConsultationStageSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const consultationStages = [
  "Nova consulta",
  "Qualificado",
  "Chamada agendada",
  "Preparando proposta",
  "Proposta enviada",
  "Acompanhamento",
  "Negociação",
  "Fatura enviada",
  "Fatura paga – ganho",
  "Projeto cancelado – perdido",
];

const getProgressValue = (stage: string) => {
  const index = consultationStages.indexOf(stage);
  if (index === -1) return 0;
  return ((index + 1) / consultationStages.length) * 100;
};

const getProgressColor = (stage: string) => {
  const winStages = ["Fatura paga – ganho"];
  const lossStages = ["Projeto cancelado – perdido"];

  if (winStages.includes(stage)) return "bg-green-500 dark:bg-green-400";
  if (lossStages.includes(stage)) return "bg-red-500 dark:bg-red-400";
  return "bg-blue-500 dark:bg-blue-400";
};

const ConsultationStageSelector = ({
  value,
  onChange,
}: ConsultationStageSelectorProps) => {
  const progressValue = getProgressValue(value);
  const progressColor = getProgressColor(value);

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
