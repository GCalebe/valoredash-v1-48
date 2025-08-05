import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, Zap, Brain, Clock, MessageSquare } from "lucide-react";
import type { PersonalitySettings } from "@/hooks/useAIPersonalityForm";

interface AdvancedSettingsSectionProps {
  settings: PersonalitySettings;
  onInputChange: (field: keyof PersonalitySettings, value: string | number | boolean | number[] | 'immediate' | 'thoughtful' | 'detailed' | 'concise' | 'moderate') => void;
}

const AdvancedSettingsSection = ({
  settings,
  onInputChange,
}: AdvancedSettingsSectionProps) => {

  return (
    <div className="space-y-6">
      {/* Configurações de Comportamento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" /> Configurações de Comportamento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="useEmojis">Usar Emojis</Label>
              <p className="text-xs text-muted-foreground">
                Permite o uso de emojis nas respostas para torná-las mais expressivas
              </p>
            </div>
            <Switch
              id="useEmojis"
              checked={settings.useEmojis || false}
              onCheckedChange={(checked) => onInputChange("useEmojis", checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="contextAware">Consciência de Contexto</Label>
              <p className="text-xs text-muted-foreground">
                Mantém o contexto da conversa para respostas mais relevantes
              </p>
            </div>
            <Switch
              id="contextAware"
              checked={settings.contextAware || true}
              onCheckedChange={(checked) => onInputChange("contextAware", checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="continuousLearning">Aprendizado Contínuo</Label>
              <p className="text-xs text-muted-foreground">
                Permite que a IA aprenda e se adapte com base nas interações
              </p>
            </div>
            <Switch
              id="continuousLearning"
              checked={settings.continuousLearning || true}
              onCheckedChange={(checked) => onInputChange("continuousLearning", checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Configurações de Resposta */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="h-5 w-5 mr-2" /> Configurações de Resposta
          </CardTitle>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
            <p className="text-sm text-blue-700">
              💡 <strong>Dica de Custo:</strong> Respostas mais simples (Imediata/Concisa) são mais baratas, enquanto respostas mais complexas (Detalhada/Detalhada) consomem mais recursos e são mais caras.
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="responseSpeed">Velocidade de Resposta</Label>
            <Select
              value={settings.responseSpeed || 'thoughtful'}
              onValueChange={(value) => onInputChange("responseSpeed", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a velocidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="immediate">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <div>
                      <div className="font-medium">Imediata</div>
                      <div className="text-xs text-muted-foreground">Respostas rápidas e diretas</div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="thoughtful">
                  <div className="flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    <div>
                      <div className="font-medium">Reflexiva</div>
                      <div className="text-xs text-muted-foreground">Respostas bem pensadas e equilibradas</div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="detailed">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    <div>
                      <div className="font-medium">Detalhada</div>
                      <div className="text-xs text-muted-foreground">Respostas completas e minuciosas</div>
                    </div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="responseLength">Tamanho da Resposta</Label>
            <Select
              value={settings.responseLength || 'moderate'}
              onValueChange={(value) => onInputChange("responseLength", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tamanho" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="concise">
                  <div>
                    <div className="font-medium">Concisa</div>
                    <div className="text-xs text-muted-foreground">Respostas curtas e objetivas</div>
                  </div>
                </SelectItem>
                <SelectItem value="moderate">
                  <div>
                    <div className="font-medium">Moderada</div>
                    <div className="text-xs text-muted-foreground">Respostas equilibradas em tamanho</div>
                  </div>
                </SelectItem>
                <SelectItem value="detailed">
                  <div>
                    <div className="font-medium">Detalhada</div>
                    <div className="text-xs text-muted-foreground">Respostas extensas e completas</div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default React.memo(AdvancedSettingsSection);