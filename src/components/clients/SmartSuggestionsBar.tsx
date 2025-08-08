import React, { useState } from 'react';
import { X, Lightbulb, TrendingUp, Users, Target, Clock, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'insight': return 'text-blue-600';
      case 'action': return 'text-green-600';
      case 'opportunity': return 'text-purple-600';
      case 'alert': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex justify-end">
      <div className="w-96 bg-white shadow-2xl h-full overflow-hidden flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            <h2 className="font-semibold text-lg">Sugestões Inteligentes</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-white/20 h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {activeSuggestions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Lightbulb className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Nenhuma sugestão disponível no momento</p>
              <p className="text-sm mt-2">Volte mais tarde para ver novas insights</p>
            </div>
          ) : (
            activeSuggestions.map((suggestion) => (
              <Card key={suggestion.id} className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-full bg-gray-100 ${getTypeColor(suggestion.type)}`}>
                        {suggestion.icon}
                      </div>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getPriorityColor(suggestion.priority)}`}
                      >
                        {suggestion.priority === 'high' ? 'Alta' : 
                         suggestion.priority === 'medium' ? 'Média' : 'Baixa'}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => dismissSuggestion(suggestion.id)}
                      className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  <h3 className="font-medium text-gray-900 mb-2">
                    {suggestion.title}
                  </h3>
                  
                  <p className="text-sm text-gray-600 mb-3">
                    {suggestion.description}
                  </p>
                  
                  {suggestion.actionLabel && (
                    <Button 
                      size="sm" 
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={() => {
                        // Aqui seria implementada a ação específica
                        console.log(`Ação executada para sugestão: ${suggestion.id}`);
                      }}
                    >
                      {suggestion.actionLabel}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="border-t bg-gray-50 p-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>{activeSuggestions.length} sugestões ativas</span>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setDismissedSuggestions([])}
              className="text-blue-600 hover:text-blue-700 h-auto p-0"
            >
              Restaurar todas
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartSuggestionsBar;