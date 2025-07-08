'use client';

import { useState, useMemo } from 'react';
import { useEpisodicMemory } from '@/hooks/useEpisodicMemory';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon, Clock, Star, StarOff } from 'lucide-react';
import { cn } from '@/lib/utils';

// Tipos
interface EpisodicMemoryViewerProps {
  sessionId: string;
  autoRefresh?: boolean;
}

interface Memory {
  id: number;
  message: string;
  memory_type: string;
  created_at: string;
  importance: number;
  entities?: Array<{ name: string }>;
  context?: Record<string, any>;
}

interface TimelineEvent {
  id: number;
  date: string;
  description: string;
  details?: Record<string, any>;
}

interface GroupedTimelineDay {
  date: string;
  formattedDate: string;
  events: TimelineEvent[];
}

// Componente para exibir um item de memória
function MemoryItem({ memory, onToggleImportance }: { memory: Memory; onToggleImportance: (id: number, importance: number) => void }) {
  return (
    <Card className={cn(
      'mb-4 transition-all duration-200',
      memory.importance >= 4 ? 'border-amber-400 dark:border-amber-500' : ''
    )}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-base">
              {memory.memory_type === 'episodic' ? 'Memória Episódica' : 'Mensagem'}
            </CardTitle>
            <CardDescription className="text-xs">
              {format(new Date(memory.created_at), 'dd MMM yyyy HH:mm:ss', { locale: ptBR })}
            </CardDescription>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => onToggleImportance(memory.id, memory.importance)}
            title={memory.importance >= 4 ? "Remover importância" : "Marcar como importante"}
          >
            {memory.importance >= 4 ? 
              <Star className="h-4 w-4 text-amber-500" /> : 
              <StarOff className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm whitespace-pre-wrap">{memory.message}</p>
        
        {memory.entities && memory.entities.length > 0 && (
          <div className="mt-2">
            <p className="text-xs text-muted-foreground mb-1">Entidades:</p>
            <div className="flex flex-wrap gap-1">
              {memory.entities.map((entity, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {entity.name}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      {memory.context && Object.keys(memory.context).length > 0 && (
        <CardFooter className="pt-0">
          <div className="w-full">
            <p className="text-xs text-muted-foreground mb-1">Contexto:</p>
            <div className="text-xs bg-muted p-2 rounded-md">
              <pre className="whitespace-pre-wrap">
                {JSON.stringify(memory.context, null, 2)}
              </pre>
            </div>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}

// Componente para exibir um item da linha do tempo
function TimelineItem({ day }: { day: GroupedTimelineDay }) {
  return (
    <div className="mb-8">
      <div className="sticky top-0 bg-background z-10 py-2">
        <h3 className="text-lg font-medium flex items-center">
          <CalendarIcon className="mr-2 h-5 w-5" />
          {day.formattedDate}
        </h3>
      </div>
      
      <div className="ml-6 border-l pl-6 pt-2">
        {day.events.map((event) => (
          <div key={`${event.id}-${event.date}`} className="mb-4 relative">
            <div className="absolute -left-9 mt-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
              <Clock className="h-3 w-3 text-primary-foreground" />
            </div>
            
            <div className="flex flex-col">
              <span className="text-sm font-medium">
                {format(new Date(event.date), 'HH:mm', { locale: ptBR })}
              </span>
              <p className="text-sm mt-1">{event.description}</p>
              
              {event.details && (
                <div className="mt-1 text-xs text-muted-foreground bg-muted p-2 rounded-md">
                  <pre className="whitespace-pre-wrap">
                    {JSON.stringify(event.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Componente para exibir a linha do tempo
function TimelineTab({ loading, groupedTimeline }: { loading: boolean; groupedTimeline: GroupedTimelineDay[] }) {
  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-24 w-full" />
          </div>
        ))}
      </div>
    );
  }
  
  if (groupedTimeline.length === 0) {
    return (
      <p className="text-center py-8 text-muted-foreground">
        Nenhum evento na linha do tempo para exibir.
      </p>
    );
  }
  
  return (
    <div className="space-y-2">
      {groupedTimeline.map((day) => (
        <TimelineItem key={day.date} day={day} />
      ))}
    </div>
  );
}

// Componente para exibir a lista de memórias
function MemoriesTab({ 
  loading, 
  memories, 
  onToggleImportance 
}: { 
  loading: boolean; 
  memories: Memory[]; 
  onToggleImportance: (id: number, importance: number) => void 
}) {
  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }
  
  if (memories.length === 0) {
    return (
      <p className="text-center py-8 text-muted-foreground">
        Nenhuma memória episódica encontrada.
      </p>
    );
  }
  
  return (
    <div className="space-y-2">
      {memories.map((memory) => (
        <MemoryItem 
          key={memory.id} 
          memory={memory} 
          onToggleImportance={onToggleImportance} 
        />
      ))}
    </div>
  );
}

// Componente para o seletor de data
function DateSelector({ 
  label, 
  date, 
  onSelect 
}: { 
  label: string; 
  date: Date | undefined; 
  onSelect: (date: Date | undefined) => void 
}) {
  return (
    <div className="flex-1">
      <p className="text-sm mb-2">{label}</p>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start text-left font-normal"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? (
              format(date, 'dd/MM/yyyy', { locale: ptBR })
            ) : (
              <span>Selecione uma data</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={date}
            onSelect={onSelect}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

// Componente para a busca por período
function PeriodSearchTab({ 
  startDate, 
  setStartDate, 
  endDate, 
  setEndDate, 
  isSearching, 
  periodMemories, 
  onSearch, 
  onToggleImportance 
}: { 
  startDate: Date | undefined; 
  setStartDate: (date: Date | undefined) => void; 
  endDate: Date | undefined; 
  setEndDate: (date: Date | undefined) => void; 
  isSearching: boolean; 
  periodMemories: Memory[]; 
  onSearch: () => void; 
  onToggleImportance: (id: number, importance: number) => void 
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <DateSelector 
          label="Data inicial" 
          date={startDate} 
          onSelect={setStartDate} 
        />
        
        <DateSelector 
          label="Data final" 
          date={endDate} 
          onSelect={setEndDate} 
        />
        
        <div className="flex items-end">
          <Button 
            onClick={onSearch} 
            disabled={!startDate || !endDate || isSearching}
          >
            {isSearching ? 'Buscando...' : 'Buscar'}
          </Button>
        </div>
      </div>
      
      {isSearching ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : periodMemories.length > 0 ? (
        <div className="space-y-2">
          {periodMemories.map((memory) => (
            <MemoryItem 
              key={memory.id} 
              memory={memory} 
              onToggleImportance={onToggleImportance} 
            />
          ))}
        </div>
      ) : (
        <p className="text-center py-8 text-muted-foreground">
          {startDate && endDate ? 
            'Nenhuma memória encontrada para o período selecionado.' : 
            'Selecione um período para buscar memórias.'}
        </p>
      )}
    </div>
  );
}

// Componente principal
export function EpisodicMemoryViewer({ sessionId, autoRefresh = false }: EpisodicMemoryViewerProps) {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [isSearching, setIsSearching] = useState(false);
  const [periodMemories, setPeriodMemories] = useState<Memory[]>([]);

  const {
    memories,
    timeline,
    loading,
    error,
    refresh,
    getMemoriesByPeriod,
    updateImportance,
  } = useEpisodicMemory({
    sessionId,
    autoRefresh,
  });

  // Agrupar memórias por data para exibição na linha do tempo
  const groupedTimeline = useMemo(() => {
    const groups: Record<string, TimelineEvent[]> = {};
    
    timeline.forEach(item => {
      const date = format(new Date(item.date), 'yyyy-MM-dd');
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(item);
    });
    
    return Object.entries(groups).map(([date, events]) => ({
      date,
      formattedDate: format(new Date(date), 'dd MMM yyyy', { locale: ptBR }),
      events: events.sort((a, b) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }),
    }));
  }, [timeline]);

  // Buscar memórias por período
  const handleSearchByPeriod = async () => {
    if (!startDate || !endDate) return;
    
    setIsSearching(true);
    try {
      const formattedStartDate = format(startDate, 'yyyy-MM-dd');
      const formattedEndDate = format(endDate, 'yyyy-MM-dd');
      
      const results = await getMemoriesByPeriod(formattedStartDate, formattedEndDate);
      setPeriodMemories(results);
    } catch (err) {
      console.error('Erro ao buscar por período:', err);
    } finally {
      setIsSearching(false);
    }
  };

  // Alternar importância da memória
  const handleToggleImportance = async (memoryId: number, currentImportance: number) => {
    const newImportance = currentImportance === 5 ? 1 : 5; // Alternar entre 1 e 5
    await updateImportance(memoryId, newImportance);
  };

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Erro ao carregar memórias</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">{error.message}</p>
          <Button onClick={refresh} className="mt-4">
            Tentar novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Memória Episódica</CardTitle>
        <CardDescription>
          Visualize a memória episódica e a linha do tempo dos eventos
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="timeline">
          <TabsList className="mb-4">
            <TabsTrigger value="timeline">Linha do Tempo</TabsTrigger>
            <TabsTrigger value="memories">Memórias</TabsTrigger>
            <TabsTrigger value="period">Busca por Período</TabsTrigger>
          </TabsList>
          
          {/* Tab de Linha do Tempo */}
          <TabsContent value="timeline">
            <TimelineTab 
              loading={loading} 
              groupedTimeline={groupedTimeline} 
            />
          </TabsContent>
          
          {/* Tab de Memórias */}
          <TabsContent value="memories">
            <MemoriesTab 
              loading={loading} 
              memories={memories} 
              onToggleImportance={handleToggleImportance} 
            />
          </TabsContent>
          
          {/* Tab de Busca por Período */}
          <TabsContent value="period">
            <PeriodSearchTab 
              startDate={startDate}
              setStartDate={setStartDate}
              endDate={endDate}
              setEndDate={setEndDate}
              isSearching={isSearching}
              periodMemories={periodMemories}
              onSearch={handleSearchByPeriod}
              onToggleImportance={handleToggleImportance}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}