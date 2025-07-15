import React from 'react';
import { AIMessage } from '@/types/ai';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Edit, Trash2 } from 'lucide-react';

interface MessageListProps {
  stageTitle: string;
  messages: AIMessage[];
  onEdit: (msg: AIMessage) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
  onCopy: (content: string) => void;
  updating: boolean;
}

const MessageList: React.FC<MessageListProps> = ({
  stageTitle,
  messages,
  onEdit,
  onDelete,
  onToggle,
  onCopy,
  updating,
}) => (
  <div className="space-y-4">
    {messages.length === 0 ? (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        <svg className="h-16 w-16 mx-auto mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-6.586-6.586a2 2 0 010-2.828L12 4" /></svg>
        <h3 className="text-lg font-medium mb-1">Nenhuma mensagem em {stageTitle}</h3>
        <p className="text-sm">Adicione mensagens para esta etapa do funil.</p>
      </div>
    ) : (
      messages.map((message) => (
        <Card key={message.id} className={`${!message.is_active ? 'opacity-50' : ''}`}>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-base">{message.name}</CardTitle>
                {message.context && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">Contexto: {message.context}</p>
                )}
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" onClick={() => onCopy(message.content)}>
                  <Copy className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onEdit(message)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(message.id)}
                  className="text-red-500 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                <p className="text-sm">{message.content}</p>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant={message.is_active ? 'default' : 'secondary'}>
                    {message.is_active ? 'Ativa' : 'Inativa'}
                  </Badge>
                  {message.variables && message.variables.length > 0 && (
                    <div className="flex gap-1">
                      {message.variables.map((variable, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {variable}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onToggle(message.id)}
                  disabled={updating}
                >
                  {message.is_active ? 'Desativar' : 'Ativar'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))
    )}
  </div>
);

export default MessageList;

