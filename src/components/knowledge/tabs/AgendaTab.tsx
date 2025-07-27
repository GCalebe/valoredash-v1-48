import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { AgendaForm } from './AgendaForm';
import { useHosts } from '@/hooks/useHosts';
import { useAgendas } from '@/hooks/useAgendas';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { Info, Edit, Trash2, Users, Calendar, Clock, Repeat } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";


export type AgendaCategory = 'consulta' | 'evento' | 'classes' | 'recorrente' | '';

type Reminder = {
  id: number;
  when: string;
  subject: string;
  sendTo: 'inscrito' | 'anfitriao';
  channel: 'email' | 'sms';
};

import { Agenda as SupabaseAgenda } from '@/hooks/useAgendas';

export type LocalAgenda = {
  id: string; // Alterado de number para string para manter consistência com Supabase
  title: string;
  description: string;
  category: AgendaCategory;
  host: string;
  duration: number;
  breakTime: number;
  availabilityInterval: number;
  operatingHours: string;
  minNotice: number;
  maxParticipants?: number;
  actionAfterRegistration: 'success_message' | 'redirect_url';
  successMessage?: string;
  redirectUrl?: string;
  sendReminders: boolean;
  reminders: Reminder[];
  serviceTypes: string[];
};

type Agenda = LocalAgenda;

// Mock data removed - now using Supabase data

const initialAgendaState: Omit<LocalAgenda, 'id'> = {
  title: '',
  description: '',
  category: '',
  host: '',
  availabilityInterval: 30,
  duration: 60,
  breakTime: 15,
  operatingHours: '09:00-18:00',
  minNotice: 24,
  serviceTypes: ['Online', 'Presencial'],
  actionAfterRegistration: 'success_message',
  successMessage: 'Obrigado por se inscrever!',
  redirectUrl: '',
  sendReminders: false,
  reminders: [],
};

export const categoryDetails = {
    consulta: {
        icon: Calendar,
        title: "Consulta",
        description: "Defina seu horário para receber seu convidado."
    },
    evento: {
        icon: Users,
        title: "Evento",
        description: "Defina data, hora e limite de inscrições e permita muitos convidados no mesmo horário."
    },
    classes: {
        icon: Clock,
        title: "Classes",
        description: "Defina seus horários e permita recorrência no mesmo horário para múltiplos convidados."
    },
    recorrente: {
        icon: Repeat,
        title: "Recorrente",
        description: "Defina seus horários e permita recorrência no mesmo horário para um único convidado."
    }
}

export const tooltipTexts = {
  title: "O titulo da agenda que será visivel para seus cliente",
  host: "Anfitriões são as pessoas responsáveis pela organização, execução e atendimento do agendamento. Por exemplo, se você estiver criando um calendário para uma clínica odontológica, o anfitrião será o dentista.",
  availabilityInterval: "Com esse recurso, você pode definir os intervalos de tempo que podem ser agendados, quanto menor o tempo, maior a quantidade de horários disponíveis. ex: o cliente pode marcar a cada 30 minutos.",
  duration: "A duração da sessão determina a duração de cada agendamento. Por exemplo, se você é cabeleireiro, é aqui que você determina quanto tempo leva para cortar o cabelo.",
  breakTime: "Defina um intervalo de tempo livre entre seus agendamentos. Você pode utilizar esse intervalo para descansar, se planejar.",
  operatingHours: "Especifique quais dias e horários da semana estarão disponíveis. O horário de abertura e fechamento do seu negócio.",
  availableDates: "Especifique quais meses e o intervalo de datas que estar�� com essa agenda disponível.",
};

export const InfoTooltip = ({ text }: { text: string }) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <Info className="h-5 w-5 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
      </TooltipTrigger>
      <TooltipContent 
        className="max-w-sm p-3 bg-background border z-[9999]" 
        side="top" 
        align="start"
        sideOffset={8}
        avoidCollisions={true}
        collisionPadding={16}
      >
        <p className="text-sm leading-relaxed text-foreground">{text}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

export const FormField = ({ label, tooltipText, children }: { label: string, tooltipText?: string, children: React.ReactNode }) => (
    <div className="space-y-3">
        <div className="flex items-center gap-2">
            <Label className="text-base font-semibold text-foreground">{label}</Label>
            {tooltipText && <InfoTooltip text={tooltipText} />}
        </div>
        <div className="w-full">{children}</div>
    </div>
);



const AgendaTab = () => {
  const { hosts, loading: hostsLoading } = useHosts();
  const { agendas: supabaseAgendas, agendasLoading, refetchAgendas, createAgenda, updateAgenda, deleteAgenda } = useAgendas();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAgenda, setEditingAgenda] = useState<LocalAgenda | null>(null);

  // Função para converter agenda do Supabase para formato local
  const convertSupabaseToLocal = (supabaseAgenda: SupabaseAgenda): LocalAgenda => {
    return {
      id: supabaseAgenda.id, // Mantém como string para evitar problemas de conversão
      title: supabaseAgenda.name,
      description: supabaseAgenda.description || '',
      category: (supabaseAgenda.category as AgendaCategory) || '',
      host: '', // Será preenchido com dados dos hosts
      duration: supabaseAgenda.duration_minutes,
      breakTime: supabaseAgenda.buffer_time_minutes,
      availabilityInterval: 30, // Valor padrão
      operatingHours: '09:00-18:00', // Valor padrão
      minNotice: 24, // Valor padrão
      maxParticipants: supabaseAgenda.max_participants || undefined,
      actionAfterRegistration: 'success_message',
      successMessage: 'Obrigado por se inscrever!',
      redirectUrl: '',
      sendReminders: false,
      reminders: [],
      serviceTypes: ['Online', 'Presencial'] // Default service types since service_types column doesn't exist yet
    };
  };

  // Usar dados do Supabase convertidos para formato local
  const displayAgendas = supabaseAgendas.map(convertSupabaseToLocal);

  const isLoading = agendasLoading || hostsLoading;

  

  const handleSave = async (agendaData: Omit<LocalAgenda, 'id'>) => {
    try {
      const agendaData = {
        name: currentAgenda.title,
        description: currentAgenda.description,
        category: currentAgenda.category,
        duration_minutes: currentAgenda.duration,
        buffer_time_minutes: currentAgenda.breakTime,
        max_participants: currentAgenda.maxParticipants || 1,
        price: null, // Será implementado futuramente
        requires_approval: false,
        cancellation_policy: null,
        preparation_notes: null,
        follow_up_notes: null,
        is_active: true,
        service_types: currentAgenda.serviceTypes
      };

      if (editingAgenda) {
        await updateAgenda(editingAgenda.id, agendaData);
      } else {
        await createAgenda(agendaData);
      }

      setIsDialogOpen(false);
      setEditingAgenda(null);

      
    } catch (error) {
      console.error('Erro ao salvar agenda:', error);
    }
  };
  
  const openDialog = () => {
    setEditingAgenda(null);
    setIsDialogOpen(true);
  };

    const handleEditAgenda = (agenda: LocalAgenda) => {
    setEditingAgenda(agenda);
    setIsDialogOpen(true);
  };

  const handleDeleteAgenda = async (agendaId: string | number) => {
     if (window.confirm('Tem certeza que deseja excluir esta agenda?')) {
       try {
         // Encontrar a agenda original do Supabase para pegar o ID correto
         const supabaseAgenda = supabaseAgendas.find(sa => parseInt(sa.id) === agendaId);
         if (supabaseAgenda) {
           await deleteAgenda(supabaseAgenda.id);
         }
       } catch (error) {
         console.error('Erro ao deletar agenda:', error);
       }
     }
   };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Controle de Agenda</h2>
          <p className="text-lg text-muted-foreground mt-1">Gerencie suas agendas e horários de atendimento</p>
        </div>
        <Button onClick={openDialog} size="lg" className="font-semibold">
          Criar Nova Agenda
        </Button>
        <AgendaForm 
          isOpen={isDialogOpen} 
          onOpenChange={setIsDialogOpen} 
          onSave={handleSave}
          editingAgenda={editingAgenda}
          hosts={hosts}
          hostsLoading={hostsLoading}
        />
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="flex flex-col justify-between bg-background border">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1">
                    <div className="h-6 bg-muted rounded animate-pulse mb-2"></div>
                    <div className="h-4 bg-muted rounded animate-pulse w-2/3"></div>
                  </div>
                  <div className="h-6 w-16 bg-muted rounded animate-pulse"></div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-4 bg-muted rounded animate-pulse mb-2"></div>
                <div className="h-4 bg-muted rounded animate-pulse w-3/4 mb-6"></div>
                <div className="flex items-center gap-6">
                  <div className="h-4 bg-muted rounded animate-pulse w-20"></div>
                  <div className="h-4 bg-muted rounded animate-pulse w-20"></div>
                </div>
              </CardContent>
              <CardFooter className="pt-4 flex justify-end gap-2 bg-muted/30 p-3 mt-4">
                <div className="h-8 w-8 bg-muted rounded animate-pulse"></div>
                <div className="h-8 flex-1 bg-muted rounded animate-pulse"></div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : displayAgendas.length === 0 ? (
        <div className="border-2 border-dashed border-muted rounded-xl p-12 text-center bg-background">
          <p className="text-lg text-muted-foreground">Nenhuma agenda criada ainda.</p>
          <p className="text-base text-muted-foreground mt-2">Clique em "Criar Nova Agenda" para começar.</p>
        </div>
      ) : (
        <div className="max-h-[800px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {displayAgendas.map((agenda) => (
            <Card key={agenda.id} className="flex flex-col justify-between bg-background border hover:shadow-md transition-shadow duration-200">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1"><CardTitle className="text-xl font-bold text-foreground">{agenda.title}</CardTitle><CardDescription className="text-base text-muted-foreground mt-1">{agenda.host}</CardDescription></div>
                  <Badge variant="secondary" className="text-sm px-3 py-1 font-medium">{agenda.category}</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-base text-muted-foreground leading-relaxed line-clamp-2 h-12">{agenda.description}</p>
                <div className="space-y-2 mt-6">
                  <div className="flex items-center gap-6 text-sm font-medium text-foreground">
                    <span className="flex items-center gap-1.5"><span className="text-muted-foreground">Duração:</span>{agenda.duration} min</span>
                    <span className="flex items-center gap-1.5"><span className="text-muted-foreground">Intervalo:</span>{agenda.breakTime} min</span>
                  </div>
                  <div className="flex items-center gap-6 text-sm font-medium text-foreground">
                    <span className="flex items-center gap-1.5">
                      <span className="text-muted-foreground">Preço:</span>
                      {(() => {
                        const supabaseAgenda = supabaseAgendas.find(sa => sa.id === agenda.id);
                        return supabaseAgenda?.price ? `R$ ${supabaseAgenda.price.toFixed(2)}` : '—';
                      })()}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="text-muted-foreground">Máx:</span>
                      {(() => {
                        const supabaseAgenda = supabaseAgendas.find(sa => sa.id === agenda.id);
                        return supabaseAgenda?.max_participants && supabaseAgenda.max_participants > 1 
                          ? `${supabaseAgenda.max_participants} pessoas` 
                          : '—';
                      })()}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-4 flex justify-end gap-2 bg-muted/30 p-3 mt-4">
                <Button 
                  variant="destructive" 
                  size="icon" 
                  className="bg-destructive/10 text-destructive hover:bg-destructive/20 border-0"
                  onClick={() => handleDeleteAgenda(agenda.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button 
                  variant="default" 
                  className="flex-1 font-semibold"
                  onClick={() => handleEditAgenda(agenda)}
                >
                  <Edit className="h-4 w-4 mr-2" />Editar Agenda
                </Button>
              </CardFooter>
            </Card>
          ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AgendaTab;