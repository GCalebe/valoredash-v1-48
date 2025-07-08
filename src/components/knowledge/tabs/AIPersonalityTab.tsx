import React, { useState } from "react";
import {
  Save,
  RotateCcw,
  User,
  MessageSquare,
  Heart,
  Zap,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";

interface PersonalitySettings {
  name: string;
  description: string;
  tone: string;
  personality: string;
  formality: number;
  empathy: number;
  creativity: number;
  directness: number;
  greeting: string;
  farewell: string;
  specialInstructions: string;
  maxResponses: number;
  messageSize: number;
  responseTime: number;
  audioResponse: boolean;
  responseCreativity: number;
}

const AIPersonalityTab = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<PersonalitySettings>({
    name: "Assistente Virtual",
    description: "Assistente especializado em atendimento ao cliente",
    tone: "amigável e profissional",
    personality:
      "Sou um assistente virtual dedicado a ajudar você da melhor forma possível. Tenho conhecimento sobre nossos serviços e estou sempre disposto a esclarecer suas dúvidas.",
    formality: 3,
    empathy: 4,
    creativity: 3,
    directness: 3,
    greeting: "Olá! Como posso ajudá-lo hoje?",
    farewell: "Foi um prazer ajudá-lo! Tenha um ótimo dia!",
    specialInstructions:
      "Sempre seja cordial e tente resolver o problema do cliente. Se não souber algo, admita e direcione para um humano.",
    maxResponses: 3,
    messageSize: 3,
    responseTime: 3,
    audioResponse: false,
    responseCreativity: 3,
  });

  const [hasChanges, setHasChanges] = useState(false);

  const handleInputChange = (
    field: keyof PersonalitySettings,
    value: string | number | boolean,
  ) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSliderChange = (
    field: keyof PersonalitySettings,
    values: number[],
  ) => {
    setSettings((prev) => ({ ...prev, [field]: values[0] }));
    setHasChanges(true);
  };

  const handleSave = () => {
    // Here you would normally save to a backend
    console.log("Saving personality settings:", settings);

    toast({
      title: "Configurações salvas",
      description: "A personalidade da IA foi atualizada com sucesso!",
    });

    setHasChanges(false);
  };

  const handleReset = () => {
    setSettings({
      name: "Assistente Virtual",
      description: "Assistente especializado em atendimento ao cliente",
      tone: "amigável e profissional",
      personality:
        "Sou um assistente virtual dedicado a ajudar você da melhor forma possível.",
      formality: 3,
      empathy: 4,
      creativity: 3,
      directness: 3,
      greeting: "Olá! Como posso ajudá-lo hoje?",
      farewell: "Foi um prazer ajudá-lo! Tenha um ótimo dia!",
      specialInstructions:
        "Sempre seja cordial e tente resolver o problema do cliente.",
      maxResponses: 3,
      messageSize: 3,
      responseTime: 3,
      audioResponse: false,
      responseCreativity: 3,
    });
    setHasChanges(true);
  };

  const getSliderLabel = (value: number) => {
    const labels = ["Muito Baixo", "Baixo", "Moderado", "Alto", "Muito Alto"];
    return labels[value - 1] || "Moderado";
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
            Configuração da Personalidade da IA
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Defina como a IA deve se comportar e interagir com os usuários
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Resetar
          </Button>
          <Button onClick={handleSave} disabled={!hasChanges}>
            <Save className="h-4 w-4 mr-2" />
            Salvar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              Informações Básicas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Nome da IA</Label>
              <Input
                id="name"
                value={settings.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Ex: Assistente Virtual"
              />
            </div>

            <div>
              <Label htmlFor="description">Descrição</Label>
              <Input
                id="description"
                value={settings.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Breve descrição do papel da IA"
              />
            </div>

            <div>
              <Label htmlFor="tone">Tom de Voz</Label>
              <Input
                id="tone"
                value={settings.tone}
                onChange={(e) => handleInputChange("tone", e.target.value)}
                placeholder="Ex: amigável e profissional"
              />
            </div>

            <div>
              <Label htmlFor="personality">Descrição da Personalidade</Label>
              <Textarea
                id="personality"
                value={settings.personality}
                onChange={(e) =>
                  handleInputChange("personality", e.target.value)
                }
                placeholder="Descreva como a IA deve se apresentar..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Personality Traits */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Heart className="h-5 w-5 mr-2" />
              Traços de Personalidade
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
                onValueChange={(value) =>
                  handleSliderChange("formality", value)
                }
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
                onValueChange={(value) => handleSliderChange("empathy", value)}
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
                onValueChange={(value) =>
                  handleSliderChange("responseCreativity", value)
                }
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
                onValueChange={(value) =>
                  handleSliderChange("directness", value)
                }
                min={1}
                max={5}
                step={1}
                className="w-full"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <Label>Número máximo de respostas</Label>
                <span className="text-sm text-gray-500">
                  {settings.maxResponses}
                </span>
              </div>
              <Slider
                value={[settings.maxResponses]}
                onValueChange={(value) =>
                  handleSliderChange("maxResponses", value)
                }
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
                onValueChange={(value) =>
                  handleSliderChange("messageSize", value)
                }
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
                onValueChange={(value) =>
                  handleSliderChange("responseTime", value)
                }
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
                    handleInputChange("audioResponse", !settings.audioResponse)
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
                onCheckedChange={(checked) =>
                  handleInputChange("audioResponse", checked)
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Messages */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="h-5 w-5 mr-2" />
              Mensagens Padrão
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="greeting">Saudação Inicial</Label>
              <Textarea
                id="greeting"
                value={settings.greeting}
                onChange={(e) => handleInputChange("greeting", e.target.value)}
                placeholder="Mensagem de boas-vindas..."
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="farewell">Despedida</Label>
              <Textarea
                id="farewell"
                value={settings.farewell}
                onChange={(e) => handleInputChange("farewell", e.target.value)}
                placeholder="Mensagem de despedida..."
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Special Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="h-5 w-5 mr-2" />
              Instruções Especiais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="specialInstructions">
                Diretrizes de Comportamento
              </Label>
              <Textarea
                id="specialInstructions"
                value={settings.specialInstructions}
                onChange={(e) =>
                  handleInputChange("specialInstructions", e.target.value)
                }
                placeholder="Instruções específicas sobre como a IA deve agir..."
                rows={6}
              />
              <p className="text-xs text-gray-500 mt-2">
                Estas instruções são aplicadas a todas as interações da IA
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview */}
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
    </div>
  );
};

export default AIPersonalityTab;
