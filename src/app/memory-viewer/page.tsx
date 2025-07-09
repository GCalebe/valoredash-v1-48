'use client';

import { useState, useEffect } from 'react';
import { SemanticMemoryViewer } from '@/components/memory/SemanticMemoryViewer';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { MemoryNavigation } from '@/components/MemoryNavigation';

interface Session {
  id: string;
  name: string;
  client_name: string;
}

/**
 * Página para visualização de memória semântica
 */
export default function MemoryViewerPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar sessões disponíveis
  useEffect(() => {
    async function loadSessions() {
      try {
        setLoading(true);
        
        // Buscar sessões com memórias semânticas
        const { data, error } = await supabase
          .from('n8n_chat_memory')
          .select('session_id')
          .eq('memory_type', 'semantic')
          .order('created_at', { ascending: false })
          .limit(100);

        if (error) throw error;

        // Extrair IDs de sessão únicos
        const uniqueSessionIds = [...new Set(data.map(item => item.session_id))];

        if (uniqueSessionIds.length === 0) {
          setSessions([]);
          setLoading(false);
          return;
        }

        // Buscar detalhes das sessões usando a tabela conversations
        const { data: conversationsData, error: conversationsError } = await supabase
          .from('conversations')
          .select('id, name, client_name')
          .in('session_id', uniqueSessionIds);

        if (conversationsError) throw conversationsError;

        // Formatar dados para o tipo Session
        const formattedSessions: Session[] = conversationsData.map((conv) => ({
          id: conv.id,
          name: conv.name || `Conversa ${conv.id.substring(0, 8)}`,
          client_name: conv.client_name || 'Cliente desconhecido',
        }));

        setSessions(formattedSessions);
        
        // Selecionar primeira sessão por padrão
        if (formattedSessions.length > 0 && !selectedSessionId) {
          setSelectedSessionId(formattedSessions[0].id);
        }
        
        setError(null);
      } catch (err) {
        console.error('Erro ao carregar sessões:', err);
        setError('Falha ao carregar sessões. Por favor, tente novamente.');
      } finally {
        setLoading(false);
      }
    }

    loadSessions();
  }, [selectedSessionId]);

  // Renderizar estado de carregamento
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Carregando sessões...</span>
      </div>
    );
  }

  // Renderizar mensagem de erro
  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="p-4 bg-red-50 text-red-500 rounded-md">
          <p>{error}</p>
          <button
            className="mt-2 px-4 py-2 bg-primary text-white rounded-md"
            onClick={() => window.location.reload()}
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  // Renderizar mensagem de nenhuma sessão
  if (sessions.length === 0) {
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-2xl font-bold mb-4">Visualizador de Memória Semântica</h1>
        <div className="p-8 text-center bg-muted rounded-lg">
          <p className="text-lg">Nenhuma sessão com memória semântica encontrada.</p>
          <p className="mt-2 text-muted-foreground">
            Crie memórias semânticas em conversas para visualizá-las aqui.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <MemoryNavigation />
      <h1 className="text-2xl font-bold mb-6">Visualizador de Memória Semântica</h1>
      
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Selecione uma sessão:</label>
        <Select
          value={selectedSessionId}
          onValueChange={setSelectedSessionId}
        >
          <SelectTrigger className="w-full md:w-[400px]">
            <SelectValue placeholder="Selecione uma sessão" />
          </SelectTrigger>
          <SelectContent>
            {sessions.map((session) => (
              <SelectItem key={session.id} value={session.id}>
                {session.name} - {session.client_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {selectedSessionId ? (
        <SemanticMemoryViewer sessionId={selectedSessionId} />
      ) : (
        <div className="p-8 text-center bg-muted rounded-lg">
          <p>Selecione uma sessão para visualizar suas memórias semânticas.</p>
        </div>
      )}
      
      {/* Indicador de versão otimizada */}
      <div className="fixed bottom-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
        Versão Otimizada
      </div>
    </div>
  );
}