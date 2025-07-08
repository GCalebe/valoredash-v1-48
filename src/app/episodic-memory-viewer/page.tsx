'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { EpisodicMemoryViewer } from '@/components/EpisodicMemoryViewer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { MemoryNavigation } from '@/components/MemoryNavigation';

export default function EpisodicMemoryViewerPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const supabase = createClientComponentClient();

  // Carregar sessões com memórias episódicas
  const loadSessions = async () => {
    try {
      setLoading(true);
      setError(null);

      // Buscar sessões que têm memórias episódicas
      const { data, error } = await supabase
        .from('n8n_chat_memory')
        .select('session_id, created_at')
        .eq('memory_type', 'episodic')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      // Agrupar por session_id e pegar a mais recente de cada
      const uniqueSessions = data.reduce((acc: any[], curr: any) => {
        const existingSession = acc.find(s => s.session_id === curr.session_id);
        if (!existingSession) {
          acc.push(curr);
        }
        return acc;
      }, []);

      // Buscar informações adicionais das sessões (nome do chat)
      if (uniqueSessions.length > 0) {
        const { data: chatsData, error: chatsError } = await supabase
          .from('n8n_chats')
          .select('id, name')
          .in(
            'id',
            uniqueSessions.map(s => s.session_id)
          );

        if (chatsError) throw chatsError;

        // Combinar dados
        const sessionsWithNames = uniqueSessions.map(session => {
          const chatInfo = chatsData.find((chat: any) => chat.id === session.session_id);
          return {
            id: session.session_id,
            name: chatInfo?.name || `Chat ${session.session_id.substring(0, 8)}`,
            created_at: session.created_at,
          };
        });

        setSessions(sessionsWithNames);

        // Selecionar a primeira sessão por padrão
        if (sessionsWithNames.length > 0 && !selectedSessionId) {
          setSelectedSessionId(sessionsWithNames[0].id);
        }
      } else {
        setSessions([]);
      }
    } catch (err: any) {
      console.error('Erro ao carregar sessões:', err);
      setError(err.message || 'Erro ao carregar sessões');
    } finally {
      setLoading(false);
    }
  };

  // Carregar sessões ao montar o componente
  useEffect(() => {
    loadSessions();
  }, []);

  return (
    <div className="container py-8">
      <MemoryNavigation />
      <div className="flex flex-col space-y-8">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold">Visualizador de Memória Episódica</h1>
          <p className="text-muted-foreground">
            Explore a linha do tempo e memórias episódicas das conversas
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Selecionar Conversa</CardTitle>
                <CardDescription>
                  Escolha uma conversa para visualizar suas memórias episódicas
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
                Nenhuma conversa com memórias episódicas encontrada.
              </p>
            )}
          </CardContent>
        </Card>

        {selectedSessionId && (
          <EpisodicMemoryViewer 
            sessionId={selectedSessionId} 
            autoRefresh={false} 
          />
        )}
      </div>
    </div>
  );
}