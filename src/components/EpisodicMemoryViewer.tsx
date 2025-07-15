'use client';

import { useState, useMemo } from 'react';
import { useEpisodicMemory } from '@/hooks/useEpisodicMemory';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Memory } from './memory/episodic/MemoryItem';
import type { TimelineEvent, GroupedTimelineDay } from './memory/episodic/TimelineItem';
import { TimelineTab } from './memory/episodic/TimelineTab';
import { MemoriesTab } from './memory/episodic/MemoriesTab';
import { PeriodSearchTab } from './memory/episodic/PeriodSearchTab';

// Tipos
interface EpisodicMemoryViewerProps {
  sessionId: string;
  autoRefresh?: boolean;
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
      // Convert EpisodicMemory to TimelineEvent format
      const timelineEvent: TimelineEvent = {
        id: item.id,
        date: item.date,
        description: item.description,
        details: item.details
      };
      
      const date = format(new Date(timelineEvent.date), 'yyyy-MM-dd');
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(timelineEvent);
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
      // Convert N8nChatMemory to Memory format
      const convertedResults: Memory[] = results.map(item => ({
        id: item.id,
        message: typeof item.message === 'string' ? item.message : JSON.stringify(item.message),
        memory_type: item.memory_type || 'episodic',
        created_at: item.created_at || new Date().toISOString(),
        importance: item.importance,
        entities: item.entities,
        context: item.context
      }));
      setPeriodMemories(convertedResults);
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

