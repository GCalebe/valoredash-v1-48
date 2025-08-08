import React, { useState } from 'react';
import { Brain, MessageSquare, Settings, Zap, User, Eye, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
//
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BasicInfoSection from './components/BasicInfoSection';
import PersonalityTraitsSection from './components/PersonalityTraitsSection';
import BehaviorSection from './components/BehaviorSection';
import MessagesSection from './components/MessagesSection';
import { PersonalityConfig, ConfigurationViewProps } from './index';

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
              <BasicInfoSection config={config} onChange={handleInputChange} />
            </TabsContent>

            <TabsContent value="personality" className="space-y-6">
              <PersonalityTraitsSection config={config} onSliderChange={handleSliderChange} />
            </TabsContent>

            <TabsContent value="behavior" className="space-y-6">
              <BehaviorSection config={config} onChange={handleInputChange} onSliderChange={handleSliderChange} />
            </TabsContent>

            <TabsContent value="messages" className="space-y-6">
              <MessagesSection config={config} onChange={handleInputChange} />
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