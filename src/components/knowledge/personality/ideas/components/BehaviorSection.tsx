import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Zap } from 'lucide-react';
import { PersonalityConfig, RESPONSE_LENGTH_OPTIONS } from '../index';

interface BehaviorSectionProps {
  config: PersonalityConfig;
  onChange: (field: keyof PersonalityConfig, value: any) => void;
  onSliderChange: (field: keyof PersonalityConfig, value: number[]) => void;
}

const BehaviorSection: React.FC<BehaviorSectionProps> = ({ config, onChange, onSliderChange }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Comportamento
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className="font-medium">Usar Emojis</Label>
            <p className="text-sm text-muted-foreground">Incluir emojis nas respostas</p>
          </div>
          <Switch checked={config.useEmojis} onCheckedChange={(checked) => onChange('useEmojis', checked)} />
        </div>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className="font-medium">Consciência de Contexto</Label>
            <p className="text-sm text-muted-foreground">Lembrar e referenciar conversas anteriores</p>
          </div>
          <Switch checked={config.contextAware} onCheckedChange={(checked) => onChange('contextAware', checked)} />
        </div>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className="font-medium">Aprendizado Contínuo</Label>
            <p className="text-sm text-muted-foreground">Aprender e adaptar-se com base nas interações</p>
          </div>
          <Switch checked={config.continuousLearning} onCheckedChange={(checked) => onChange('continuousLearning', checked)} />
        </div>
        <div className="space-y-3">
          <Label className="font-medium">Tamanho das Respostas</Label>
          <Select value={config.responseLength} onValueChange={(value) => onChange('responseLength', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RESPONSE_LENGTH_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <Label className="font-medium">Temperatura</Label>
              <p className="text-sm text-muted-foreground">Controla a aleatoriedade das respostas</p>
            </div>
            <Badge variant="outline">{config.temperature[0]}</Badge>
          </div>
          <Slider value={config.temperature} onValueChange={(value) => onSliderChange('temperature', value)} min={0} max={1} step={0.1} className="w-full" />
        </div>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <Label className="font-medium">Top P</Label>
              <p className="text-sm text-muted-foreground">Controla a diversidade do vocabulário</p>
            </div>
            <Badge variant="outline">{config.topP[0]}</Badge>
          </div>
          <Slider value={config.topP} onValueChange={(value) => onSliderChange('topP', value)} min={0} max={1} step={0.1} className="w-full" />
        </div>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <Label className="font-medium">Máximo de Tokens</Label>
              <p className="text-sm text-muted-foreground">Limite máximo de tokens por resposta</p>
            </div>
            <Badge variant="outline">{config.maxTokens[0]}</Badge>
          </div>
          <Slider value={config.maxTokens} onValueChange={(value) => onSliderChange('maxTokens', value)} min={100} max={4000} step={100} className="w-full" />
        </div>
      </CardContent>
    </Card>
  );
};

export default BehaviorSection;


