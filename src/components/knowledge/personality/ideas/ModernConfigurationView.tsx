// @ts-nocheck
import React, { useState } from 'react';
import { Save, RotateCcw, Brain, MessageSquare, Settings, Zap, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PersonalityConfig, ConfigurationViewProps, PERSONALITY_CATEGORIES, RESPONSE_LENGTH_OPTIONS } from './index';

interface ModernConfigurationViewProps extends ConfigurationViewProps {}

const ModernConfigurationView: React.FC<ModernConfigurationViewProps> = ({
  config,
  onConfigChange,
}) => {
  const [activeTab, setActiveTab] = useState('basic');

  const handleInputChange = (field: keyof PersonalityConfig, value: string | number | boolean | number[] | 'immediate' | 'thoughtful' | 'detailed' | 'concise' | 'moderate') => {
    onConfigChange({ ...config, [field]: value });
  };

  const handleSliderChange = (field: keyof PersonalityConfig, value: number[]) => {
    onConfigChange({ ...config, [field]: value });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Brain className="h-6 w-6" />
            Configuração de Personalidade da IA
          </h1>
          <p className="text-muted-foreground">
            Personalize como a IA interage com seus usuários
          </p>
        </div>
      </div>

      {/* Main Configuration Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 h-12">
          <TabsTrigger value="basic" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Básico
          </TabsTrigger>
          <TabsTrigger value="personality" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Personalidade
          </TabsTrigger>
          <TabsTrigger value="behavior" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Comportamento
          </TabsTrigger>
          <TabsTrigger value="messages" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Mensagens
          </TabsTrigger>
        </TabsList>

        {/* Basic Tab */}
        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
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
        </TabsContent>

        {/* Personality Tab */}
        <TabsContent value="personality" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Traços de Personalidade</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Criatividade: {(config as any).creativity?.[0] ?? 50}%</Label>
                  <Slider
                    value={(config as any).creativity || [50]}
                    onValueChange={(value) => handleSliderChange('creativity' as any, value)}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Formalidade: {(config as any).formality?.[0] ?? 50}%</Label>
                  <Slider
                    value={(config as any).formality || [50]}
                    onValueChange={(value) => handleSliderChange('formality' as any, value)}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Empatia: {(config as any).empathy?.[0] ?? 50}%</Label>
                  <Slider
                    value={(config as any).empathy || [50]}
                    onValueChange={(value) => handleSliderChange('empathy' as any, value)}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Assertividade: {(config as any).assertiveness?.[0] ?? 50}%</Label>
                  <Slider
                    value={(config as any).assertiveness || [50]}
                    onValueChange={(value) => handleSliderChange('assertiveness' as any, value)}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Behavior Tab */}
        <TabsContent value="behavior" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Comportamento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Usar Emojis</Label>
                  <p className="text-sm text-muted-foreground">Incluir emojis nas respostas</p>
                </div>
                <Switch
                  checked={config.useEmojis}
                  onCheckedChange={(checked) => handleInputChange('useEmojis', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Consciência de Contexto</Label>
                  <p className="text-sm text-muted-foreground">Lembrar do contexto da conversa</p>
                </div>
                <Switch
                  checked={config.contextAware}
                  onCheckedChange={(checked) => handleInputChange('contextAware', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Aprendizado Contínuo</Label>
                  <p className="text-sm text-muted-foreground">Aprender com as interações</p>
                </div>
                <Switch
                  checked={config.continuousLearning}
                  onCheckedChange={(checked) => handleInputChange('continuousLearning', checked)}
                />
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
        </TabsContent>

        {/* Messages Tab */}
        <TabsContent value="messages" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Mensagens Personalizadas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="greeting">Mensagem de Saudação</Label>
                <Textarea
                  id="greeting"
                  value={config.greetingMessage}
                  onChange={(e) => handleInputChange('greetingMessage', e.target.value)}
                  placeholder="Como a IA deve cumprimentar os usuários"
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="error">Mensagem de Erro</Label>
                <Textarea
                  id="error"
                  value={config.errorMessage}
                  onChange={(e) => handleInputChange('errorMessage', e.target.value)}
                  placeholder="Mensagem quando ocorrer um erro"
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="system">Prompt do Sistema</Label>
                <Textarea
                  id="system"
                  value={config.systemPrompt}
                  onChange={(e) => handleInputChange('systemPrompt', e.target.value)}
                  placeholder="Instruções base para a IA"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ModernConfigurationView;