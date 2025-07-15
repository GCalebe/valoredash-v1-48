import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PersonalitySettings } from "@/hooks/useAIPersonalityForm";

interface PreviewSectionProps {
  settings: PersonalitySettings;
}

const PreviewSection = ({ settings }: PreviewSectionProps) => (
  <Card>
    <CardHeader>
      <CardTitle>Preview da Personalidade</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <div className="space-y-2 text-sm">
          <div>
            <strong>Nome:</strong> {settings.name}
          </div>
          <div>
            <strong>Tom:</strong> {settings.tone}
          </div>
          <div>
            <strong>Saudação:</strong> "{settings.greeting}"
          </div>
          <div>
            <strong>Personalidade:</strong> {settings.personality}
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default React.memo(PreviewSection);
