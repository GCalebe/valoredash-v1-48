import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { User } from "lucide-react";
import type { PersonalitySettings } from "@/hooks/useAIPersonalityForm";

interface BasicInfoSectionProps {
  settings: PersonalitySettings;
  onInputChange: (field: keyof PersonalitySettings, value: string) => void;
}

const BasicInfoSection = ({
  settings,
  onInputChange,
}: BasicInfoSectionProps) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center">
        <User className="h-5 w-5 mr-2" /> Informações Básicas
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div>
        <Label htmlFor="name">Nome da IA</Label>
        <Input
          id="name"
          value={settings.name}
          onChange={(e) => onInputChange("name", e.target.value)}
          placeholder="Ex: Assistente Virtual"
        />
      </div>
      <div>
        <Label htmlFor="description">Descrição</Label>
        <Input
          id="description"
          value={settings.description}
          onChange={(e) => onInputChange("description", e.target.value)}
          placeholder="Breve descrição do papel da IA"
        />
      </div>
      <div>
        <Label htmlFor="tone">Tom de Voz</Label>
        <Input
          id="tone"
          value={settings.tone}
          onChange={(e) => onInputChange("tone", e.target.value)}
          placeholder="Ex: amigável e profissional"
        />
      </div>
      <div>
        <Label htmlFor="personality">Descrição da Personalidade</Label>
        <Textarea
          id="personality"
          value={settings.personality}
          onChange={(e) => onInputChange("personality", e.target.value)}
          placeholder="Descreva como a IA deve se apresentar..."
          rows={4}
        />
      </div>
    </CardContent>
  </Card>
);

export default React.memo(BasicInfoSection);
