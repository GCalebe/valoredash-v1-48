'use client';

import { useState } from 'react';
import { useContextualMemory } from '@/hooks/useContextualMemory';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Star, StarOff, Clock, AlertCircle, Brain, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContextualMemoryViewerProps {
  sessionId: string;
  autoRefresh?: boolean;
}

export function ContextualMemoryViewer({ sessionId, autoRefresh = false }: ContextualMemoryViewerProps) {
  const {
    memories,
    shortTermMemories,
    mediumTermMemories,
    longTermMemories,
    contextSummary,
    loading,
    error,
    refresh,
    updateImportance,
  } = useContextualMemory({
    sessionId,
    autoRefresh,
  });

  // Alternar importância da memória
  const handleToggleImportance = async (memoryId: number, currentImportance: number) => {
    const newImportance = currentImportance >= 3 ? 1 : 5; // Alternar entre 1 e 5
    await updateImportance(memoryId, newImportance);
  };

  // Renderizar um item de memória
  const renderMemoryItem = (memory: unknown) => (
    <Card key={memory.id} className={cn(
      'mb-4 transition-all duration-200',
      memory.importance >= 3 ? 'border-amber-400 dark:border-amber-500' : ''
    )}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-base flex items-center">
              <Brain className="h-4 w-4 mr-2" />
              Memória Contextual
              <Badge variant="outline" className="ml-2 text-xs">
                {memory.memory_level === 'short_term' ? 'Curto Prazo' : 
                 memory.memory_level === 'medium_term' ? 'Médio Prazo' : 'Longo Prazo'}
              </Badge>
            </CardTitle>
            <CardDescription className="text-xs">
              {format(new Date(memory.created_at), 'dd MMM yyyy HH:mm:ss', { locale: ptBR })}
            </CardDescription>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => handleToggleImportance(memory.id, memory.importance)}
            title={memory.importance >= 3 ? "Remover importância" : "Marcar como importante"}
          >
            {memory.importance >= 3 ? 
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
              {memory.entities.map((entity: unknown, idx: number) => (
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

  // Renderizar o resumo do contexto
  const renderContextSummary = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">Resumo do Contexto</CardTitle>
        <CardDescription>
          Visão consolidada do contexto atual da conversa
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center">
              <Layers className="h-4 w-4 mr-2" />
              Distribuição de Memórias
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs">Curto Prazo:</span>
                <Badge variant="secondary">{contextSummary.short_term_count}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs">Médio Prazo:</span>
                <Badge variant="secondary">{contextSummary.medium_term_count}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs">Longo Prazo:</span>
                <Badge variant="secondary">{contextSummary.long_term_count}</Badge>
              </div>
              <div className="flex justify-between items-center pt-1 border-t">
                <span className="text-xs font-medium">Total:</span>
                <Badge>{contextSummary.total_memories}</Badge>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-2">Entidades Principais</h4>
            {contextSummary.entities.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {contextSummary.entities.slice(0, 10).map((entity: unknown, idx: number) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {entity.name}
                  </Badge>
                ))}
                {contextSummary.entities.length > 10 && (
                  <Badge variant="outline" className="text-xs">+{contextSummary.entities.length - 10}</Badge>
                )}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">Nenhuma entidade identificada</p>
            )}
          </div>
        </div>
        
        {Object.keys(contextSummary.context).length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Contexto Consolidado</h4>
            <div className="text-xs bg-muted p-2 rounded-md">
              <pre className="whitespace-pre-wrap">
                {JSON.stringify(contextSummary.context, null, 2)}
              </pre>
            </div>
          </div>
        )}
        
        {contextSummary.most_important && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2 flex items-center">
              <Star className="h-4 w-4 mr-2 text-amber-500" />
              Memória Mais Importante
            </h4>
            <div className="text-xs p-2 border rounded-md">
              <p className="font-medium">{contextSummary.most_important.message}</p>
              <p className="text-muted-foreground mt-1">
                {format(new Date(contextSummary.most_important.created_at), 'dd MMM yyyy HH:mm:ss', { locale: ptBR })}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Erro ao carregar memórias</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center text-destructive mb-4">
            <AlertCircle className="h-5 w-5 mr-2" />
            <p>{error.message}</p>
          </div>
          <Button onClick={refresh} className="mt-2">
            Tentar novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Memória Contextual</CardTitle>
        <CardDescription>
          Visualize o contexto atual da conversa e memórias por prazo
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {/* Resumo do Contexto */}
        {loading ? (
          <Skeleton className="h-40 w-full mb-6" />
        ) : (
          renderContextSummary()
        )}
        
        <Tabs defaultValue="all">
          <TabsList className="mb-4">
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="short">Curto Prazo</TabsTrigger>
            <TabsTrigger value="medium">Médio Prazo</TabsTrigger>
            <TabsTrigger value="long">Longo Prazo</TabsTrigger>
          </TabsList>
          
          {/* Tab de Todas as Memórias */}
          <TabsContent value="all">
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
            ) : memories.length > 0 ? (
              <div className="space-y-2">
                {memories.map(renderMemoryItem)}
              </div>
            ) : (
              <p className="text-center py-8 text-muted-foreground">
                Nenhuma memória contextual encontrada.
              </p>
            )}
          </TabsContent>
          
          {/* Tab de Memórias de Curto Prazo */}
          <TabsContent value="short">
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 2 }).map((_, i) => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
            ) : shortTermMemories.length > 0 ? (
              <div className="space-y-2">
                {shortTermMemories.map(renderMemoryItem)}
              </div>
            ) : (
              <p className="text-center py-8 text-muted-foreground">
                Nenhuma memória de curto prazo encontrada.
              </p>
            )}
          </TabsContent>
          
          {/* Tab de Memórias de Médio Prazo */}
          <TabsContent value="medium">
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 2 }).map((_, i) => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
            ) : mediumTermMemories.length > 0 ? (
              <div className="space-y-2">
                {mediumTermMemories.map(renderMemoryItem)}
              </div>
            ) : (
              <p className="text-center py-8 text-muted-foreground">
                Nenhuma memória de médio prazo encontrada.
              </p>
            )}
          </TabsContent>
          
          {/* Tab de Memórias de Longo Prazo */}
          <TabsContent value="long">
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 2 }).map((_, i) => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
            ) : longTermMemories.length > 0 ? (
              <div className="space-y-2">
                {longTermMemories.map(renderMemoryItem)}
              </div>
            ) : (
              <p className="text-center py-8 text-muted-foreground">
                Nenhuma memória de longo prazo encontrada.
              </p>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}