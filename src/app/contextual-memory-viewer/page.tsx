'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ContextualMemoryViewer } from '@/components/ContextualMemoryViewer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { MemoryNavigation } from '@/components/MemoryNavigation';

export default function ContextualMemoryViewerPage() {
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
          <h1 className="text-3xl font-bold">Visualizador de Memória Contextual</h1>
          <p className="text-muted-foreground">
            Explore o contexto atual e memórias contextuais das conversas
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Selecionar Conversa</CardTitle>
                <CardDescription>
                  Escolha uma conversa para visualizar suas memórias contextuais
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
          <ContextualMemoryViewer 
            sessionId={selectedSessionId} 
            autoRefresh={false} 
          />
        )}
      </div>
    </div>
  );
}