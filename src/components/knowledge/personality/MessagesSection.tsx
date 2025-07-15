import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MessageSquare } from "lucide-react";
import type { PersonalitySettings } from "@/hooks/useAIPersonalityForm";

interface MessagesSectionProps {
  settings: PersonalitySettings;
  onInputChange: (field: keyof PersonalitySettings, value: string) => void;
}

const MessagesSection = ({ settings, onInputChange }: MessagesSectionProps) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center">
        <MessageSquare className="h-5 w-5 mr-2" /> Mensagens Padrão
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div>
        <Label htmlFor="greeting">Saudação Inicial</Label>
        <Textarea
          id="greeting"
          value={settings.greeting}
          onChange={(e) => onInputChange("greeting", e.target.value)}
          placeholder="Mensagem de boas-vindas..."
          rows={2}
        />
      </div>
      <div>
        <Label htmlFor="farewell">Despedida</Label>
        <Textarea
          id="farewell"
          value={settings.farewell}
          onChange={(e) => onInputChange("farewell", e.target.value)}
          placeholder="Mensagem de despedida..."
          rows={2}
        />
      </div>
    </CardContent>
  </Card>
);

export default React.memo(MessagesSection);
