import React, { useState } from 'react';
import { Brain, MessageSquare, Settings, Zap, User, Save, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PersonalityConfig, ConfigurationViewProps, PERSONALITY_CATEGORIES, RESPONSE_LENGTH_OPTIONS } from './index';
import { cn } from '@/lib/utils';

interface SidebarConfigurationViewProps extends ConfigurationViewProps {}

const SidebarConfigurationView: React.FC<SidebarConfigurationViewProps> = ({
  config,
  onConfigChange,
}) => {
  const [activeSection, setActiveSection] = useState('basic');

  const handleInputChange = (field: keyof PersonalityConfig, value: string | number | boolean | number[] | 'immediate' | 'thoughtful' | 'detailed' | 'concise' | 'moderate') => {
    onConfigChange({ ...config, [field]: value });
  };

  const handleSliderChange = (field: keyof PersonalityConfig, value: number[]) => {
    onConfigChange({ ...config, [field]: value });
  };

  const sidebarItems = [
    {
      id: 'basic',
      label: 'Informações Básicas',
      icon: User,
      description: 'Nome e descrição'
    },
    {
      id: 'personality',
      label: 'Traços de Personalidade',
      icon: Brain,
      description: 'Características comportamentais'
    },
    {
      id: 'behavior',
      label: 'Comportamento',
      icon: Zap,
      description: 'Configurações de interação'
    },
    {
      id: 'messages',
      label: 'Mensagens',
      icon: MessageSquare,
      description: 'Mensagens personalizadas'
    },
    {
      id: 'advanced',
      label: 'Configurações Avançadas',
      icon: Settings,
      description: 'Parâmetros técnicos'
    }
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'basic':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Informações Básicas</h2>
              <p className="text-muted-foreground mb-6">Configure o nome, descrição e categoria da personalidade.</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Personalidade</Label>
                <Input
                  id="name"
                  value={config.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Ex: Assistente Criativo"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={config.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Descreva o propósito e características desta personalidade..."
                  rows={4}
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
            </div>
          </div>
        );

      case 'personality':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Traços de Personalidade</h2>
              <p className="text-muted-foreground mb-6">Ajuste os traços comportamentais da IA usando os controles deslizantes.</p>
            </div>
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label>Criatividade</Label>
                  <Badge variant="outline">{config.creativity[0]}%</Badge>
                </div>
                <Slider
                  value={config.creativity}
                  onValueChange={(value) => handleSliderChange('creativity', value)}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <p className="text-sm text-muted-foreground">Controla o quão criativa e inovadora a IA será nas respostas.</p>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label>Formalidade</Label>
                  <Badge variant="outline">{config.formality[0]}%</Badge>
                </div>
                <Slider
                  value={config.formality}
                  onValueChange={(value) => handleSliderChange('formality', value)}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <p className="text-sm text-muted-foreground">Define o nível de formalidade na comunicação.</p>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label>Empatia</Label>
                  <Badge variant="outline">{config.empathy[0]}%</Badge>
                </div>
                <Slider
                  value={config.empathy}
                  onValueChange={(value) => handleSliderChange('empathy', value)}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <p className="text-sm text-muted-foreground">Controla a capacidade de compreender e responder às emoções.</p>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label>Assertividade</Label>
                  <Badge variant="outline">{config.assertiveness[0]}%</Badge>
                </div>
                <Slider
                  value={config.assertiveness}
                  onValueChange={(value) => handleSliderChange('assertiveness', value)}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <p className="text-sm text-muted-foreground">Define o quão direta e confiante a IA será.</p>
              </div>
            </div>
          </div>
        );

      case 'behavior':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Comportamento</h2>
              <p className="text-muted-foreground mb-6">Configure como a IA se comporta durante as interações.</p>
            </div>
            <div className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Usar Emojis</Label>
                      <p className="text-sm text-muted-foreground">Incluir emojis nas respostas para torná-las mais expressivas</p>
                    </div>
                    <Switch
                      checked={config.useEmojis}
                      onCheckedChange={(checked) => handleInputChange('useEmojis', checked)}
                    />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Consciência de Contexto</Label>
                      <p className="text-sm text-muted-foreground">Lembrar e referenciar conversas anteriores</p>
                    </div>
                    <Switch
                      checked={config.contextAware}
                      onCheckedChange={(checked) => handleInputChange('contextAware', checked)}
                    />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Aprendizado Contínuo</Label>
                      <p className="text-sm text-muted-foreground">Aprender e adaptar-se com base nas interações</p>
                    </div>
                    <Switch
                      checked={config.continuousLearning}
                      onCheckedChange={(checked) => handleInputChange('continuousLearning', checked)}
                    />
                  </div>
                </CardContent>
              </Card>
              <div className="space-y-2">
                <Label>Tamanho das Respostas</Label>
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
            </div>
          </div>
        );

      case 'messages':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Mensagens Personalizadas</h2>
              <p className="text-muted-foreground mb-6">Defina mensagens específicas para diferentes situações.</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="greeting">Mensagem de Saudação</Label>
                <Textarea
                  id="greeting"
                  value={config.greetingMessage}
                  onChange={(e) => handleInputChange('greetingMessage', e.target.value)}
                  placeholder="Olá! Como posso ajudá-lo hoje?"
                  rows={3}
                />
                <p className="text-sm text-muted-foreground">Esta mensagem será exibida quando a conversa começar.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="error">Mensagem de Erro</Label>
                <Textarea
                  id="error"
                  value={config.errorMessage}
                  onChange={(e) => handleInputChange('errorMessage', e.target.value)}
                  placeholder="Desculpe, ocorreu um erro. Tente novamente."
                  rows={3}
                />
                <p className="text-sm text-muted-foreground">Mensagem exibida quando ocorrer um erro no sistema.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="system">Prompt do Sistema</Label>
                <Textarea
                  id="system"
                  value={config.systemPrompt}
                  onChange={(e) => handleInputChange('systemPrompt', e.target.value)}
                  placeholder="Você é um assistente útil e amigável..."
                  rows={5}
                />
                <p className="text-sm text-muted-foreground">Instruções fundamentais que definem o comportamento da IA.</p>
              </div>
            </div>
          </div>
        );

      case 'advanced':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Configurações Avançadas</h2>
              <p className="text-muted-foreground mb-6">Parâmetros técnicos que controlam o modelo de IA.</p>
            </div>
            <div className="space-y-6">
              <div className="space-y-3">
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
                <p className="text-sm text-muted-foreground">Controla a aleatoriedade das respostas. Valores mais altos = mais criativo.</p>
              </div>
              <div className="space-y-3">
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
                <p className="text-sm text-muted-foreground">Controla a diversidade do vocabulário usado nas respostas.</p>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label>Máximo de Tokens</Label>
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
                <p className="text-sm text-muted-foreground">Limite máximo de tokens (palavras) por resposta.</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-80 border-r bg-card">
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6" />
            Configuração de Personalidade
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configure todos os aspectos da IA
          </p>
        </div>
        <nav className="p-4">
          <ul className="space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => setActiveSection(item.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-colors",
                      activeSection === item.id
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <div className="flex-1">
                      <div className="font-medium">{item.label}</div>
                      <div className="text-xs opacity-70">{item.description}</div>
                    </div>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default SidebarConfigurationView;