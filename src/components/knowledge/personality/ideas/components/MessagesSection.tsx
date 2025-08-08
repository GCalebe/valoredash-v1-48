import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare } from 'lucide-react';
import { PersonalityConfig } from '../index';

interface MessagesSectionProps {
  config: PersonalityConfig;
  onChange: (field: keyof PersonalityConfig, value: any) => void;
}

const MessagesSection: React.FC<MessagesSectionProps> = ({ config, onChange }) => {
  return (
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
          <Textarea id="greeting" value={config.greetingMessage} onChange={(e) => onChange('greetingMessage', e.target.value)} placeholder="Olá! Como posso ajudá-lo hoje?" rows={3} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="error">Mensagem de Erro</Label>
          <Textarea id="error" value={config.errorMessage} onChange={(e) => onChange('errorMessage', e.target.value)} placeholder="Desculpe, ocorreu um erro. Tente novamente." rows={3} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="system">Prompt do Sistema</Label>
          <Textarea id="system" value={config.systemPrompt} onChange={(e) => onChange('systemPrompt', e.target.value)} placeholder="Você é um assistente útil e amigável..." rows={4} />
        </div>
      </CardContent>
    </Card>
  );
};

export default MessagesSection;


