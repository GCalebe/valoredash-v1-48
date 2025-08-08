import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Users, Target, CheckCircle, XCircle } from 'lucide-react';
import { AIMessage, SchedulingStage } from './types';

interface StageTimelineProps {
  stages: SchedulingStage[];
  messagesByStage: Record<string, AIMessage[]>;
  onSelectMessage: (message: AIMessage) => void;
}

export const StageTimeline: React.FC<StageTimelineProps> = ({ stages, messagesByStage, onSelectMessage }) => {
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Lead: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      Prospect: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      Cliente: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'Ex-cliente': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
    };
    return colors[category] || colors['Lead'];
  };

  return (
    <div className="relative">
      <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-300 dark:bg-gray-600" />
      <div className="space-y-12">
        {stages.map((stage) => {
          const messages = messagesByStage[stage.id] || [];
          return (
            <div key={stage.id} className="relative">
              <div className={`absolute left-6 w-4 h-4 ${stage.color} rounded-full flex items-center justify-center text-white z-10`}>
                <div className="w-2 h-2 bg-white rounded-full" />
              </div>
              <div className="ml-16">
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 ${stage.color} rounded-lg text-white`}>{stage.icon}</div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{stage.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{stage.description}</p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {messages.map((message) => (
                    <Card
                      key={message.id}
                      className="p-4 cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 border-l-4"
                      onClick={() => onSelectMessage(message)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-1">
                          {message.isActive ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-gray-400" />
                          )}
                        </div>
                      </div>
                      <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-2 text-sm">{message.name}</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">{message.content}</p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge className={`text-xs ${getCategoryColor(message.category)}`}>{message.category}</Badge>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            <span>{message.usage}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Target className="h-3 w-3" />
                            <span>{message.effectiveness}%</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                  {messages.length === 0 && (
                    <Card className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600">
                      <div className="text-center text-gray-500 dark:text-gray-400">
                        <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Nenhuma mensagem configurada</p>
                        <p className="text-xs">Clique para adicionar uma mensagem</p>
                      </div>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StageTimeline;


