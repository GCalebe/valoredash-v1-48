import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Settings, Eye, Play } from 'lucide-react';
import { PersonalityConfig } from './ideas';

interface PersonalityCardProps {
  personality: PersonalityConfig;
  onSelect: (personality: PersonalityConfig) => void;
  onPreview: (personality: PersonalityConfig) => void;
  onActivate: (personality: PersonalityConfig) => void;
  isSelected?: boolean;
  isActive?: boolean;
}

const PersonalityCard: React.FC<PersonalityCardProps> = ({
  personality,
  onSelect,
  onPreview,
  onActivate,
  isSelected = false,
  isActive = false,
}) => {
  const getIcon = (name: string) => {
    switch (name) {
      case 'Secretária Executiva':
        return '💼';
      case 'Secretária Acolhedora':
        return '😊';
      case 'Secretária Express':
        return '⚡';
      case 'Secretária Consultiva':
        return '🎓';
      case 'Secretária VIP':
        return '👑';
      default:
        return '🤖';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'professional':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'casual':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'educational':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'luxury':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'professional':
        return 'Profissional';
      case 'casual':
        return 'Casual';
      case 'educational':
        return 'Educacional';
      case 'luxury':
        return 'Premium';
      default:
        return 'Geral';
    }
  };

  return (
    <Card 
      className={`hover:shadow-lg transition-all cursor-pointer ${
        isSelected ? 'ring-2 ring-primary border-primary' : ''
      } ${
        isActive ? 'border-2 border-green-500 shadow-green-100 bg-green-50/50 dark:bg-green-900/10' : ''
      }`}
      onClick={() => onSelect(personality)}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl">{getIcon(personality.name)}</div>
            <div>
              <CardTitle className="text-lg">{personality.name}</CardTitle>
              <Badge 
                variant="secondary" 
                className={`text-xs mt-1 ${getCategoryColor(personality.category)}`}
              >
                {getCategoryLabel(personality.category)}
              </Badge>
              {isActive && (
                <Badge className="ml-2 bg-green-500 text-white text-xs">
                  Ativa
                </Badge>
              )}
            </div>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onPreview(personality);
              }}
              title="Visualizar configurações"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onActivate(personality);
              }}
              title="Ativar personalidade"
              className={isActive ? 'text-green-600' : ''}
            >
              <Play className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(personality);
              }}
              title="Configurar personalidade"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {personality.description}
        </p>
        
        {/* Métricas de Atendimento */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Profissionalismo:</span>
            <span className="font-medium text-blue-600">{personality.professionalism[0]}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Cordialidade:</span>
            <span className="font-medium text-red-600">{personality.warmth[0]}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Eficiência:</span>
            <span className="font-medium text-green-600">{personality.efficiency[0]}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Paciência:</span>
            <span className="font-medium text-purple-600">{personality.patience[0]}%</span>
          </div>
        </div>

        {/* Configurações Rápidas */}
        <div className="flex flex-wrap gap-1 text-xs">
          <Badge variant="outline" className="text-xs">
            {personality.responseSpeed === 'immediate' ? 'Imediato' : 
             personality.responseSpeed === 'thoughtful' ? 'Reflexivo' : 'Detalhado'}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {personality.responseLength === 'concise' ? 'Conciso' : 
             personality.responseLength === 'moderate' ? 'Moderado' : 'Detalhado'}
          </Badge>
          {personality.useEmojis && (
            <Badge variant="outline" className="text-xs">
              Emojis
            </Badge>
          )}
        </div>

        {/* Exemplo de Saudação */}
        <div className="bg-muted/30 p-2 rounded text-xs">
          <span className="font-medium text-muted-foreground">Saudação: </span>
          <span className="italic line-clamp-2">"{personality.greetingMessage}"</span>
        </div>
      </CardContent>
    </Card>
  );
};

interface PersonalityCardsProps {
  personalities: PersonalityConfig[];
  onSelect: (personality: PersonalityConfig) => void;
  onPreview: (personality: PersonalityConfig) => void;
  onActivate: (personality: PersonalityConfig) => void;
  selectedPersonality?: PersonalityConfig | null;
  activePersonality?: PersonalityConfig | null;
}

const PersonalityCards: React.FC<PersonalityCardsProps> = ({
  personalities,
  onSelect,
  onPreview,
  onActivate,
  selectedPersonality,
  activePersonality,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {personalities.map((personality, index) => (
        <PersonalityCard
          key={`${personality.name}-${index}`}
          personality={personality}
          onSelect={onSelect}
          onPreview={onPreview}
          onActivate={onActivate}
          isSelected={selectedPersonality?.name === personality.name}
          isActive={activePersonality?.name === personality.name}
        />
      ))}
    </div>
  );
};

export default PersonalityCards;