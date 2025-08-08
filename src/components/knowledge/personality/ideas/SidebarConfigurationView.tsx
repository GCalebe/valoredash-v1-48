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
import BasicInfoSection from './components/BasicInfoSection';
import PersonalityTraitsSection from './components/PersonalityTraitsSection';
import BehaviorSection from './components/BehaviorSection';
import MessagesSection from './components/MessagesSection';

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
        return <BasicInfoSection config={config} onChange={handleInputChange} />;

      case 'personality':
        return <PersonalityTraitsSection config={config as any} onSliderChange={handleSliderChange as any} />;

      case 'behavior':
        return <BehaviorSection config={config as any} onChange={handleInputChange as any} onSliderChange={handleSliderChange as any} />;

      case 'messages':
        return <MessagesSection config={config as any} onChange={handleInputChange as any} />;

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