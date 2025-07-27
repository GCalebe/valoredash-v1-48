import React, { useState } from 'react';
import { Brain, MessageSquare, Settings, Zap, Palette, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PersonalityConfig, ConfigurationViewProps, PERSONALITY_CATEGORIES, RESPONSE_SPEED_OPTIONS, RESPONSE_LENGTH_OPTIONS } from './index';

interface CardBasedConfigurationViewProps extends ConfigurationViewProps {}

const CardBasedConfigurationView: React.FC<CardBasedConfigurationViewProps> = ({
  config,
  onConfigChange,
}) => {
  const handleInputChange = (field: keyof PersonalityConfig, value: any) => {
    onConfigChange({ ...config, [field]: value });
  };

  const handleSliderChange = (field: keyof PersonalityConfig, value: number[]) => {
    onConfigChange({ ...config, [field]: value });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground flex items-center justify-center gap-2">
          <Brain className="h-8 w-8" />
          Configuração de Secretária Virtual
        </h1>
        <p className="text-muted-foreground">
          Configure o estilo de atendimento da sua secretária virtual
        </p>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        
        {/* Basic Information Card */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Informações Básicas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={config.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Nome da personalidade"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={config.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Descreva a personalidade"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select value={config.category} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {PERSONALITY_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Personality Traits Card */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Características de Atendimento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Profissionalismo</Label>
                  <Badge variant="outline">{config.professionalism[0]}%</Badge>
                </div>
                <Slider
                  value={config.professionalism}
                  onValueChange={(value) => handleSliderChange('professionalism', value)}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Cordialidade</Label>
                  <Badge variant="outline">{config.warmth[0]}%</Badge>
                </div>
                <Slider
                  value={config.warmth}
                  onValueChange={(value) => handleSliderChange('warmth', value)}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Eficiência</Label>
                  <Badge variant="outline">{config.efficiency[0]}%</Badge>
                </div>
                <Slider
                  value={config.efficiency}
                  onValueChange={(value) => handleSliderChange('efficiency', value)}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Paciência</Label>
                  <Badge variant="outline">{config.patience[0]}%</Badge>
                </div>
                <Slider
                  value={config.patience}
                  onValueChange={(value) => handleSliderChange('patience', value)}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Proatividade</Label>
                  <Badge variant="outline">{config.proactivity[0]}%</Badge>
                </div>
                <Slider
                  value={config.proactivity}
                  onValueChange={(value) => handleSliderChange('proactivity', value)}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Behavior Card */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Comportamento de Atendimento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Usar Emojis</Label>
                <p className="text-xs text-muted-foreground">Incluir emojis nas respostas</p>
              </div>
              <Switch
                checked={config.useEmojis}
                onCheckedChange={(checked) => handleInputChange('useEmojis', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Consciência de Contexto</Label>
                <p className="text-xs text-muted-foreground">Lembrar do histórico do cliente</p>
              </div>
              <Switch
                checked={config.contextAware}
                onCheckedChange={(checked) => handleInputChange('contextAware', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Aprendizado Contínuo</Label>
                <p className="text-xs text-muted-foreground">Melhorar com cada atendimento</p>
              </div>
              <Switch
                checked={config.continuousLearning}
                onCheckedChange={(checked) => handleInputChange('continuousLearning', checked)}
              />
            </div>
            <div className="space-y-2">
              <Label>Velocidade de Resposta</Label>
              <Select value={config.responseSpeed} onValueChange={(value) => handleInputChange('responseSpeed', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RESPONSE_SPEED_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tamanho da Resposta</Label>
              <Select value={config.responseLength} onValueChange={(value) => handleInputChange('responseLength', value)}>
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
          </CardContent>
        </Card>

        {/* Messages Card */}
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Mensagens de Atendimento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="greeting">Mensagem de Saudação</Label>
              <Textarea
                id="greeting"
                value={config.greetingMessage}
                onChange={(e) => handleInputChange('greetingMessage', e.target.value)}
                placeholder="Como a secretária deve cumprimentar os clientes"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="error">Mensagem de Erro</Label>
              <Textarea
                id="error"
                value={config.errorMessage || ''}
                onChange={(e) => handleInputChange('errorMessage', e.target.value)}
                placeholder="Mensagem quando não conseguir agendar ou houver erro"
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Advanced Settings Card */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configurações Avançadas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Temperatura</Label>
                <Badge variant="outline">{config.temperature[0]}</Badge>
              </div>
              <Slider
                value={config.temperature}
                onValueChange={(value) => handleSliderChange('temperature', value)}
                min={0}
                max={1}
                step={0.1}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Top P</Label>
                <Badge variant="outline">{config.topP[0]}</Badge>
              </div>
              <Slider
                value={config.topP}
                onValueChange={(value) => handleSliderChange('topP', value)}
                min={0}
                max={1}
                step={0.1}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Max Tokens</Label>
                <Badge variant="outline">{config.maxTokens[0]}</Badge>
              </div>
              <Slider
                value={config.maxTokens}
                onValueChange={(value) => handleSliderChange('maxTokens', value)}
                min={100}
                max={4000}
                step={100}
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>

        {/* System Prompt Card */}
        <Card className="col-span-1 lg:col-span-2 xl:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Instruções da Secretária
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="system">Instruções para a Secretária Virtual</Label>
              <Textarea
                id="system"
                value={config.systemPrompt}
                onChange={(e) => handleInputChange('systemPrompt', e.target.value)}
                placeholder="Instruções detalhadas sobre como a secretária deve atender clientes e gerenciar agendamentos"
                rows={4}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CardBasedConfigurationView;