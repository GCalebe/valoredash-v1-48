import React, { useState } from 'react';
import { Brain, MessageSquare, Settings, Zap, User, Eye, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PersonalityConfig, ConfigurationViewProps, PERSONALITY_CATEGORIES, RESPONSE_LENGTH_OPTIONS } from './index';
import { cn } from '@/lib/utils';

interface SplitScreenConfigurationViewProps extends ConfigurationViewProps {}

const SplitScreenConfigurationView: React.FC<SplitScreenConfigurationViewProps> = ({
  config,
  onConfigChange,
}) => {
  const [previewResponse, setPreviewResponse] = useState('');
  const [previewInput, setPreviewInput] = useState('Olá! Como você pode me ajudar hoje?');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleInputChange = (field: keyof PersonalityConfig, value: string | number | boolean | number[] | 'immediate' | 'thoughtful' | 'detailed' | 'concise' | 'moderate') => {
    onConfigChange({ ...config, [field]: value });
  };

  const handleSliderChange = (field: keyof PersonalityConfig, value: number[]) => {
    onConfigChange({ ...config, [field]: value });
  };

  const generatePreview = async () => {
    setIsGenerating(true);
    // Simular geração de resposta baseada na configuração
    setTimeout(() => {
      const responses = [
        `${(config as any).useEmojis ? '😊 ' : ''}Olá! Fico feliz em ajudá-lo. Como ${(config as any).name || 'assistente'}, estou aqui para fornecer ${(config as any).responseLength === 'detailed' ? 'informações detalhadas' : 'respostas diretas'} sobre qualquer assunto que você precisar.`,
        `${(config as any).useEmojis ? '🤝 ' : ''}Saudações! Sou ${(config as any).name || 'seu assistente'} e estou configurado para ser ${((config as any).formality?.[0] ?? 50) > 70 ? 'formal e profissional' : 'casual e amigável'} em nossas interações.`,
        `${(config as any).useEmojis ? '✨ ' : ''}Oi! Com minha criatividade em ${((config as any).creativity?.[0] ?? 50)}% e empatia em ${((config as any).empathy?.[0] ?? 50)}%, estou pronto para uma conversa ${((config as any).assertiveness?.[0] ?? 50) > 70 ? 'direta e assertiva' : 'colaborativa e compreensiva'}.`
      ];
      setPreviewResponse(responses[Math.floor(Math.random() * responses.length)]);
      setIsGenerating(false);
    }, 1500);
  };

  return (
    <div className="h-screen flex bg-background">
      {/* Configuration Panel */}
      <div className="w-1/2 border-r bg-card overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Settings className="h-6 w-6" />
            <h1 className="text-2xl font-bold">Configuração de Personalidade</h1>
          </div>

          <Tabs defaultValue="basic" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Básico</span>
              </TabsTrigger>
              <TabsTrigger value="personality" className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                <span className="hidden sm:inline">Personalidade</span>
              </TabsTrigger>
              <TabsTrigger value="behavior" className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                <span className="hidden sm:inline">Comportamento</span>
              </TabsTrigger>
              <TabsTrigger value="messages" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                <span className="hidden sm:inline">Mensagens</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Informações Básicas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
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

            <TabsContent value="personality" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    Traços de Personalidade
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <Label className="font-medium">Criatividade</Label>
                        <p className="text-sm text-muted-foreground">Controla o quão criativa e inovadora a IA será</p>
                      </div>
                      <Badge variant="outline">{(config as any).creativity?.[0] ?? 50}%</Badge>
                    </div>
                    <Slider
                      value={(config as any).creativity || [50]}
                      onValueChange={(value) => handleSliderChange('creativity' as any, value)}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <Label className="font-medium">Formalidade</Label>
                        <p className="text-sm text-muted-foreground">Define o nível de formalidade na comunicação</p>
                      </div>
                      <Badge variant="outline">{(config as any).formality?.[0] ?? 50}%</Badge>
                    </div>
                    <Slider
                      value={(config as any).formality || [50]}
                      onValueChange={(value) => handleSliderChange('formality' as any, value)}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <Label className="font-medium">Empatia</Label>
                        <p className="text-sm text-muted-foreground">Capacidade de compreender e responder às emoções</p>
                      </div>
                      <Badge variant="outline">{(config as any).empathy?.[0] ?? 50}%</Badge>
                    </div>
                    <Slider
                      value={(config as any).empathy || [50]}
                      onValueChange={(value) => handleSliderChange('empathy' as any, value)}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <Label className="font-medium">Assertividade</Label>
                        <p className="text-sm text-muted-foreground">Define o quão direta e confiante a IA será</p>
                      </div>
                      <Badge variant="outline">{(config as any).assertiveness?.[0] ?? 50}%</Badge>
                    </div>
                    <Slider
                      value={(config as any).assertiveness || [50]}
                      onValueChange={(value) => handleSliderChange('assertiveness' as any, value)}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="behavior" className="space-y-6">
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
                    <Switch
                      checked={config.useEmojis}
                      onCheckedChange={(checked) => handleInputChange('useEmojis', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="font-medium">Consciência de Contexto</Label>
                      <p className="text-sm text-muted-foreground">Lembrar e referenciar conversas anteriores</p>
                    </div>
                    <Switch
                      checked={config.contextAware}
                      onCheckedChange={(checked) => handleInputChange('contextAware', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="font-medium">Aprendizado Contínuo</Label>
                      <p className="text-sm text-muted-foreground">Aprender e adaptar-se com base nas interações</p>
                    </div>
                    <Switch
                      checked={config.continuousLearning}
                      onCheckedChange={(checked) => handleInputChange('continuousLearning', checked)}
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="font-medium">Tamanho das Respostas</Label>
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
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <Label className="font-medium">Temperatura</Label>
                        <p className="text-sm text-muted-foreground">Controla a aleatoriedade das respostas</p>
                      </div>
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
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <Label className="font-medium">Top P</Label>
                        <p className="text-sm text-muted-foreground">Controla a diversidade do vocabulário</p>
                      </div>
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
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <Label className="font-medium">Máximo de Tokens</Label>
                        <p className="text-sm text-muted-foreground">Limite máximo de tokens por resposta</p>
                      </div>
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
            </TabsContent>

            <TabsContent value="messages" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Mensagens Personalizadas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="greeting">Mensagem de Saudação</Label>
                    <Textarea
                      id="greeting"
                      value={config.greetingMessage}
                      onChange={(e) => handleInputChange('greetingMessage', e.target.value)}
                      placeholder="Olá! Como posso ajudá-lo hoje?"
                      rows={3}
                    />
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
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="system">Prompt do Sistema</Label>
                    <Textarea
                      id="system"
                      value={config.systemPrompt}
                      onChange={(e) => handleInputChange('systemPrompt', e.target.value)}
                      placeholder="Você é um assistente útil e amigável..."
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Preview Panel */}
      <div className="w-1/2 bg-background flex flex-col">
        <div className="border-b bg-card p-4">
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Pré-visualização</h2>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Veja como sua personalidade de IA se comporta em tempo real
          </p>
        </div>

        <div className="flex-1 flex flex-col">
          {/* Chat Preview */}
          <div className="flex-1 p-4 space-y-4 overflow-y-auto">
            {/* System Message */}
            <div className="bg-muted/50 rounded-lg p-3 border-l-4 border-primary">
              <div className="text-xs text-muted-foreground mb-1">Sistema</div>
              <div className="text-sm">{config.systemPrompt || 'Prompt do sistema não definido'}</div>
            </div>

            {/* Greeting Message */}
            <div className="bg-card rounded-lg p-3 border">
              <div className="text-xs text-muted-foreground mb-1">Saudação</div>
              <div className="text-sm">{config.greetingMessage || 'Mensagem de saudação não definida'}</div>
            </div>

            {/* Sample Conversation */}
            {previewResponse && (
              <div className="space-y-3">
                <div className="bg-primary/10 rounded-lg p-3 ml-8">
                  <div className="text-xs text-muted-foreground mb-1">Usuário</div>
                  <div className="text-sm">{previewInput}</div>
                </div>
                <div className="bg-card rounded-lg p-3 mr-8 border">
                  <div className="text-xs text-muted-foreground mb-1">{config.name || 'IA'}</div>
                  <div className="text-sm">{previewResponse}</div>
                </div>
              </div>
            )}
          </div>

          {/* Test Input */}
          <div className="border-t bg-card p-4">
            <div className="space-y-3">
              <Label htmlFor="test-input">Teste sua personalidade</Label>
              <div className="flex gap-2">
                <Input
                  id="test-input"
                  value={previewInput}
                  onChange={(e) => setPreviewInput(e.target.value)}
                  placeholder="Digite uma mensagem para testar..."
                  onKeyPress={(e) => e.key === 'Enter' && generatePreview()}
                />
                <Button
                  onClick={generatePreview}
                  disabled={isGenerating || !previewInput.trim()}
                  size="icon"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              {isGenerating && (
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  Gerando resposta...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Configuration Summary */}
        <div className="border-t bg-card p-4">
          <h3 className="font-medium mb-3">Resumo da Configuração</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Nome:</span>
                <span>{config.name || 'Não definido'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Categoria:</span>
                <span>{config.category || 'Não definida'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Criatividade:</span>
                <Badge variant="outline" className="text-xs">{(config as any).creativity?.[0] ?? 50}%</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Formalidade:</span>
                <Badge variant="outline" className="text-xs">{(config as any).formality?.[0] ?? 50}%</Badge>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Empatia:</span>
                <Badge variant="outline" className="text-xs">{(config as any).empathy?.[0] ?? 50}%</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Assertividade:</span>
                <Badge variant="outline" className="text-xs">{(config as any).assertiveness?.[0] ?? 50}%</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Emojis:</span>
                <Badge variant={config.useEmojis ? "default" : "secondary"} className="text-xs">
                  {config.useEmojis ? 'Sim' : 'Não'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Contexto:</span>
                <Badge variant={config.contextAware ? "default" : "secondary"} className="text-xs">
                  {config.contextAware ? 'Sim' : 'Não'}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SplitScreenConfigurationView;