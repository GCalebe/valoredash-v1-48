
import { supabase } from "@/integrations/supabase/client";
import {
  N8nChatMemory,
  MemoryType,
  MemoryLevel,
  SemanticEntity,
  EntityRelationship,
} from "@/types/memory";

/**
 * Serviço para gerenciar a memória da IA
 * Este serviço fornece métodos para armazenar, recuperar e gerenciar diferentes tipos de memória
 */
export const memoryService = {
  /**
   * Armazena uma nova memória no banco de dados
   */
  storeMemory: async (
    memory: Omit<N8nChatMemory, "id">,
  ): Promise<N8nChatMemory | null> => {
    try {
      // Garantir que created_at seja definido
      if (!memory.created_at) {
        memory.created_at = new Date().toISOString();
      }

      // Convert arrays to JSON for database storage
      const memoryData = {
        ...memory,
        entities: memory.entities ? JSON.stringify(memory.entities) : null,
        relationships: memory.relationships ? JSON.stringify(memory.relationships) : null,
        context: memory.context ? JSON.stringify(memory.context) : null,
        metadata: memory.metadata ? JSON.stringify(memory.metadata) : null,
      };

      const { data, error } = await supabase
        .from("n8n_chat_memory")
        .insert(memoryData)
        .select()
        .single();

      if (error) {
        console.error("Erro ao armazenar memória:", error);
        return null;
      }

      // Convert JSON back to objects for return
      return {
        ...data,
        entities: data.entities ? JSON.parse(data.entities as string) : undefined,
        relationships: data.relationships ? JSON.parse(data.relationships as string) : undefined,
        context: data.context ? JSON.parse(data.context as string) : undefined,
        metadata: data.metadata ? JSON.parse(data.metadata as string) : undefined,
      } as N8nChatMemory;
    } catch (error) {
      console.error("Erro ao armazenar memória:", error);
      return null;
    }
  },

  /**
   * Recupera memórias por tipo e sessão
   */
  getMemoriesByType: async (
    sessionId: string,
    memoryType: MemoryType,
    limit = 50,
  ): Promise<N8nChatMemory[]> => {
    try {
      const { data, error } = await supabase
        .from("n8n_chat_memory")
        .select("*")
        .eq("session_id", sessionId)
        .eq("memory_type", memoryType)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) {
        console.error("Erro ao recuperar memórias:", error);
        return [];
      }

      // Convert JSON strings back to objects
      return data.map(item => ({
        ...item,
        entities: item.entities ? JSON.parse(item.entities as string) : undefined,
        relationships: item.relationships ? JSON.parse(item.relationships as string) : undefined,
        context: item.context ? JSON.parse(item.context as string) : undefined,
        metadata: item.metadata ? JSON.parse(item.metadata as string) : undefined,
      })) as N8nChatMemory[];
    } catch (error) {
      console.error("Erro ao recuperar memórias:", error);
      return [];
    }
  },

  /**
   * Recupera memórias por nível (curto, médio ou longo prazo)
   */
  getMemoriesByLevel: async (
    sessionId: string,
    memoryLevel: MemoryLevel,
    limit = 50,
  ): Promise<N8nChatMemory[]> => {
    try {
      const { data, error } = await supabase
        .from("n8n_chat_memory")
        .select("*")
        .eq("session_id", sessionId)
        .eq("memory_level", memoryLevel)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) {
        console.error("Erro ao recuperar memórias:", error);
        return [];
      }

      // Convert JSON strings back to objects
      return data.map(item => ({
        ...item,
        entities: item.entities ? JSON.parse(item.entities as string) : undefined,
        relationships: item.relationships ? JSON.parse(item.relationships as string) : undefined,
        context: item.context ? JSON.parse(item.context as string) : undefined,
        metadata: item.metadata ? JSON.parse(item.metadata as string) : undefined,
      })) as N8nChatMemory[];
    } catch (error) {
      console.error("Erro ao recuperar memórias:", error);
      return [];
    }
  },

  /**
   * Recupera memórias por importância (1-10)
   */
  getMemoriesByImportance: async (
    sessionId: string,
    minImportance = 5,
    limit = 50,
  ): Promise<N8nChatMemory[]> => {
    try {
      const { data, error } = await supabase
        .from("n8n_chat_memory")
        .select("*")
        .eq("session_id", sessionId)
        .gte("importance", minImportance)
        .order("importance", { ascending: false })
        .limit(limit);

      if (error) {
        console.error("Erro ao recuperar memórias por importância:", error);
        return [];
      }

      // Convert JSON strings back to objects
      return data.map(item => ({
        ...item,
        entities: item.entities ? JSON.parse(item.entities as string) : undefined,
        relationships: item.relationships ? JSON.parse(item.relationships as string) : undefined,
        context: item.context ? JSON.parse(item.context as string) : undefined,
        metadata: item.metadata ? JSON.parse(item.metadata as string) : undefined,
      })) as N8nChatMemory[];
    } catch (error) {
      console.error("Erro ao recuperar memórias por importância:", error);
      return [];
    }
  },

  /**
   * Busca memórias por entidades mencionadas
   */
  searchMemoriesByEntity: async (
    sessionId: string,
    entityName: string,
    limit = 50,
  ): Promise<N8nChatMemory[]> => {
    try {
      // Using JSON search with text matching for PostgreSQL
      const { data, error } = await supabase
        .from("n8n_chat_memory")
        .select("*")
        .eq("session_id", sessionId)
        .textSearch("entities", `"${entityName}"`)
        .limit(limit);

      if (error) {
        console.error("Erro ao buscar memórias por entidade:", error);
        return [];
      }

      // Convert JSON strings back to objects
      return data.map(item => ({
        ...item,
        entities: item.entities ? JSON.parse(item.entities as string) : undefined,
        relationships: item.relationships ? JSON.parse(item.relationships as string) : undefined,
        context: item.context ? JSON.parse(item.context as string) : undefined,
        metadata: item.metadata ? JSON.parse(item.metadata as string) : undefined,
      })) as N8nChatMemory[];
    } catch (error) {
      console.error("Erro ao buscar memórias por entidade:", error);
      return [];
    }
  },

  /**
   * Atualiza a importância de uma memória
   */
  updateMemoryImportance: async (
    memoryId: number,
    importance: number,
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("n8n_chat_memory")
        .update({ importance })
        .eq("id", memoryId);

      if (error) {
        console.error("Erro ao atualizar importância da memória:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Erro ao atualizar importância da memória:", error);
      return false;
    }
  },

  /**
   * Remove memórias expiradas
   */
  removeExpiredMemories: async (): Promise<boolean> => {
    try {
      const now = new Date().toISOString();
      const { error } = await supabase
        .from("n8n_chat_memory")
        .delete()
        .lt("expiration_date", now);

      if (error) {
        console.error("Erro ao remover memórias expiradas:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Erro ao remover memórias expiradas:", error);
      return false;
    }
  },

  /**
   * Recupera o histórico de chat completo para compatibilidade com o código existente
   */
  fetchChatHistory: async (sessionId: string): Promise<N8nChatMemory[]> => {
    try {
      const { data, error } = await supabase
        .from("n8n_chat_memory")
        .select("*")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Erro ao recuperar histórico de chat:", error);
        return [];
      }

      // Convert JSON strings back to objects
      return data.map(item => ({
        ...item,
        entities: item.entities ? JSON.parse(item.entities as string) : undefined,
        relationships: item.relationships ? JSON.parse(item.relationships as string) : undefined,
        context: item.context ? JSON.parse(item.context as string) : undefined,
        metadata: item.metadata ? JSON.parse(item.metadata as string) : undefined,
      })) as N8nChatMemory[];
    } catch (error) {
      console.error("Erro ao recuperar histórico de chat:", error);
      return [];
    }
  },

  /**
   * Insere uma nova mensagem de chat (compatibilidade com código existente)
   */
  insertChatMessage: async (
    sessionId: string,
    message: any,
  ): Promise<N8nChatMemory | null> => {
    try {
      const newMemory: Omit<N8nChatMemory, "id"> = {
        session_id: sessionId,
        message,
        created_at: new Date().toISOString(),
        memory_type: "contextual",
        memory_level: "short_term",
      };

      return await memoryService.storeMemory(newMemory);
    } catch (error) {
      console.error("Erro ao inserir mensagem de chat:", error);
      return null;
    }
  },
};
