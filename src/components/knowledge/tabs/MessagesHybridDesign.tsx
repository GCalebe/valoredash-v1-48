import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, Play, ArrowRight, Clock, CheckCircle, Target } from 'lucide-react';
import { AIMessage, SchedulingStage } from '@/components/knowledge/messages/types';
import StageTimeline from '@/components/knowledge/messages/StageTimeline';
import MessageEditDialog from '@/components/knowledge/messages/MessageEditDialog';

// tipos movidos para messages/types

const schedulingStages: SchedulingStage[] = [
  {
    id: 'initial-contact',
    title: 'Primeiro Contato',
    description: 'Mensagens de boas-vindas e apresentação inicial',
    icon: <MessageSquare className="h-5 w-5" />,
    color: 'bg-blue-500'
  },
  {
    id: 'interest-qualification',
    title: 'Qualificação de Interesse',
    description: 'Identificação de necessidades e interesse do cliente',
    icon: <Target className="h-5 w-5" />,
    color: 'bg-orange-500'
  },
  {
    id: 'scheduling-proposal',
    title: 'Proposta de Agendamento',
    description: 'Convite para agendar reunião ou demonstração',
    icon: <Clock className="h-5 w-5" />,
    color: 'bg-purple-500'
  },
  {
    id: 'confirmation-reminder',
    title: 'Confirmação e Lembrete',
    description: 'Confirmação do agendamento e lembretes',
    icon: <CheckCircle className="h-5 w-5" />,
    color: 'bg-green-500'
  },
  {
    id: 'follow-up',
    title: 'Follow-up Pós-Reunião',
    description: 'Acompanhamento após a reunião realizada',
    icon: <ArrowRight className="h-5 w-5" />,
    color: 'bg-indigo-500'
  },
  {
    id: 'reactivation',
    title: 'Reativação',
    description: 'Mensagens para clientes inativos ou perdidos',
    icon: <Play className="h-5 w-5" />,
    color: 'bg-gray-500'
  }
];

const mockMessagesByStage: Record<string, AIMessage[]> = {
  'initial-contact': [
    {
      id: '1',
      name: 'Mensagem de Boas-vindas',
      content: 'Olá! Bem-vindo ao nosso sistema. Estou aqui para ajudá-lo com todas as suas necessidades de agendamento.',
      category: 'Primeiro Contato',
      conditions: {
        userType: 'Novo usuário',
        stage: 'Primeiro contato'
      },
      isActive: true,
      usage: 245,
      effectiveness: 87
    }
  ],
  'interest-qualification': [
    {
      id: '2',
      name: 'Qualificação de Interesse',
      content: 'Vi que você demonstrou interesse em nossos serviços. Poderia me contar mais sobre suas necessidades?',
      category: 'Qualificação',
      conditions: {
        userType: 'Lead qualificado',
        stage: 'Demonstração de interesse'
      },
      isActive: true,
      usage: 189,
      effectiveness: 92
    }
  ],
  'scheduling-proposal': [
    {
      id: '3',
      name: 'Convite para Agendamento',
      content: 'Com base no seu perfil, gostaria de agendar uma conversa para apresentar nossa solução personalizada?',
      category: 'Agendamento',
      conditions: {
        userType: 'Prospect qualificado',
        stage: 'Proposta de reunião'
      },
      isActive: true,
      usage: 156,
      effectiveness: 78
    }
  ],
  'confirmation-reminder': [
    {
      id: '4',
      name: 'Confirmação de Agendamento',
      content: 'Perfeito! Sua reunião está agendada para [DATA] às [HORA]. Enviarei um lembrete 1 hora antes.',
      category: 'Confirmação',
      conditions: {
        userType: 'Cliente agendado',
        stage: 'Pós-agendamento'
      },
      isActive: true,
      usage: 98,
      effectiveness: 95
    }
  ],
  'follow-up': [
    {
      id: '5',
      name: 'Follow-up Pós-Reunião',
      content: 'Obrigado pela reunião! Como prometido, segue o material discutido. Tem alguma dúvida?',
      category: 'Follow-up',
      conditions: {
        userType: 'Cliente pós-reunião',
        stage: 'Pós-reunião'
      },
      isActive: true,
      usage: 234,
      effectiveness: 73
    }
  ],
  'reactivation': [
    {
      id: '6',
      name: 'Reativação de Cliente',
      content: 'Sentimos sua falta! Que tal reagendarmos uma conversa? Temos novidades que podem interessar você.',
      category: 'Reativação',
      conditions: {
        userType: 'Cliente inativo',
        stage: 'Reativação'
      },
      isActive: false,
      usage: 67,
      effectiveness: 45
    }
  ]
};

const MessagesHybridDesign = () => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingMessage, setEditingMessage] = useState<AIMessage | null>(null);

  const handleCardClick = (message: AIMessage) => {
    setEditingMessage({ ...message });
    setIsEditDialogOpen(true);
  };

  const handleSave = () => {
    if (editingMessage) {
      // Aqui você implementaria a lógica de salvamento
      console.log('Salvando mensagem:', editingMessage);
      setIsEditDialogOpen(false);
      setEditingMessage(null);
    }
  };

  const handleCancel = () => {
    setIsEditDialogOpen(false);
    setEditingMessage(null);
  };

  // cores e UI da timeline e do diálogo são tratados nos componentes extraídos



  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
            Mensagens da IA
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Gerencie as mensagens que a IA utiliza em diferentes etapas do funil
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <MessageSquare className="h-4 w-4 mr-2" />
          Nova Mensagem
        </Button>
      </div>

      <StageTimeline stages={schedulingStages as SchedulingStage[]} messagesByStage={mockMessagesByStage} onSelectMessage={handleCardClick} />
      <MessageEditDialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} message={editingMessage} onChange={(msg) => setEditingMessage(msg)} onSave={handleSave} onCancel={handleCancel} />
    </div>
  );
};

export default MessagesHybridDesign;