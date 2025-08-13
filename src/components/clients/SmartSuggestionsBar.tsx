import React, { useState } from 'react';
import { X, Lightbulb, TrendingUp, Users, Target, Clock, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface SmartSuggestionsBarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Suggestion {
  id: string;
  type: 'insight' | 'action' | 'opportunity' | 'alert';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  icon: React.ReactNode;
  actionLabel?: string;
}

const SmartSuggestionsBar: React.FC<SmartSuggestionsBarProps> = ({ isOpen, onClose }) => {
  const [dismissedSuggestions, setDismissedSuggestions] = useState<string[]>([]);

  const suggestions: Suggestion[] = [
    {
      id: '1',
      type: 'insight',
      title: 'Clientes com Alto Potencial',
      description: '15 clientes não contatados há mais de 30 dias com histórico de alta conversão',
      priority: 'high',
      icon: <TrendingUp className="h-4 w-4" />,
      actionLabel: 'Ver Lista'
    },
    {
      id: '2',
      type: 'opportunity',
      title: 'Oportunidade de Upsell',
      description: '8 clientes ativos podem se beneficiar de serviços premium baseado no perfil',
      priority: 'medium',
      icon: <Target className="h-4 w-4" />,
      actionLabel: 'Analisar'
    },
    {
      id: '3',
      type: 'alert',
      title: 'Clientes em Risco',
      description: '3 clientes com engajamento baixo nas últimas 2 semanas',
      priority: 'high',
      icon: <Clock className="h-4 w-4" />,
      actionLabel: 'Revisar'
    },
    {
      id: '4',
      type: 'action',
      title: 'Segmentação Sugerida',
      description: 'Criar segmento "Prospects Qualificados" com 23 leads identificados',
      priority: 'medium',
      icon: <Users className="h-4 w-4" />,
      actionLabel: 'Criar Segmento'
    },
    {
      id: '5',
      type: 'insight',
      title: 'Melhor Horário de Contato',
      description: 'Terças e quintas entre 14h-16h têm 40% mais taxa de resposta',
      priority: 'low',
      icon: <Star className="h-4 w-4" />,
      actionLabel: 'Agendar'
    }
  ];

  const activeSuggestions = suggestions.filter(s => !dismissedSuggestions.includes(s.id));

  const dismissSuggestion = (id: string) => {
    setDismissedSuggestions(prev => [...prev, id]);
  };

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'Alta';
      case 'medium': return 'Média';
      case 'low': return 'Baixa';
      default: return priority;
    }
  };

  const getTypeIcon = (type: string) => {
    const iconProps = "h-4 w-4";
    switch (type) {
      case 'insight': return <Lightbulb className={`${iconProps} text-primary`} />;
      case 'action': return <Target className={`${iconProps} text-success`} />;
      case 'opportunity': return <TrendingUp className={`${iconProps} text-warning`} />;
      case 'alert': return <Clock className={`${iconProps} text-destructive`} />;
      default: return <Star className={`${iconProps} text-muted-foreground`} />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'insight': return 'Insight';
      case 'action': return 'Ação';
      case 'opportunity': return 'Oportunidade';
      case 'alert': return 'Alerta';
      default: return type;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex">
      <div className="w-96 bg-background border-r shadow-xl h-full flex flex-col animate-in slide-in-from-left duration-300">
        {/* Header */}
        <div className="p-6 border-b bg-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Lightbulb className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-lg text-foreground">Sugestões Inteligentes</h2>
                <p className="text-sm text-muted-foreground">Insights personalizados para você</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1 p-4">
          {activeSuggestions.length === 0 ? (
            <div className="text-center py-12">
              <div className="p-4 rounded-full bg-muted/50 mx-auto w-fit mb-4">
                <Lightbulb className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-medium text-foreground mb-2">Nenhuma sugestão disponível</h3>
              <p className="text-sm text-muted-foreground">
                Volte mais tarde para ver novas insights
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeSuggestions.map((suggestion, index) => (
                <Card key={suggestion.id} className="animate-fade-in hover:shadow-md transition-all duration-200" style={{ animationDelay: `${index * 100}ms` }}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-muted">
                          {getTypeIcon(suggestion.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs">
                              {getTypeLabel(suggestion.type)}
                            </Badge>
                            <Badge variant={getPriorityVariant(suggestion.priority) as any} className="text-xs">
                              {getPriorityLabel(suggestion.priority)}
                            </Badge>
                          </div>
                          <CardTitle className="text-base font-medium leading-tight">
                            {suggestion.title}
                          </CardTitle>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => dismissSuggestion(suggestion.id)}
                        className="h-8 w-8 p-0 shrink-0 text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                      {suggestion.description}
                    </p>
                    
                    {suggestion.actionLabel && (
                      <Button 
                        size="sm" 
                        className="w-full"
                        onClick={() => {
                          console.log(`Ação executada para sugestão: ${suggestion.id}`);
                        }}
                      >
                        {suggestion.actionLabel}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="border-t bg-card p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {activeSuggestions.length} sugestão{activeSuggestions.length !== 1 ? 'ões' : ''} ativa{activeSuggestions.length !== 1 ? 's' : ''}
            </span>
            {dismissedSuggestions.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setDismissedSuggestions([])}
                className="h-auto p-0 text-primary hover:text-primary/80"
              >
                Restaurar todas
              </Button>
            )}
          </div>
          <Separator className="my-3" />
          <p className="text-xs text-muted-foreground text-center">
            Sugestões baseadas na análise dos seus dados
          </p>
        </div>
      </div>
    </div>
  );
};

export default SmartSuggestionsBar;