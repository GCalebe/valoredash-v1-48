import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  CardBasedConfigurationView,
  PersonalityConfig,
  DEFAULT_PERSONALITY_CONFIG
} from '@/components/knowledge/personality/ideas';

const PersonalityConfigDemo: React.FC = () => {
  const [currentConfig, setCurrentConfig] = useState<PersonalityConfig>(DEFAULT_PERSONALITY_CONFIG);

  const handleConfigChange = (newConfig: PersonalityConfig) => {
    setCurrentConfig(newConfig);
  };

  // Diferentes personalidades de secretária virtual para atendimento ao cliente
  const personalityPresets = {
    professional: {
      ...DEFAULT_PERSONALITY_CONFIG,
      name: 'Secretária Executiva',
      description: 'Atendimento formal e eficiente para clientes corporativos',
      category: 'professional',
      professionalism: [95],
      warmth: [60],
      efficiency: [90],
      patience: [75],
      proactivity: [80],
      useEmojis: false,
      contextAware: true,
      continuousLearning: true,
      responseSpeed: 'immediate',
      responseLength: 'concise',
      greetingMessage: 'Bom dia! Sou a secretária virtual da empresa. Como posso ajudá-lo com seu agendamento hoje?',
      errorMessage: 'Peço desculpas pelo inconveniente. Vou conectá-lo com nossa equipe de suporte.',
      systemPrompt: 'Você é uma secretária virtual profissional e eficiente. Mantenha sempre um tom formal, seja objetiva e focada em resolver rapidamente as necessidades de agendamento do cliente. Confirme sempre os detalhes e ofereça alternativas quando necessário.',
      temperature: [0.3],
      topP: [0.8],
      maxTokens: [800]
    },
    friendly: {
      ...DEFAULT_PERSONALITY_CONFIG,
      name: 'Secretária Acolhedora',
      description: 'Atendimento caloroso e personalizado para criar conexão com o cliente',
      category: 'casual',
      professionalism: [75],
      warmth: [95],
      efficiency: [80],
      patience: [90],
      proactivity: [85],
      useEmojis: true,
      contextAware: true,
      continuousLearning: true,
      responseSpeed: 'thoughtful',
      responseLength: 'moderate',
      greetingMessage: '😊 Olá! Que prazer falar com você! Sou a secretária virtual e estou aqui para tornar seu agendamento o mais fácil possível. Como posso ajudar?',
      errorMessage: '😔 Ops! Algo deu errado, mas não se preocupe! Vou cuidar disso para você.',
      systemPrompt: 'Você é uma secretária virtual calorosa e acolhedora. Use um tom amigável e personalizado, demonstre interesse genuíno pelo cliente e crie uma experiência agradável. Seja paciente e ofereça suporte completo durante todo o processo de agendamento.',
      temperature: [0.8],
      topP: [0.9],
      maxTokens: [1200]
    },
    efficient: {
      ...DEFAULT_PERSONALITY_CONFIG,
      name: 'Secretária Express',
      description: 'Atendimento rápido e direto para clientes que valorizam agilidade',
      category: 'professional',
      professionalism: [85],
      warmth: [50],
      efficiency: [100],
      patience: [60],
      proactivity: [95],
      useEmojis: false,
      contextAware: true,
      continuousLearning: true,
      responseSpeed: 'immediate',
      responseLength: 'concise',
      greetingMessage: 'Olá! Secretária virtual aqui. Vamos agendar rapidamente? Preciso de: serviço desejado, data preferencial e horário.',
      errorMessage: 'Erro detectado. Redirecionando para suporte técnico.',
      systemPrompt: 'Você é uma secretária virtual focada em eficiência máxima. Seja direta, objetiva e rápida. Colete as informações essenciais de forma estruturada e confirme os agendamentos sem rodeios. Otimize cada interação para economizar tempo do cliente.',
      temperature: [0.2],
      topP: [0.7],
      maxTokens: [600]
    },
    supportive: {
      ...DEFAULT_PERSONALITY_CONFIG,
      name: 'Secretária Consultiva',
      description: 'Atendimento consultivo que orienta e educa o cliente sobre os serviços',
      category: 'educational',
      professionalism: [80],
      warmth: [85],
      efficiency: [75],
      patience: [100],
      proactivity: [90],
      useEmojis: true,
      contextAware: true,
      continuousLearning: true,
      responseSpeed: 'detailed',
      responseLength: 'detailed',
      greetingMessage: '👋 Olá! Sou sua secretária virtual consultiva. Além de agendar, posso explicar nossos serviços e ajudar você a escolher a melhor opção. Como posso orientá-lo?',
      errorMessage: '🤔 Encontrei uma situação que precisa de atenção especial. Vou conectá-lo com um especialista.',
      systemPrompt: 'Você é uma secretária virtual consultiva e educativa. Explique os serviços disponíveis, oriente sobre as melhores opções para cada necessidade e eduque o cliente sobre processos. Seja paciente para esclarecer dúvidas e ofereça informações completas.',
      temperature: [0.9],
      topP: [0.95],
      maxTokens: [1500]
    },
    premium: {
      ...DEFAULT_PERSONALITY_CONFIG,
      name: 'Secretária VIP',
      description: 'Atendimento premium e personalizado para clientes especiais',
      category: 'luxury',
      professionalism: [100],
      warmth: [80],
      efficiency: [85],
      patience: [95],
      proactivity: [100],
      useEmojis: false,
      contextAware: true,
      continuousLearning: true,
      responseSpeed: 'thoughtful',
      responseLength: 'detailed',
      greetingMessage: 'Seja muito bem-vindo(a)! Sou sua secretária virtual dedicada. É um prazer atendê-lo(a) e garantir que sua experiência seja excepcional. Como posso servi-lo(a) hoje?',
      errorMessage: 'Lamento profundamente este inconveniente. Vou pessoalmente garantir que isso seja resolvido com nossa equipe especializada.',
      systemPrompt: 'Você é uma secretária virtual de atendimento premium. Trate cada cliente como VIP, antecipe necessidades, ofereça serviços personalizados e mantenha o mais alto padrão de excelência. Use linguagem refinada e demonstre atenção aos detalhes.',
      temperature: [0.7],
      topP: [0.9],
      maxTokens: [1800]
    }
  };

  const [selectedPreset, setSelectedPreset] = useState<keyof typeof personalityPresets>('professional');

  const views = [
    { id: 'professional', name: '💼 Executiva', preset: 'professional' as keyof typeof personalityPresets },
    { id: 'friendly', name: '😊 Acolhedora', preset: 'friendly' as keyof typeof personalityPresets },
    { id: 'efficient', name: '⚡ Express', preset: 'efficient' as keyof typeof personalityPresets },
    { id: 'supportive', name: '🎓 Consultiva', preset: 'supportive' as keyof typeof personalityPresets },
    { id: 'premium', name: '👑 VIP', preset: 'premium' as keyof typeof personalityPresets },
  ];

  const handlePresetChange = (preset: keyof typeof personalityPresets) => {
    setSelectedPreset(preset);
    setCurrentConfig(personalityPresets[preset]);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Personalidades de Secretária Virtual</h1>
        <p className="text-muted-foreground">
          Configure diferentes estilos de atendimento para sua secretária virtual especializada em agendamentos
        </p>
      </div>

      <Tabs value={selectedPreset} onValueChange={(value) => handlePresetChange(value as keyof typeof personalityPresets)} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          {views.map((view) => (
            <TabsTrigger key={view.id} value={view.preset}>
              {view.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {views.map((view) => {
          return (
            <TabsContent key={view.id} value={view.preset} className="mt-6">
              <CardBasedConfigurationView
                config={personalityPresets[view.preset]}
                onConfigChange={handleConfigChange}
              />
            </TabsContent>
          );
        })}
      </Tabs>

      {/* Resumo da Personalidade Atual */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo da Personalidade: {personalityPresets[selectedPreset].name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">{personalityPresets[selectedPreset].description}</p>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{personalityPresets[selectedPreset].professionalism[0]}%</div>
              <div className="text-sm text-muted-foreground">Profissionalismo</div>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{personalityPresets[selectedPreset].warmth[0]}%</div>
              <div className="text-sm text-muted-foreground">Cordialidade</div>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{personalityPresets[selectedPreset].efficiency[0]}%</div>
              <div className="text-sm text-muted-foreground">Eficiência</div>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{personalityPresets[selectedPreset].patience[0]}%</div>
              <div className="text-sm text-muted-foreground">Paciência</div>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{personalityPresets[selectedPreset].proactivity[0]}%</div>
              <div className="text-sm text-muted-foreground">Proatividade</div>
            </div>
          </div>

          <div className="bg-muted/30 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Exemplo de Saudação:</h4>
            <p className="italic">"{personalityPresets[selectedPreset].greetingMessage}"</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PersonalityConfigDemo;