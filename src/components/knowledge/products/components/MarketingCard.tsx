import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, Target } from "lucide-react";
import { ProductObjection } from "@/types/product";
import ArrayInputField from "../components/ArrayInputField";
import ObjectionsManager from "../ObjectionsManager";

interface MarketingCardProps {
  mode: "create" | "edit";
  initialProductId?: string;
  initialObjections?: string[] | undefined;
  objections: ProductObjection[];
  setObjections: (items: ProductObjection[]) => void;
  benefits: string[];
  differentials: string[];
  successCases: string[];
  onAdd: (field: "benefits" | "differentials" | "success_cases", value: string) => void;
  onRemove: (field: "benefits" | "differentials" | "success_cases", index: number) => void;
}

const MarketingCard: React.FC<MarketingCardProps> = ({ mode, initialProductId, initialObjections, objections, setObjections, benefits, differentials, successCases, onAdd, onRemove }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Marketing e Vendas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <ArrayInputField label="Benefícios" placeholder="Adicione um benefício..." icon={Award} items={benefits} onAdd={(val) => onAdd("benefits", val)} onRemove={(idx) => onRemove("benefits", idx)} />
        <ArrayInputField label="Diferenciais" placeholder="Adicione um diferencial..." icon={Award} items={differentials} onAdd={(val) => onAdd("differentials", val)} onRemove={(idx) => onRemove("differentials", idx)} />

        <ObjectionsManager
          productId={mode === 'edit' ? initialProductId || '' : ''}
          onObjectionsChange={setObjections}
          initialObjections={mode === 'create' ? initialObjections?.map((question, index) => ({ id: `initial-${index}`, question, answer: 'Resposta não definida', createdAt: new Date().toLocaleDateString(), createdBy: 'Sistema' })) || [] : []}
        />

        <ArrayInputField label="Casos de Sucesso" placeholder="Adicione um caso de sucesso..." icon={Award} items={successCases} onAdd={(val) => onAdd("success_cases", val)} onRemove={(idx) => onRemove("success_cases", idx)} />
      </CardContent>
    </Card>
  );
};

export default MarketingCard;


