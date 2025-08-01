import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

interface UserSession {
  id: string;
  user_id: string;
  session_token: string;
  ip_address?: string;
  user_agent?: string;
  expires_at: string;
  created_at: string;
}

interface CreateSessionData {
  ip_address?: string;
  user_agent?: string;
  expires_in_hours?: number;
}

export function useUserSessions() {
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentSession, setCurrentSession] = useState<UserSession | null>(null);

  // Criar nova sessão
  const createSession = useCallback(async (data: CreateSessionData = {}) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const sessionToken = crypto.randomUUID();
      const expiresInHours = data.expires_in_hours || 24; // 24h por padrão
      const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);

      const sessionData = {
        user_id: user.id,
        session_token: sessionToken,
        ip_address: data.ip_address,
        user_agent: data.user_agent || navigator.userAgent,
        expires_at: expiresAt.toISOString()
      };

      const { data: newSession, error } = await supabase
        .from('user_sessions')
        .insert(sessionData)
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao criar sessão:', error);
        throw error;
      }

      console.log('✅ Nova sessão criada:', newSession.id);
      setCurrentSession(newSession);
      
      // Atualizar lista de sessões
      await fetchUserSessions();
      
      return { sessionToken, session: newSession, error: null };
    } catch (error) {
      console.error('❌ Erro ao criar sessão:', error);
      return { sessionToken: null, session: null, error };
    }
  }, []);

  // Buscar sessões do usuário
  const fetchUserSessions = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', user.id)
        .gt('expires_at', new Date().toISOString()) // Apenas sessões não expiradas
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erro ao buscar sessões:', error);
        return;
      }

      setSessions(data || []);
      console.log(`✅ ${data?.length || 0} sessões ativas encontradas`);
    } catch (error) {
      console.error('❌ Erro ao buscar sessões:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Invalidar sessão
  const invalidateSession = useCallback(async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('user_sessions')
        .update({ expires_at: new Date().toISOString() })
        .eq('id', sessionId);

      if (error) {
        console.error('❌ Erro ao invalidar sessão:', error);
        throw error;
      }

      console.log('✅ Sessão invalidada:', sessionId);
      
      // Atualizar lista de sessões
      await fetchUserSessions();
      
      // Se a sessão invalidada é a atual, limpar
      if (currentSession?.id === sessionId) {
        setCurrentSession(null);
      }
    } catch (error) {
      console.error('❌ Erro ao invalidar sessão:', error);
      throw error;
    }
  }, [currentSession, fetchUserSessions]);

  // Invalidar todas as sessões do usuário
  const invalidateAllSessions = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('user_sessions')
        .update({ expires_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .gt('expires_at', new Date().toISOString());

      if (error) {
        console.error('❌ Erro ao invalidar todas as sessões:', error);
        throw error;
      }

      console.log('✅ Todas as sessões foram invalidadas');
      setSessions([]);
      setCurrentSession(null);
    } catch (error) {
      console.error('❌ Erro ao invalidar todas as sessões:', error);
      throw error;
    }
  }, []);

  // Verificar se sessão é válida
  const validateSession = useCallback(async (sessionToken: string) => {
    try {
      const { data, error } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('session_token', sessionToken)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (error || !data) {
        console.log('❌ Sessão inválida ou expirada');
        return { valid: false, session: null };
      }

      console.log('✅ Sessão válida:', data.id);
      setCurrentSession(data);
      return { valid: true, session: data };
    } catch (error) {
      console.error('❌ Erro ao validar sessão:', error);
      return { valid: false, session: null };
    }
  }, []);

  // Limpar sessões expiradas
  const cleanupExpiredSessions = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('user_sessions')
        .delete()
        .eq('user_id', user.id)
        .lt('expires_at', new Date().toISOString());

      if (error) {
        console.error('❌ Erro ao limpar sessões expiradas:', error);
        return;
      }

      console.log('✅ Sessões expiradas removidas');
      await fetchUserSessions();
    } catch (error) {
      console.error('❌ Erro ao limpar sessões expiradas:', error);
    }
  }, [fetchUserSessions]);

  // Registrar atividade da sessão (atualizar last_activity se existir)
  const updateSessionActivity = useCallback(async (sessionId?: string) => {
    try {
      const targetSessionId = sessionId || currentSession?.id;
      if (!targetSessionId) return;

      // Como a tabela não tem last_activity, vamos apenas logar a atividade
      logger.debug('📊 Atividade registrada para sessão:', targetSessionId);
    } catch (error) {
      console.error('❌ Erro ao atualizar atividade da sessão:', error);
    }
  }, [currentSession]);

  // Carregar sessões ao montar o componente
  useEffect(() => {
    fetchUserSessions();
  }, [fetchUserSessions]);

  // Auto-criar sessão no login se não existir
  useEffect(() => {
    const handleAuthChange = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && !currentSession) {
        // Verificar se já existe uma sessão ativa
        const activeSessions = sessions.filter(s => new Date(s.expires_at) > new Date());
        if (activeSessions.length === 0) {
          // Criar nova sessão automaticamente
          await createSession({
            ip_address: await getClientIP(),
            user_agent: navigator.userAgent
          });
        } else {
          setCurrentSession(activeSessions[0]);
        }
      }
    };

    handleAuthChange();
  }, [sessions, currentSession, createSession]);

  return {
    sessions,
    loading,
    currentSession,
    createSession,
    fetchUserSessions,
    invalidateSession,
    invalidateAllSessions,
    validateSession,
    cleanupExpiredSessions,
    updateSessionActivity
  };
}

// Função auxiliar para obter IP do cliente (simplificada)
async function getClientIP(): Promise<string | undefined> {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.warn('Não foi possível obter IP do cliente:', error);
    return undefined;
  }
}

export type { UserSession, CreateSessionData };