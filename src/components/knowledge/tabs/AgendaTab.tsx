// @ts-nocheck
import React, { useState, useMemo, useEffect } from 'react';
import { AgendaForm } from './AgendaForm';
import { useHosts } from '@/hooks/useHosts';
import { useAgendas } from '@/hooks/useAgendas';
import AgendaHeader from '../agenda/AgendaHeader';
import AgendaHierarchicalView from '../agenda/AgendaHierarchicalView';
import { supabase } from '@/integrations/supabase/client';
import { saveAgendaWithRelations } from '../agenda/services/agendaPersistence';
import { toast } from '@/hooks/use-toast';
// Dialog UI imports removidos
import DeleteAgendaDialog from "../agenda/DeleteAgendaDialog";
import { Label } from '@/components/ui/label';
import { Info, Users, Calendar, Clock, Repeat } from 'lucide-react';
import AgendasGrid from "../agenda/AgendasGrid";
import AgendasGridSkeleton from "../agenda/AgendasGridSkeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
// Switch/Checkbox não usados aqui


// import duplicado removido
import { LocalAgenda, AgendaCategory } from "../agenda/types";
import { computeDisplayAgendas } from "../agenda/utils/displayAgendas";

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
  // Get current user ID for filtering agendas
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  // Get current user on component mount
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }
    };
    getCurrentUser();
  }, []);
  
  const { agendas: supabaseAgendas, agendasLoading, refetchAgendas, updateAgenda, deleteAgenda } = useAgendas(currentUserId || undefined);
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
    // Buscar anfitriões associados à agenda
    let hostIds: string[] = [];
    try {
      const { data: employeeAgendas } = await supabase
        .from('employee_agendas')
        .select('employee_id, employees(id, name)')
        .eq('agenda_id', supabaseAgenda.id)
        .order('priority', { ascending: true }); // Ordenar por prioridade para manter a ordem correta
      
      if (employeeAgendas && employeeAgendas.length > 0) {
        // Extrair IDs dos anfitriões associados
        hostIds = employeeAgendas
          .filter(ea => ea.employees) // Garantir que employees existe
          .map(ea => ea.employee_id);
      }
    } catch (error) {
      console.log('Erro ao buscar anfitriões associados à agenda:', error);
    }

    return {
      id: supabaseAgenda.id, // Mantém como string para evitar problemas de conversão
      title: supabaseAgenda.name,
      description: supabaseAgenda.description || '',
      category: (supabaseAgenda.category as AgendaCategory) || '',
      host: hostIds, // Agora é um array de IDs de anfitriões
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
      serviceTypes: supabaseAgenda.service_types || ['Online', 'Presencial']
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
  const displayAgendas = useMemo(() => computeDisplayAgendas(baseAgendas, searchTerm, sortBy, sortOrder), [baseAgendas, searchTerm, sortBy, sortOrder]);

  const isLoading = agendasLoading || hostsLoading;

  

  const handleSave = async (currentAgenda: Omit<LocalAgenda, 'id'>, reminders?: any[], operatingHours?: any, availableDates?: any) => {
    try {
      await saveAgendaWithRelations({
        currentAgenda,
        reminders,
        operatingHours,
        availableDates,
        editingAgenda,
        updateAgenda,
        refetchAgendas,
      });
      setIsDialogOpen(false);
      setEditingAgenda(null);
      toast({ title: 'Sucesso', description: 'Agenda salva com todos os dados configurados.', variant: 'default' });
    } catch (error) {
      console.error('Erro ao salvar agenda:', error);
      toast({ title: 'Erro', description: 'Não foi possível salvar a agenda.', variant: 'destructive' });
    }
  };
  
  // Handlers para o header
  const handleSortChange = (newSortBy: 'name' | 'date' | 'created_at', newSortOrder: 'asc' | 'desc') => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  };
  
  const handleImport = () => {
    // Placeholder de importação
    // eslint-disable-next-line no-console
    console.log('Importar agendas - funcionalidade em desenvolvimento');
  };
  
  const handleExport = () => {
    // Placeholder de exportação
    // eslint-disable-next-line no-console
    console.log('Exportar agendas - funcionalidade em desenvolvimento');
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

      {(() => {
        if (isLoading) {
          return <AgendasGridSkeleton />;
        }
        if (displayAgendas.length === 0) {
          return (
        <div className="border-2 border-dashed border-muted rounded-xl p-12 text-center bg-background">
          <p className="text-lg text-muted-foreground">Nenhuma agenda criada ainda.</p>
          <p className="text-base text-muted-foreground mt-2">Clique em "Criar Nova Agenda" para começar.</p>
        </div>
          );
        }
        if (viewMode === 'hierarchy') {
          return (
        <AgendaHierarchicalView
          agendas={displayAgendas}
          onEdit={handleEditAgenda}
          onDelete={handleDeleteAgenda}
          searchTerm={searchTerm}
          supabaseAgendas={supabaseAgendas}
        />
          );
        }
        return (
          <AgendasGrid
            agendas={displayAgendas}
            supabaseAgendas={supabaseAgendas}
            onEdit={handleEditAgenda}
            onDelete={handleDeleteAgenda}
          />
        );
                      })()}
      
      <DeleteAgendaDialog open={isDeleteDialogOpen} onOpenChange={(open) => { setIsDeleteDialogOpen(open); if (!open) setAgendaToDelete(null); }} onConfirm={confirmDeleteAgenda} />
    </div>
  );
};

export default AgendaTab;