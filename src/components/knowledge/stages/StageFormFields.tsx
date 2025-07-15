import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { StageFormValues } from "@/hooks/useAIStageManager";

interface StageFormFieldsProps {
  values: StageFormValues;
  onChange: (values: StageFormValues) => void;
  idPrefix?: string;
}

const StageFormFields: React.FC<StageFormFieldsProps> = ({ values, onChange, idPrefix = "" }) => {
  const handleChange = (field: keyof StageFormValues, value: string) => {
    onChange({ ...values, [field]: value });
  };

  return (
    <div className="space-y-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor={`${idPrefix}name`}>Nome da Etapa *</Label>
          <Input
            id={`${idPrefix}name`}
            value={values.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="Ex: Saudação Inicial"
          />
        </div>
        <div>
          <Label htmlFor={`${idPrefix}trigger`}>Gatilho</Label>
          <Input
            id={`${idPrefix}trigger`}
            value={values.trigger}
            onChange={(e) => handleChange("trigger", e.target.value)}
            placeholder="Ex: Início da conversa"
          />
        </div>
      </div>

      <div>
        <Label htmlFor={`${idPrefix}description`}>Descrição *</Label>
        <Textarea
          id={`${idPrefix}description`}
          value={values.description}
          onChange={(e) => handleChange("description", e.target.value)}
          placeholder="Descreva o objetivo desta etapa..."
          rows={2}
        />
      </div>

      <div>
        <Label htmlFor={`${idPrefix}actions`}>Ações (uma por linha)</Label>
        <Textarea
          id={`${idPrefix}actions`}
          value={values.actions}
          onChange={(e) => handleChange("actions", e.target.value)}
          placeholder={"Cumprimentar o usuário\nPerguntar como pode ajudar"}
          rows={4}
        />
      </div>

      <div>
        <Label htmlFor={`${idPrefix}nextStage`}>Próxima Etapa</Label>
        <Input
          id={`${idPrefix}nextStage`}
          value={values.nextStage}
          onChange={(e) => handleChange("nextStage", e.target.value)}
          placeholder="Ex: Identificação da Necessidade"
        />
      </div>
    </div>
  );
};

export default StageFormFields;
