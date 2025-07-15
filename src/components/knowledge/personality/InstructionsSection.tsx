import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Zap } from "lucide-react";
import type { PersonalitySettings } from "@/hooks/useAIPersonalityForm";

interface InstructionsSectionProps {
  settings: PersonalitySettings;
  onInputChange: (field: keyof PersonalitySettings, value: string) => void;
}

const InstructionsSection = ({
  settings,
  onInputChange,
}: InstructionsSectionProps) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center">
        <Zap className="h-5 w-5 mr-2" /> Instruções Especiais
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div>
        <Label htmlFor="specialInstructions">Diretrizes de Comportamento</Label>
        <Textarea
          id="specialInstructions"
          value={settings.specialInstructions}
          onChange={(e) => onInputChange("specialInstructions", e.target.value)}
          placeholder="Instruções específicas sobre como a IA deve agir..."
          rows={6}
        />
        <p className="text-xs text-gray-500 mt-2">
          Estas instruções são aplicadas a todas as interações da IA
        </p>
      </div>
    </CardContent>
  </Card>
);

export default React.memo(InstructionsSection);
