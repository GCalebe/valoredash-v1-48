import React, { useState } from 'react';
import { Brain, MessageSquare, Settings, Zap, User, ChevronLeft, ChevronRight, Check } from 'lucide-react';
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

interface WizardConfigurationViewProps extends ConfigurationViewProps {}

const WizardConfigurationView: React.FC<WizardConfigurationViewProps> = ({
  config,
  onConfigChange,
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleInputChange = (field: keyof PersonalityConfig, value: any) => {
    onConfigChange({ ...config, [field]: value });
  };

  const handleSliderChange = (field: keyof PersonalityConfig, value: number[]) => {
    onConfigChange({ ...config, [field]: value });
  };

  const steps = [
    {
      id: 'basic',
      title: 'Informações Básicas',
      description: 'Configure o nome, descrição e categoria',
      icon: User,
    },
    {
      id: 'personality',
      title: 'Traços de Personalidade',
      description: 'Defina as características comportamentais',
      icon: Brain,
    },
    {
      id: 'behavior',
      title: 'Comportamento',
      description: 'Configure as preferências de interação',
      icon: Zap,
    },
    {
      id: 'messages',
      title: 'Mensagens',
      description: 'Personalize as mensagens do sistema',
      icon: MessageSquare,
    },
    {
      id: 'advanced',
      title: 'Configurações Avançadas',
      description: 'Ajuste os parâmetros técnicos',
      icon: Settings,
    },
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (stepIndex: number) => {
    setCurrentStep(stepIndex);
  };

  const renderStepContent = () => {
    const step = steps[currentStep];

    switch (step.id) {
      case 'basic':
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <User className="h-12 w-12 mx-auto text-primary" />
              <h2 className="text-2xl font-bold">Informações Básicas</h2>
              <p className="text-muted-foreground">Vamos começar definindo o nome e a descrição da sua personalidade de IA.</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Personalidade</Label>
                <Input
                  id="name"
                  value={config.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Ex: Assistente Criativo"
                  className="text-lg"
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
            <div className="text-center space-y-2">
              <Brain className="h-12 w-12 mx-auto text-primary" />
              <h2 className="text-2xl font-bold">Traços de Personalidade</h2>
              <p className="text-muted-foreground">Ajuste os traços que definem como a IA se comporta e responde.</p>
            </div>
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <Label className="text-base font-medium">Criatividade</Label>
                    <p className="text-sm text-muted-foreground">Controla o quão criativa e inovadora a IA será</p>
                  </div>
                  <Badge variant="outline" className="text-lg px-3 py-1">{config.creativity[0]}%</Badge>
                </div>
                <Slider
                  value={config.creativity}
                  onValueChange={(value) => handleSliderChange('creativity', value)}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <Label className="text-base font-medium">Formalidade</Label>
                    <p className="text-sm text-muted-foreground">Define o nível de formalidade na comunicação</p>
                  </div>
                  <Badge variant="outline" className="text-lg px-3 py-1">{config.formality[0]}%</Badge>
                </div>
                <Slider
                  value={config.formality}
                  onValueChange={(value) => handleSliderChange('formality', value)}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <Label className="text-base font-medium">Empatia</Label>
                    <p className="text-sm text-muted-foreground">Capacidade de compreender e responder às emoções</p>
                  </div>
                  <Badge variant="outline" className="text-lg px-3 py-1">{config.empathy[0]}%</Badge>
                </div>
                <Slider
                  value={config.empathy}
                  onValueChange={(value) => handleSliderChange('empathy', value)}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <Label className="text-base font-medium">Assertividade</Label>
                    <p className="text-sm text-muted-foreground">Define o quão direta e confiante a IA será</p>
                  </div>
                  <Badge variant="outline" className="text-lg px-3 py-1">{config.assertiveness[0]}%</Badge>
                </div>
                <Slider
                  value={config.assertiveness}
                  onValueChange={(value) => handleSliderChange('assertiveness', value)}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        );

      case 'behavior':
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <Zap className="h-12 w-12 mx-auto text-primary" />
              <h2 className="text-2xl font-bold">Comportamento</h2>
              <p className="text-muted-foreground">Configure como a IA se comporta durante as interações.</p>
            </div>
            <div className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-base font-medium">Usar Emojis</Label>
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
                    <div className="space-y-1">
                      <Label className="text-base font-medium">Consciência de Contexto</Label>
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
                    <div className="space-y-1">
                      <Label className="text-base font-medium">Aprendizado Contínuo</Label>
                      <p className="text-sm text-muted-foreground">Aprender e adaptar-se com base nas interações</p>
                    </div>
                    <Switch
                      checked={config.continuousLearning}
                      onCheckedChange={(checked) => handleInputChange('continuousLearning', checked)}
                    />
                  </div>
                </CardContent>
              </Card>
              <div className="space-y-3">
                <Label className="text-base font-medium">Tamanho das Respostas</Label>
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
            <div className="text-center space-y-2">
              <MessageSquare className="h-12 w-12 mx-auto text-primary" />
              <h2 className="text-2xl font-bold">Mensagens Personalizadas</h2>
              <p className="text-muted-foreground">Defina mensagens específicas para diferentes situações.</p>
            </div>
            <div className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="greeting" className="text-base font-medium">Mensagem de Saudação</Label>
                <Textarea
                  id="greeting"
                  value={config.greetingMessage}
                  onChange={(e) => handleInputChange('greetingMessage', e.target.value)}
                  placeholder="Olá! Como posso ajudá-lo hoje?"
                  rows={3}
                />
                <p className="text-sm text-muted-foreground">Esta mensagem será exibida quando a conversa começar.</p>
              </div>
              <div className="space-y-3">
                <Label htmlFor="error" className="text-base font-medium">Mensagem de Erro</Label>
                <Textarea
                  id="error"
                  value={config.errorMessage}
                  onChange={(e) => handleInputChange('errorMessage', e.target.value)}
                  placeholder="Desculpe, ocorreu um erro. Tente novamente."
                  rows={3}
                />
                <p className="text-sm text-muted-foreground">Mensagem exibida quando ocorrer um erro no sistema.</p>
              </div>
              <div className="space-y-3">
                <Label htmlFor="system" className="text-base font-medium">Prompt do Sistema</Label>
                <Textarea
                  id="system"
                  value={config.systemPrompt}
                  onChange={(e) => handleInputChange('systemPrompt', e.target.value)}
                  placeholder="Você é um assistente útil e amigável..."
                  rows={4}
                />
                <p className="text-sm text-muted-foreground">Instruções fundamentais que definem o comportamento da IA.</p>
              </div>
            </div>
          </div>
        );

      case 'advanced':
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <Settings className="h-12 w-12 mx-auto text-primary" />
              <h2 className="text-2xl font-bold">Configurações Avançadas</h2>
              <p className="text-muted-foreground">Ajuste os parâmetros técnicos que controlam o modelo de IA.</p>
            </div>
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <Label className="text-base font-medium">Temperatura</Label>
                    <p className="text-sm text-muted-foreground">Controla a aleatoriedade das respostas</p>
                  </div>
                  <Badge variant="outline" className="text-lg px-3 py-1">{config.temperature[0]}</Badge>
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
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <Label className="text-base font-medium">Top P</Label>
                    <p className="text-sm text-muted-foreground">Controla a diversidade do vocabulário</p>
                  </div>
                  <Badge variant="outline" className="text-lg px-3 py-1">{config.topP[0]}</Badge>
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
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <Label className="text-base font-medium">Máximo de Tokens</Label>
                    <p className="text-sm text-muted-foreground">Limite máximo de tokens por resposta</p>
                  </div>
                  <Badge variant="outline" className="text-lg px-3 py-1">{config.maxTokens[0]}</Badge>
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
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Progress */}
      <div className="border-b bg-card">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Brain className="h-6 w-6" />
              <h1 className="text-xl font-bold">Configuração de Personalidade</h1>
            </div>
            <div className="text-sm text-muted-foreground">
              Passo {currentStep + 1} de {steps.length}
            </div>
          </div>
          
          {/* Progress Steps */}
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;
              
              return (
                <div key={step.id} className="flex items-center">
                  <button
                    onClick={() => goToStep(index)}
                    className={cn(
                      "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors",
                      isActive
                        ? "border-primary bg-primary text-primary-foreground"
                        : isCompleted
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-muted-foreground/30 bg-background text-muted-foreground hover:border-primary/50"
                    )}
                  >
                    {isCompleted ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </button>
                  {index < steps.length - 1 && (
                    <div
                      className={cn(
                        "w-16 h-0.5 mx-2",
                        isCompleted ? "bg-primary" : "bg-muted-foreground/30"
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <Card>
          <CardContent className="p-8">
            {renderStepContent()}
          </CardContent>
        </Card>
      </div>

      {/* Navigation Footer */}
      <div className="border-t bg-card">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            
            <div className="text-sm text-muted-foreground">
              {steps[currentStep].title}
            </div>
            
            <Button
              onClick={nextStep}
              disabled={currentStep === steps.length - 1}
              className="flex items-center gap-2"
            >
              {currentStep === steps.length - 1 ? 'Concluir' : 'Próximo'}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WizardConfigurationView;