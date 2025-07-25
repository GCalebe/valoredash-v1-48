'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { RefreshCw, Brain, Clock, BookOpen } from 'lucide-react';
import { SemanticMemoryViewer } from '@/components/SemanticMemoryViewer';
import { EpisodicMemoryViewer } from '@/components/EpisodicMemoryViewer';
import { ContextualMemoryViewer } from '@/components/ContextualMemoryViewer';
import { MemoryNavigation } from '@/components/MemoryNavigation';

export default function MemoryDashboardPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar conversas existentes como sessões
  const loadSessions = async () => {
    try {
      setLoading(true);
      setError(null);

      // Buscar conversas existentes
      const { data, error } = await supabase
        .from('conversations')
        .select('id, name, session_id, created_at')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      // Mapear conversas para sessões
      const sessionData = data.map(conv => ({
        id: conv.session_id || conv.id,
        name: conv.name || `Conversa ${conv.id.substring(0, 8)}`,
        created_at: conv.created_at,
      }));

      setSessions(sessionData);

      // Selecionar a primeira sessão por padrão
      if (sessionData.length > 0 && !selectedSessionId) {
        setSelectedSessionId(sessionData[0].id);
      }
    } catch (err: unknown) {
      console.error('Erro ao carregar sessões:', err);
      setError(err.message || 'Erro ao carregar sessões');
    } finally {
      setLoading(false);
    }
  };

  // Carregar sessões ao montar o componente
  useEffect(() => {
    loadSessions();
  }, [, loadSessions]);

  return (
    <div className="container py-8">
      <MemoryNavigation />
      <div className="flex flex-col space-y-8">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold">Dashboard de Memória IA</h1>
          <p className="text-muted-foreground">
            Visualize e gerencie todos os tipos de memória da IA em um só lugar
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Selecionar Conversa</CardTitle>
                <CardDescription>
                  Escolha uma conversa para visualizar suas memórias
                </CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={loadSessions} 
                disabled={loading}
                title="Atualizar lista de conversas"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-10 w-full" />
            ) : error ? (
              <div className="text-destructive">{error}</div>
            ) : sessions.length > 0 ? (
              <Select
                value={selectedSessionId}
                onValueChange={setSelectedSessionId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma conversa" />
                </SelectTrigger>
                <SelectContent>
                  {sessions.map(session => (
                    <SelectItem key={session.id} value={session.id}>
                      {session.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-center py-4 text-muted-foreground">
                Nenhuma conversa encontrada.
              </p>
            )}
          </CardContent>
        </Card>

        {selectedSessionId && (
          <Tabs defaultValue="contextual" className="w-full">
            <TabsList className="grid grid-cols-3 mb-8">
              <TabsTrigger value="contextual" className="flex items-center">
                <Brain className="h-4 w-4 mr-2" />
                Contextual
              </TabsTrigger>
              <TabsTrigger value="semantic" className="flex items-center">
                <BookOpen className="h-4 w-4 mr-2" />
                Semântica
              </TabsTrigger>
              <TabsTrigger value="episodic" className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Episódica
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="contextual">
              <ContextualMemoryViewer 
                sessionId={selectedSessionId} 
                autoRefresh={false} 
              />
            </TabsContent>
            
            <TabsContent value="semantic">
              <SemanticMemoryViewer 
                sessionId={selectedSessionId} 
              />
            </TabsContent>
            
            <TabsContent value="episodic">
              <EpisodicMemoryViewer 
                sessionId={selectedSessionId} 
                autoRefresh={false} 
              />
            </TabsContent>
          </Tabs>
        )}

        <div className="text-center text-sm text-muted-foreground mt-8">
          <p>Sistema de Memória IA Otimizado</p>
          <p>Versão 2.0</p>
        </div>
      </div>
    </div>
  );
}