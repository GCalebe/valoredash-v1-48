import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX, Heart } from "lucide-react";
import type { PersonalitySettings } from "@/hooks/useAIPersonalityForm";

interface TraitsSectionProps {
  settings: PersonalitySettings;
  onSliderChange: (field: keyof PersonalitySettings, values: number[]) => void;
  onInputChange: (field: keyof PersonalitySettings, value: boolean) => void;
  getSliderLabel: (value: number) => string;
}

const TraitsSection = ({
  settings,
  onSliderChange,
  onInputChange,
  getSliderLabel,
}: TraitsSectionProps) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center">
        <Heart className="h-5 w-5 mr-2" /> Traços de Personalidade
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-6">
      <div>
        <div className="flex justify-between items-center mb-2">
          <Label>Formalidade</Label>
          <span className="text-sm text-gray-500">
            {getSliderLabel(settings.formality)}
          </span>
        </div>
        <Slider
          value={[settings.formality]}
          onValueChange={(value) => onSliderChange("formality", value)}
          min={1}
          max={5}
          step={1}
          className="w-full"
        />
      </div>
      <div>
        <div className="flex justify-between items-center mb-2">
          <Label>Empatia</Label>
          <span className="text-sm text-gray-500">
            {getSliderLabel(settings.empathy)}
          </span>
        </div>
        <Slider
          value={[settings.empathy]}
          onValueChange={(value) => onSliderChange("empathy", value)}
          min={1}
          max={5}
          step={1}
          className="w-full"
        />
      </div>
      <div>
        <div className="flex justify-between items-center mb-2">
          <Label>Criatividade das respostas</Label>
          <span className="text-sm text-gray-500">
            {getSliderLabel(settings.responseCreativity)}
          </span>
        </div>
        <Slider
          value={[settings.responseCreativity]}
          onValueChange={(value) => onSliderChange("responseCreativity", value)}
          min={1}
          max={5}
          step={1}
          className="w-full"
        />
      </div>
      <div>
        <div className="flex justify-between items-center mb-2">
          <Label>Objetividade</Label>
          <span className="text-sm text-gray-500">
            {getSliderLabel(settings.directness)}
          </span>
        </div>
        <Slider
          value={[settings.directness]}
          onValueChange={(value) => onSliderChange("directness", value)}
          min={1}
          max={5}
          step={1}
          className="w-full"
        />
      </div>
      <div>
        <div className="flex justify-between items-center mb-2">
          <Label>Número máximo de respostas</Label>
          <span className="text-sm text-gray-500">{settings.maxResponses}</span>
        </div>
        <Slider
          value={[settings.maxResponses]}
          onValueChange={(value) => onSliderChange("maxResponses", value)}
          min={1}
          max={5}
          step={1}
          className="w-full"
        />
      </div>
      <div>
        <div className="flex justify-between items-center mb-2">
          <Label>Tamanho das mensagens</Label>
          <span className="text-sm text-gray-500">
            {getSliderLabel(settings.messageSize)}
          </span>
        </div>
        <Slider
          value={[settings.messageSize]}
          onValueChange={(value) => onSliderChange("messageSize", value)}
          min={1}
          max={5}
          step={1}
          className="w-full"
        />
      </div>
      <div>
        <div className="flex justify-between items-center mb-2">
          <Label>Tempo para resposta</Label>
          <span className="text-sm text-gray-500">
            {getSliderLabel(settings.responseTime)}
          </span>
        </div>
        <Slider
          value={[settings.responseTime]}
          onValueChange={(value) => onSliderChange("responseTime", value)}
          min={1}
          max={5}
          step={1}
          className="w-full"
        />
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              onInputChange("audioResponse", !settings.audioResponse)
            }
            className="p-0 h-6 w-6"
          >
            {settings.audioResponse ? (
              <Volume2 className="h-4 w-4" />
            ) : (
              <VolumeX className="h-4 w-4" />
            )}
          </Button>
          <Label htmlFor="audioResponse">Resposta em áudio</Label>
        </div>
        <Switch
          id="audioResponse"
          checked={settings.audioResponse}
          onCheckedChange={(checked) => onInputChange("audioResponse", checked)}
        />
      </div>
    </CardContent>
  </Card>
);

export default React.memo(TraitsSection);
