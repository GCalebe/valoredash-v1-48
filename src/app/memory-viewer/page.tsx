'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { MemoryNavigation } from '@/components/MemoryNavigation';

interface Session {
  id: string;
  name: string;
  client_name: string;
}

/**
 * Página para visualização de memória - Simplificada durante unificação
 */
export default function MemoryViewerPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSessions() {
      try {
        setLoading(true);
        
        // Buscar sessões das conversas
        const { data, error } = await supabase
          .from('conversations')
          .select('id, name, session_id')
          .limit(10);

        if (error) throw error;

        const formattedSessions: Session[] = (data || []).map((conv) => ({
          id: conv.id,
          name: conv.name || `Conversa ${conv.id.substring(0, 8)}`,
          client_name: 'Cliente',
        }));

        setSessions(formattedSessions);
        setError(null);
      } catch (err) {
        console.error('Erro ao carregar sessões:', err);
        setError('Falha ao carregar sessões.');
      } finally {
        setLoading(false);
      }
    }

    loadSessions();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Carregando...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <MemoryNavigation />
      <h1 className="text-2xl font-bold mb-6">Visualizador de Memória</h1>
      <div className="p-8 text-center bg-muted rounded-lg">
        <p className="text-lg">Funcionalidade temporariamente desabilitada durante unificação das tabelas.</p>
        <p className="mt-2 text-muted-foreground">
          Esta funcionalidade será reativada nas próximas fases.
        </p>
      </div>
    </div>
  );
}