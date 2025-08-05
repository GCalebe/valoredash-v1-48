// @ts-nocheck
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AgendaForm } from './AgendaForm';
import { useHosts } from '@/hooks/useHosts';
import { useAgendas } from '@/hooks/useAgendas';
import AgendaHeader from '../agenda/AgendaHeader';
import AgendaHierarchicalView from '../agenda/AgendaHierarchicalView';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
  
  // Estados para confirmação de exclusão
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [agendaToDelete, setAgendaToDelete] = useState<string | null>(null);
  
  // Estados para o header
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'created_at'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'grid' | 'hierarchy'>('grid');

  // Função para converter agenda do Supabase para formato local
  const convertSupabaseToLocal = async (supabaseAgenda: SupabaseAgenda): Promise<LocalAgenda> => {
    // Buscar anfitrião associado à agenda
    let hostId = '';
    try {
      const { data: employeeAgenda } = await supabase
        .from('employee_agendas')
        .select('employee_id')
        .eq('agenda_id', supabaseAgenda.id)
        .limit(1);
      
      if (employeeAgenda && employeeAgenda.length > 0) {
        hostId = employeeAgenda[0].employee_id;
      }
    } catch (error) {
      // Nenhum anfitrião associado à agenda
    }

    return {
      id: supabaseAgenda.id, // Mantém como string para evitar problemas de conversão
      title: supabaseAgenda.name,
      description: supabaseAgenda.description || '',
      category: (supabaseAgenda.category as AgendaCategory) || '',
      host: hostId, // Preenchido com o ID do anfitrião associado
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
  const [baseAgendas, setBaseAgendas] = useState<LocalAgenda[]>([]);
  
  // Carregar agendas com anfitriões associados
  useEffect(() => {
    const loadAgendasWithHosts = async () => {
      if (supabaseAgendas.length > 0) {
        const agendasWithHosts = await Promise.all(
          supabaseAgendas.map(agenda => convertSupabaseToLocal(agenda))
        );
        setBaseAgendas(agendasWithHosts);
      } else {
        setBaseAgendas([]);
      }
    };
    
    loadAgendasWithHosts();
  }, [supabaseAgendas]);
  
  // Filtrar e ordenar agendas
  const displayAgendas = useMemo(() => {
    let filtered = baseAgendas;
    
    // Aplicar filtro de busca
    if (searchTerm) {
      filtered = filtered.filter(agenda => 
        agenda.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agenda.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agenda.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Não há filtro de categoria específico aqui, mas pode ser adicionado futuramente
    
    // Aplicar ordenação
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'date':
          // Para agendas, vamos usar a data de criação como proxy
          comparison = a.id.localeCompare(b.id);
          break;
        case 'created_at':
          comparison = a.id.localeCompare(b.id);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    return filtered;
  }, [baseAgendas, searchTerm, sortBy, sortOrder]);

  const isLoading = agendasLoading || hostsLoading;

  

  const handleSave = async (currentAgenda: Omit<LocalAgenda, 'id'>, reminders?: any[], operatingHours?: any, availableDates?: any) => {
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

      let agendaId: string;

      if (editingAgenda) {
        await updateAgenda(editingAgenda.id, agendaData);
        agendaId = editingAgenda.id;
        
        // Remover dados antigos relacionados à agenda
        await Promise.all([
          supabase.from('employee_agendas').delete().eq('agenda_id', agendaId),
          supabase.from('agenda_reminders').delete().eq('agenda_id', agendaId),
          supabase.from('agenda_operating_hours').delete().eq('agenda_id', agendaId),
          supabase.from('agenda_available_dates').delete().eq('agenda_id', agendaId)
        ]);
      } else {
        const { data, error } = await supabase
          .from('agendas')
          .insert(agendaData)
          .select('id')
          .single();
        
        if (error || !data) {
          throw error;
        }
        agendaId = data.id;
      }

      // Associar anfitrião selecionado à agenda
      if (currentAgenda.host) {
        const { error: hostError } = await supabase
          .from('employee_agendas')
          .insert({
            employee_id: currentAgenda.host,
            agenda_id: agendaId
          });
        
        if (hostError) {
          console.error('Erro ao associar anfitrião:', hostError);
        }
      }

      // Salvar lembretes se fornecidos
      if (reminders && reminders.length > 0) {
        const reminderData = reminders.map(reminder => ({
          agenda_id: agendaId,
          reminder_type: reminder.channel || 'whatsapp',
          trigger_time_minutes: (reminder.days * 24 * 60) + (reminder.hours * 60) + reminder.minutes,
          message_template: reminder.subject,
          is_active: true,
          send_to_client: reminder.sendTo === 'inscrito',
          send_to_employee: reminder.sendTo === 'anfitriao'
        }));

        const { error: reminderError } = await supabase
          .from('agenda_reminders')
          .insert(reminderData);
        
        if (reminderError) {
          console.error('Erro ao salvar lembretes:', reminderError);
        }
      }

      // Salvar horários de funcionamento se fornecidos
      if (operatingHours) {
        const operatingHoursData: any[] = [];
        const dayMapping: { [key: string]: number } = {
          'Domingo': 0,
          'Segunda-Feira': 1,
          'Terça-Feira': 2,
          'Quarta-Feira': 3,
          'Quinta-Feira': 4,
          'Sexta-Feira': 5,
          'Sábado': 6
        };

        Object.entries(operatingHours).forEach(([dayName, hours]: [string, any]) => {
          if (Array.isArray(hours)) {
            hours.forEach((hour: any) => {
              operatingHoursData.push({
                agenda_id: agendaId,
                day_of_week: dayMapping[dayName],
                start_time: hour.start,
                end_time: hour.end,
                is_active: true
              });
            });
          }
        });

        if (operatingHoursData.length > 0) {
          const { error: operatingHoursError } = await supabase
            .from('agenda_operating_hours')
            .insert(operatingHoursData);
          
          if (operatingHoursError) {
            console.error('Erro ao salvar horários de funcionamento:', operatingHoursError);
          }
        }
      }

      // Salvar datas disponíveis se fornecidas
      if (availableDates) {
        const availableDatesData: any[] = [];
        const monthMapping: { [key: string]: number } = {
          'Janeiro': 1, 'Fevereiro': 2, 'Março': 3, 'Abril': 4,
          'Maio': 5, 'Junho': 6, 'Julho': 7, 'Agosto': 8,
          'Setembro': 9, 'Outubro': 10, 'Novembro': 11, 'Dezembro': 12
        };

        const currentYear = new Date().getFullYear();
        
        Object.entries(availableDates).forEach(([monthName, dates]: [string, any]) => {
          if (Array.isArray(dates)) {
            dates.forEach((dateRange: any) => {
              for (let day = dateRange.start; day <= dateRange.end; day++) {
                const date = new Date(currentYear, monthMapping[monthName] - 1, day);
                availableDatesData.push({
                  agenda_id: agendaId,
                  date: date.toISOString().split('T')[0],
                  is_available: true,
                  reason: null,
                  start_time: null,
                  end_time: null,
                  max_bookings: null
                });
              }
            });
          }
        });

        if (availableDatesData.length > 0) {
          const { error: availableDatesError } = await supabase
            .from('agenda_available_dates')
            .insert(availableDatesData);
          
          if (availableDatesError) {
            console.error('Erro ao salvar datas disponíveis:', availableDatesError);
          }
        }
      }

      setIsDialogOpen(false);
      setEditingAgenda(null);
      
      // Recarregar agendas para mostrar as mudanças
      await refetchAgendas();
      
      toast({
        title: "Sucesso",
        description: "Agenda salva com todos os dados configurados.",
        variant: "default"
      });
      
    } catch (error) {
      console.error('Erro ao salvar agenda:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a agenda.",
        variant: "destructive"
      });
    }
  };
  
  // Handlers para o header
  const handleSortChange = (newSortBy: 'name' | 'date' | 'created_at', newSortOrder: 'asc' | 'desc') => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  };
  
  const handleImport = () => {
    // TODO: Implementar importação
  };
  
  const handleExport = () => {
    // TODO: Implementar exportação
  };
  
  const openDialog = () => {
    setEditingAgenda(null);
    setIsDialogOpen(true);
  };

    const handleEditAgenda = (agenda: LocalAgenda) => {
    setEditingAgenda(agenda);
    setIsDialogOpen(true);
  };

  const handleDeleteAgenda = (agendaId: string | number) => {
     const agendaIdStr = agendaId.toString();
     setAgendaToDelete(agendaIdStr);
     setIsDeleteDialogOpen(true);
   };

   const confirmDeleteAgenda = async () => {
     if (!agendaToDelete) return;
     
     try {
       // Encontrar a agenda original do Supabase para pegar o ID correto
       const supabaseAgenda = supabaseAgendas.find(sa => sa.id === agendaToDelete);
       
       if (supabaseAgenda) {
         await deleteAgenda(supabaseAgenda.id);
       }
     } catch (error) {
       console.error('Erro na exclusão:', error);
     } finally {
       setIsDeleteDialogOpen(false);
       setAgendaToDelete(null);
     }
   };

  return (
    <div className="space-y-6">
      <AgendaHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onCreateNew={openDialog}
        onImport={handleImport}
        onExport={handleExport}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={handleSortChange}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        totalAgendas={baseAgendas.length}
        filteredAgendas={displayAgendas.length}
      />
      
      <AgendaForm 
        isOpen={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        onSave={handleSave}
        editingAgenda={editingAgenda}
        hosts={hosts}
        hostsLoading={hostsLoading}
      />

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
      ) : viewMode === "hierarchy" ? (
        <AgendaHierarchicalView
          agendas={displayAgendas}
          onEdit={handleEditAgenda}
          onDelete={handleDeleteAgenda}
          searchTerm={searchTerm}
          supabaseAgendas={supabaseAgendas}
        />
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
      
      {/* Diálogo de confirmação de exclusão */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A agenda será permanentemente removida do sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setIsDeleteDialogOpen(false);
              setAgendaToDelete(null);
            }}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteAgenda}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AgendaTab;