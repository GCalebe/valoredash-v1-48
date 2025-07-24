import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  MessageSquare,
  Edit,
  Trash2,
  Copy,
  Play,
  Pause,
  ArrowRight,
  Users,
  Target,
  Clock,
  CheckCircle,
  XCircle,
  Save,
  X
} from 'lucide-react';

interface MessageConditions {
  userType: string;
  stage: string;
}

interface AIMessage {
  id: string;
  name: string;
  content: string;
  category: string;
  conditions: MessageConditions;
  isActive: boolean;
  usage: number;
  effectiveness: number;
}

interface SchedulingStage {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

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
  const [selectedMessage, setSelectedMessage] = useState<AIMessage | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingMessage, setEditingMessage] = useState<AIMessage | null>(null);

  const handleCardClick = (message: AIMessage) => {
    setSelectedMessage(message);
    setEditingMessage({ ...message });
    setIsEditDialogOpen(true);
  };

  const handleSave = () => {
    if (editingMessage) {
      // Aqui você implementaria a lógica de salvamento
      console.log('Salvando mensagem:', editingMessage);
      setIsEditDialogOpen(false);
      setSelectedMessage(null);
      setEditingMessage(null);
    }
  };

  const handleCancel = () => {
    setIsEditDialogOpen(false);
    setSelectedMessage(null);
    setEditingMessage(null);
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'Lead': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'Prospect': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'Cliente': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'Ex-cliente': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    };
    return colors[category as keyof typeof colors] || colors['Lead'];
  };



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

      {/* Timeline Vertical */}
      <div className="relative">
        {/* Linha vertical central */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-300 dark:bg-gray-600"></div>
        
        <div className="space-y-12">
          {schedulingStages.map((stage, stageIndex) => {
            const messages = mockMessagesByStage[stage.id] || [];
            return (
              <div key={stage.id} className="relative">
                {/* Ícone da etapa na linha do tempo */}
                <div className={`absolute left-6 w-4 h-4 ${stage.color} rounded-full flex items-center justify-center text-white z-10`}>
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                
                {/* Conteúdo da etapa */}
                <div className="ml-16">
                  {/* Cabeçalho da etapa */}
                  <div className="mb-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-2 ${stage.color} rounded-lg text-white`}>
                        {stage.icon}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                          {stage.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {stage.description}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Cards das mensagens */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {messages.map((message) => (
                      <Card 
                        key={message.id} 
                        className="p-4 cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 border-l-4"
                        style={{ borderLeftColor: stage.color.replace('bg-', '#').replace('-500', '') }}
                        onClick={() => handleCardClick(message)}
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

                        <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-2 text-sm">
                          {message.name}
                        </h4>

                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                          {message.content}
                        </p>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge className={`text-xs ${getCategoryColor(message.category)}`}>
                              {message.category}
                            </Badge>
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
                    
                    {/* Card de exemplo vazio se não houver mensagens */}
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

      {/* Edit Dialog - Workflow Style */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Editar Mensagem - Fluxo Visual
            </DialogTitle>
          </DialogHeader>

          {editingMessage && (
            <div className="space-y-6">
              {/* Workflow Steps */}
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      1
                    </div>
                    <span className="font-medium">Configuração</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      2
                    </div>
                    <span className="font-medium">Condições</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      3
                    </div>
                    <span className="font-medium">Ativação</span>
                  </div>
                </div>
              </div>

              {/* Step 1: Configuration */}
              <div className="border rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    1
                  </div>
                  <h4 className="font-semibold text-gray-800 dark:text-gray-100">
                    Configuração da Mensagem
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Nome da Mensagem</label>
                    <Input
                      value={editingMessage.name}
                      onChange={(e) => setEditingMessage({
                        ...editingMessage,
                        name: e.target.value
                      })}
                      placeholder="Digite o nome da mensagem"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Categoria</label>
                    <Select
                      value={editingMessage.category}
                      onValueChange={(value) => setEditingMessage({
                        ...editingMessage,
                        category: value
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Lead">Lead</SelectItem>
                        <SelectItem value="Prospect">Prospect</SelectItem>
                        <SelectItem value="Cliente">Cliente</SelectItem>
                        <SelectItem value="Ex-cliente">Ex-cliente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium mb-2">Conteúdo da Mensagem</label>
                  <Textarea
                    value={editingMessage.content}
                    onChange={(e) => setEditingMessage({
                      ...editingMessage,
                      content: e.target.value
                    })}
                    placeholder="Digite o conteúdo da mensagem"
                    rows={4}
                  />
                </div>
              </div>

              {/* Step 2: Conditions */}
              <div className="border rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 bg-orange-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    2
                  </div>
                  <h4 className="font-semibold text-gray-800 dark:text-gray-100">
                    Condições de Uso
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Tipo de Usuário</label>
                    <Input
                      value={editingMessage.conditions.userType}
                      onChange={(e) => setEditingMessage({
                        ...editingMessage,
                        conditions: {
                          ...editingMessage.conditions,
                          userType: e.target.value
                        }
                      })}
                      placeholder="Ex: Novo usuário, Lead qualificado"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Estágio</label>
                    <Input
                      value={editingMessage.conditions.stage}
                      onChange={(e) => setEditingMessage({
                        ...editingMessage,
                        conditions: {
                          ...editingMessage.conditions,
                          stage: e.target.value
                        }
                      })}
                      placeholder="Ex: Primeiro contato, Negociação"
                    />
                  </div>

                </div>
              </div>

              {/* Step 3: Activation */}
              <div className="border rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    3
                  </div>
                  <h4 className="font-semibold text-gray-800 dark:text-gray-100">
                    Ativação e Métricas
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded">
                    <div>
                      <p className="font-medium">Status</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {editingMessage.isActive ? 'Ativa' : 'Inativa'}
                      </p>
                    </div>
                    <Switch
                      checked={editingMessage.isActive}
                      onCheckedChange={(checked) => setEditingMessage({
                        ...editingMessage,
                        isActive: checked
                      })}
                    />
                  </div>
                  
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded">
                    <p className="font-medium">Usos</p>
                    <p className="text-2xl font-bold text-blue-600">{editingMessage.usage}</p>
                  </div>
                  
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded">
                    <p className="font-medium">Eficácia</p>
                    <p className="text-2xl font-bold text-green-600">{editingMessage.effectiveness}%</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={handleCancel}>
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Alterações
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MessagesHybridDesign;