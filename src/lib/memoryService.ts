
import { supabase } from "@/integrations/supabase/client";
import {
  N8nChatMemory,
  MemoryType,
  MemoryLevel,
  SemanticEntity,
  EntityRelationship,
} from "@/types/memory";
import { memoryCache } from "./memoryCache";
import { logger } from "@/utils/logger";

/**
 * Serviço para gerenciar a memória da IA
 * Este serviço fornece métodos para armazenar, recuperar e gerenciar diferentes tipos de memória
 */
export const memoryService = {
  /**
   * Armazena uma nova memória no banco de dados
   * @param memory Objeto de memória a ser armazenado
   * @param invalidateCache Se deve invalidar caches relacionados (padrão: true)
   */
  /**
   * Prepara os campos padrão para uma memória
   * @param memory Objeto de memória a ser preparado
   */
  _prepareMemoryDefaults: (memory: Omit<N8nChatMemory, "id">): Omit<N8nChatMemory, "id"> => {
    const preparedMemory = { ...memory };
    
    // Garantir que created_at seja definido
    if (!preparedMemory.created_at) {
      preparedMemory.created_at = new Date().toISOString();
    }
    
    // Garantir que campos opcionais tenham valores padrão
    if (!preparedMemory.memory_type) preparedMemory.memory_type = "contextual";
    if (!preparedMemory.memory_level) preparedMemory.memory_level = "short_term";
    if (!preparedMemory.importance) preparedMemory.importance = 5;
    
    // Definir data de expiração padrão se não fornecida
    if (!preparedMemory.expiration_date) {
      // Definir expiração com base no nível de memória
      const expirationDays = preparedMemory.memory_level === "short_term" ? 7 : 
                            preparedMemory.memory_level === "medium_term" ? 30 : 365;
      preparedMemory.expiration_date = new Date(Date.now() + expirationDays * 24 * 60 * 60 * 1000).toISOString();
    }
    
    return preparedMemory;
  },
  
  /**
   * Converte objetos para JSON para armazenamento no banco
   * @param memory Objeto de memória a ser convertido
   */
  _prepareMemoryForStorage: (memory: Omit<N8nChatMemory, "id">) => {
    return {
      ...memory,
      entities: memory.entities ? JSON.stringify(memory.entities) : null,
      relationships: memory.relationships ? JSON.stringify(memory.relationships) : null,
      context: memory.context ? JSON.stringify(memory.context) : null,
      metadata: memory.metadata ? JSON.stringify(memory.metadata) : null,
    };
  },
  
  /**
   * Converte dados do banco para objetos de memória
   * @param data Dados do banco a serem convertidos
   */
  _parseMemoryFromStorage: (data: any): N8nChatMemory => {
    return {
      ...data,
      entities: data.entities ? JSON.parse(data.entities as string) : undefined,
      relationships: data.relationships ? JSON.parse(data.relationships as string) : undefined,
      context: data.context ? JSON.parse(data.context as string) : undefined,
      metadata: data.metadata ? JSON.parse(data.metadata as string) : undefined,
    } as N8nChatMemory;
  },
  
  /**
   * Invalida caches relacionados à memória
   * @param memory Objeto de memória
   */
  _invalidateRelatedCaches: (memory: Omit<N8nChatMemory, "id">): number => {
    if (!memory.session_id) return 0;
    
    const cacheKeysToInvalidate = [];
    
    // Invalidar caches específicos com base no tipo de memória
    if (memory.memory_type) {
      cacheKeysToInvalidate.push(
        `memories:type:${memory.session_id}:${memory.memory_type}:`
      );
    }
    
    // Invalidar caches específicos com base no nível de memória
    if (memory.memory_level) {
      cacheKeysToInvalidate.push(
        `memories:level:${memory.session_id}:${memory.memory_level}:`
      );
    }
    
    // Invalidar caches de histórico se for memória contextual
    if (memory.memory_type === "contextual") {
      cacheKeysToInvalidate.push(
        `chat:history:${memory.session_id}:`
      );
    }
    
    // Invalidar caches que correspondem aos padrões
    let invalidatedCount = 0;
    for (const pattern of cacheKeysToInvalidate) {
      const matchingKeys = memoryCache.keys().filter(key => key.includes(pattern));
      for (const key of matchingKeys) {
        memoryCache.delete(key);
        invalidatedCount++;
      }
    }
    
    return invalidatedCount;
  },

  /**
   * Armazena uma nova memória no banco de dados
   * @param memory Objeto de memória a ser armazenado
   * @param invalidateCache Se deve invalidar caches relacionados (padrão: true)
   */
  storeMemory: async (
    memory: Omit<N8nChatMemory, "id">,
    invalidateCache = true
  ): Promise<N8nChatMemory | null> => {
    try {
      // Preparar memória com valores padrão
      const preparedMemory = memoryService._prepareMemoryDefaults(memory);
      
      // Converter objetos para JSON para armazenamento no banco
      const memoryData = memoryService._prepareMemoryForStorage(preparedMemory);

      // Inserir no banco de dados
      const { data, error } = await supabase
        .from("n8n_chat_memory")
        .insert(memoryData)
        .select()
        .single();

      if (error) {
        logger.error("Erro ao armazenar memória:", error);
        return null;
      }

      // Converter JSON de volta para objetos para retorno
      const result = memoryService._parseMemoryFromStorage(data);
      
      // Invalidar caches relacionados
      if (invalidateCache && preparedMemory.session_id) {
        const invalidatedCount = memoryService._invalidateRelatedCaches(preparedMemory);
        
        if (invalidatedCount > 0) {
          logger.debug(`Invalidados ${invalidatedCount} caches após armazenar nova memória para sessão ${preparedMemory.session_id}`);
        }
      }

      return result;
    } catch (error) {
      logger.error("Erro ao armazenar memória:", error);
      return null;
    }
  },

  /**
   * Recupera memórias por tipo e sessão
   * @param sessionId ID da sessão
   * @param memoryType Tipo de memória
   * @param limit Limite de resultados
   * @param useCache Se deve usar o cache (padrão: true)
   */
  getMemoriesByType: async (
    sessionId: string,
    memoryType: MemoryType,
    limit = 50,
    useCache = true
  ): Promise<N8nChatMemory[]> => {
    // Gerar chave de cache
    const cacheKey = `memories:type:${sessionId}:${memoryType}:${limit}`;
    
    // Verificar cache primeiro se habilitado
    if (useCache) {
      const cachedData = memoryCache.get(cacheKey);
      if (cachedData) {
        logger.debug(`Cache hit para memórias do tipo ${memoryType} da sessão ${sessionId}`);
        return cachedData;
      }
    }
    
    try {
      // Consulta otimizada selecionando apenas colunas necessárias
      const { data, error } = await supabase
        .from("n8n_chat_memory")
        .select("id, session_id, message, created_at, memory_type, memory_level, importance, entities, relationships, context, metadata")
        .eq("session_id", sessionId)
        .eq("memory_type", memoryType)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) {
        logger.error(`Erro ao recuperar memórias do tipo ${memoryType}:`, error);
        return [];
      }

      // Processamento otimizado dos resultados
      const result = data.map(item => ({
        ...item,
        entities: item.entities ? JSON.parse(item.entities as string) : undefined,
        relationships: item.relationships ? JSON.parse(item.relationships as string) : undefined,
        context: item.context ? JSON.parse(item.context as string) : undefined,
        metadata: item.metadata ? JSON.parse(item.metadata as string) : undefined,
      })) as N8nChatMemory[];
      
      // Armazenar em cache por 5 minutos se habilitado
      if (useCache) {
        memoryCache.set(cacheKey, result);
        logger.debug(`Armazenadas ${result.length} memórias no cache para ${cacheKey}`);
      }
      
      return result;
    } catch (error) {
      logger.error(`Erro ao recuperar memórias do tipo ${memoryType}:`, error);
      return [];
    }
  },

  /**
   * Recupera memórias por nível (curto, médio ou longo prazo)
   * @param sessionId ID da sessão
   * @param memoryLevel Nível de memória
   * @param limit Limite de resultados
   * @param useCache Se deve usar o cache (padrão: true)
   */
  getMemoriesByLevel: async (
    sessionId: string,
    memoryLevel: MemoryLevel,
    limit = 50,
    useCache = true
  ): Promise<N8nChatMemory[]> => {
    // Gerar chave de cache
    const cacheKey = `memories:level:${sessionId}:${memoryLevel}:${limit}`;
    
    // Verificar cache primeiro se habilitado
    if (useCache) {
      const cachedData = memoryCache.get(cacheKey);
      if (cachedData) {
        logger.debug(`Cache hit para memórias do nível ${memoryLevel} da sessão ${sessionId}`);
        return cachedData;
      }
    }
    
    try {
      // Consulta otimizada selecionando apenas colunas necessárias
      const { data, error } = await supabase
        .from("n8n_chat_memory")
        .select("id, session_id, message, created_at, memory_type, memory_level, importance, entities, relationships, context, metadata")
        .eq("session_id", sessionId)
        .eq("memory_level", memoryLevel)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) {
        logger.error(`Erro ao recuperar memórias do nível ${memoryLevel}:`, error);
        return [];
      }

      // Processamento otimizado dos resultados
      const result = data.map(item => ({
        ...item,
        entities: item.entities ? JSON.parse(item.entities as string) : undefined,
        relationships: item.relationships ? JSON.parse(item.relationships as string) : undefined,
        context: item.context ? JSON.parse(item.context as string) : undefined,
        metadata: item.metadata ? JSON.parse(item.metadata as string) : undefined,
      })) as N8nChatMemory[];
      
      // Armazenar em cache se habilitado
      if (useCache) {
        memoryCache.set(cacheKey, result);
        logger.debug(`Armazenadas ${result.length} memórias no cache para ${cacheKey}`);
      }
      
      return result;
    } catch (error) {
      logger.error(`Erro ao recuperar memórias do nível ${memoryLevel}:`, error);
      return [];
    }
  },

  /**
   * Recupera memórias por importância (1-10)
   * @param sessionId ID da sessão
   * @param minImportance Importância mínima (1-10)
   * @param limit Limite de resultados
   * @param useCache Se deve usar o cache (padrão: true)
   */
  getMemoriesByImportance: async (
    sessionId: string,
    minImportance = 5,
    limit = 50,
    useCache = true
  ): Promise<N8nChatMemory[]> => {
    // Gerar chave de cache
    const cacheKey = `memories:importance:${sessionId}:${minImportance}:${limit}`;
    
    // Verificar cache primeiro se habilitado
    if (useCache) {
      const cachedData = memoryCache.get(cacheKey);
      if (cachedData) {
        logger.debug(`Cache hit para memórias com importância >= ${minImportance} da sessão ${sessionId}`);
        return cachedData;
      }
    }
    
    try {
      // Consulta otimizada com índice em importance
      const { data, error } = await supabase
        .from("n8n_chat_memory")
        .select("id, session_id, message, created_at, memory_type, memory_level, importance, entities, relationships, context, metadata")
        .eq("session_id", sessionId)
        .gte("importance", minImportance)
        .order("importance", { ascending: false })
        .limit(limit);

      if (error) {
        logger.error(`Erro ao recuperar memórias por importância >= ${minImportance}:`, error);
        return [];
      }

      // Processamento otimizado dos resultados
      const result = data.map(item => ({
        ...item,
        entities: item.entities ? JSON.parse(item.entities as string) : undefined,
        relationships: item.relationships ? JSON.parse(item.relationships as string) : undefined,
        context: item.context ? JSON.parse(item.context as string) : undefined,
        metadata: item.metadata ? JSON.parse(item.metadata as string) : undefined,
      })) as N8nChatMemory[];
      
      // Armazenar em cache se habilitado
      if (useCache) {
        memoryCache.set(cacheKey, result);
        logger.debug(`Armazenadas ${result.length} memórias no cache para ${cacheKey}`);
      }
      
      return result;
    } catch (error) {
      logger.error(`Erro ao recuperar memórias por importância >= ${minImportance}:`, error);
      return [];
    }
  },

  /**
   * Busca memórias por entidades mencionadas
   * @param sessionId ID da sessão
   * @param entityName Nome da entidade
   * @param limit Limite de resultados
   * @param useCache Se deve usar o cache (padrão: true)
   */
  searchMemoriesByEntity: async (
    sessionId: string,
    entityName: string,
    limit = 50,
    useCache = true
  ): Promise<N8nChatMemory[]> => {
    // Gerar chave de cache
    const cacheKey = `memories:entity:${sessionId}:${entityName}:${limit}`;
    
    // Verificar cache primeiro se habilitado
    if (useCache) {
      const cachedData = memoryCache.get(cacheKey);
      if (cachedData) {
        logger.debug(`Cache hit para memórias com entidade "${entityName}" da sessão ${sessionId}`);
        return cachedData;
      }
    }
    
    try {
      // Usando GIN index para busca eficiente em JSON
      const { data, error } = await supabase
        .from("n8n_chat_memory")
        .select("id, session_id, message, created_at, memory_type, memory_level, importance, entities, relationships, context, metadata")
        .eq("session_id", sessionId)
        .textSearch("entities", `"${entityName}"`, { config: 'english' })
        .limit(limit);

      if (error) {
        logger.error(`Erro ao buscar memórias por entidade "${entityName}":`, error);
        return [];
      }

      // Processamento otimizado dos resultados
      const result = data.map(item => ({
        ...item,
        entities: item.entities ? JSON.parse(item.entities as string) : undefined,
        relationships: item.relationships ? JSON.parse(item.relationships as string) : undefined,
        context: item.context ? JSON.parse(item.context as string) : undefined,
        metadata: item.metadata ? JSON.parse(item.metadata as string) : undefined,
      })) as N8nChatMemory[];
      
      // Armazenar em cache se habilitado
      if (useCache) {
        memoryCache.set(cacheKey, result);
        logger.debug(`Armazenadas ${result.length} memórias no cache para ${cacheKey}`);
      }
      
      return result;
    } catch (error) {
      logger.error(`Erro ao buscar memórias por entidade "${entityName}":`, error);
      return [];
    }
  },
  
  /**
   * Busca memórias por similaridade semântica
   * @param sessionId ID da sessão
   * @param query Texto de consulta
   * @param limit Limite de resultados
   */
  searchMemoriesBySimilarity: async (
    sessionId: string,
    query: string,
    limit = 10
  ): Promise<N8nChatMemory[]> => {
    try {
      // Esta implementação depende de uma extensão de busca vetorial no PostgreSQL
      // como pg_vector ou uma implementação personalizada
      // Por enquanto, usamos uma busca textual simples como fallback
      
      // Extrair palavras-chave da consulta (remover stopwords)
      const keywords = query
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 3 && ![
          'como', 'qual', 'quem', 'onde', 'quando', 'porque', 'para', 'sobre',
          'with', 'what', 'when', 'where', 'which', 'who', 'whom', 'whose', 'why', 'how'
        ].includes(word));
      
      if (keywords.length === 0) {
        return [];
      }
      
      // Construir consulta de busca textual
      const searchQuery = keywords.join(' & ');
      
      const { data, error } = await supabase
        .from("n8n_chat_memory")
        .select("id, session_id, message, created_at, memory_type, memory_level, importance, entities, context, metadata")
        .eq("session_id", sessionId)
        .textSearch("message", searchQuery, { config: 'english' })
        .order("importance", { ascending: false })
        .limit(limit);

      if (error) {
        logger.error(`Erro na busca semântica para "${query}":`, error);
        return [];
      }

      // Processamento otimizado dos resultados
      return data.map(item => ({
        ...item,
        entities: item.entities ? JSON.parse(item.entities as string) : undefined,
        relationships: item.relationships ? JSON.parse(item.relationships as string) : undefined,
        context: item.context ? JSON.parse(item.context as string) : undefined,
        metadata: item.metadata ? JSON.parse(item.metadata as string) : undefined,
      })) as N8nChatMemory[];
    } catch (error) {
      logger.error(`Erro na busca semântica para "${query}":`, error);
      return [];
    }
  },
  
  /**
   * Limpa o cache de memória
   * @param pattern Padrão opcional para limpar apenas caches específicos
   */
  clearCache: (pattern?: string): number => {
    try {
      if (!pattern) {
        const count = memoryCache.size();
        memoryCache.clear();
        logger.debug(`Cache de memória completamente limpo (${count} itens)`);
        return count;
      }
      
      const keysToDelete = memoryCache.keys().filter(key => key.includes(pattern));
      for (const key of keysToDelete) {
        memoryCache.delete(key);
      }
      
      logger.debug(`Limpos ${keysToDelete.length} itens de cache correspondentes ao padrão "${pattern}"`);
      return keysToDelete.length;
    } catch (error) {
      logger.error(`Erro ao limpar cache de memória:`, error);
      return 0;
    }
  },

  /**
   * Atualiza a importância de uma memória
   * @param memoryId ID da memória
   * @param importance Novo valor de importância (1-10)
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
        logger.error(`Erro ao atualizar importância da memória ${memoryId}:`, error);
        return false;
      }

      // Invalidar caches relacionados à importância
      const cacheKeys = memoryCache.keys().filter(key => key.includes('memories:importance:'));
      for (const key of cacheKeys) {
        memoryCache.delete(key);
      }
      logger.debug(`Invalidados ${cacheKeys.length} caches de importância após atualização da memória ${memoryId}`);

      return true;
    } catch (error) {
      logger.error(`Erro ao atualizar importância da memória ${memoryId}:`, error);
      return false;
    }
  },

  /**
   * Remove memórias expiradas
   * @param forceCleanCache Se deve limpar o cache após a remoção (padrão: true)
   */
  removeExpiredMemories: async (forceCleanCache = true): Promise<boolean> => {
    try {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from("n8n_chat_memory")
        .delete()
        .lt("expiration_date", now)
        .select('session_id'); // Retorna as sessões afetadas para invalidação de cache

      if (error) {
        logger.error("Erro ao remover memórias expiradas:", error);
        return false;
      }

      // Invalidar caches para as sessões afetadas
      if (forceCleanCache && data && data.length > 0) {
        const affectedSessions = [...new Set(data.map(item => item.session_id))];
        let invalidatedCaches = 0;
        
        for (const sessionId of affectedSessions) {
          const sessionCacheKeys = memoryCache.keys().filter(key => key.includes(`:${sessionId}:`));
          for (const key of sessionCacheKeys) {
            memoryCache.delete(key);
            invalidatedCaches++;
          }
        }
        
        logger.debug(`Removidas memórias expiradas de ${affectedSessions.length} sessões, invalidados ${invalidatedCaches} caches`);
      }

      return true;
    } catch (error) {
      logger.error("Erro ao remover memórias expiradas:", error);
      return false;
    }
  },

  /**
   * Recupera o histórico de chat completo para compatibilidade com o código existente
   * @param sessionId ID da sessão
   * @param limit Limite de mensagens (padrão: 100)
   * @param page Página para paginação (padrão: 1)
   * @param useCache Se deve usar o cache (padrão: true)
   */
  fetchChatHistory: async (
    sessionId: string,
    limit = 100,
    page = 1,
    useCache = true
  ): Promise<N8nChatMemory[]> => {
    // Gerar chave de cache
    const cacheKey = `chat:history:${sessionId}:${limit}:${page}`;
    
    // Verificar cache primeiro se habilitado
    if (useCache) {
      const cachedData = memoryCache.get(cacheKey);
      if (cachedData) {
        logger.debug(`Cache hit para histórico de chat da sessão ${sessionId} (página ${page})`);
        return cachedData;
      }
    }
    
    try {
      // Calcular offset para paginação
      const offset = (page - 1) * limit;
      
      // Consulta otimizada com paginação
      const { data, error } = await supabase
        .from("n8n_chat_memory")
        .select("id, session_id, message, created_at, memory_type, memory_level, importance")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true })
        .range(offset, offset + limit - 1);

      if (error) {
        logger.error(`Erro ao recuperar histórico de chat da sessão ${sessionId}:`, error);
        return [];
      }

      // Processamento otimizado dos resultados
      const result = data.map(item => ({
        ...item,
        entities: item.entities ? JSON.parse(item.entities as string) : undefined,
        relationships: item.relationships ? JSON.parse(item.relationships as string) : undefined,
        context: item.context ? JSON.parse(item.context as string) : undefined,
        metadata: item.metadata ? JSON.parse(item.metadata as string) : undefined,
      })) as N8nChatMemory[];
      
      // Armazenar em cache se habilitado
      if (useCache) {
        memoryCache.set(cacheKey, result);
        logger.debug(`Armazenadas ${result.length} mensagens de chat no cache para ${cacheKey}`);
      }
      
      return result;
    } catch (error) {
      logger.error(`Erro ao recuperar histórico de chat da sessão ${sessionId}:`, error);
      return [];
    }
  },

  /**
   * Insere uma nova mensagem de chat (compatibilidade com código existente)
   * @param sessionId ID da sessão
   * @param message Mensagem a ser inserida
   * @param invalidateCache Se deve invalidar caches relacionados (padrão: true)
   */
  insertChatMessage: async (
    sessionId: string,
    message: any,
    invalidateCache = true
  ): Promise<N8nChatMemory | null> => {
    try {
      const newMemory: Omit<N8nChatMemory, "id"> = {
        session_id: sessionId,
        message,
        created_at: new Date().toISOString(),
        memory_type: "contextual",
        memory_level: "short_term",
        importance: 5, // Importância média por padrão
        expiration_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 dias por padrão
      };

      const result = await memoryService.storeMemory(newMemory);
      
      // Invalidar caches de histórico para esta sessão
      if (invalidateCache && result) {
        const historyCacheKeys = memoryCache.keys().filter(key => 
          key.startsWith(`chat:history:${sessionId}:`) || 
          key.startsWith(`memories:type:${sessionId}:contextual:`)
        );
        
        for (const key of historyCacheKeys) {
          memoryCache.delete(key);
        }
        
        logger.debug(`Invalidados ${historyCacheKeys.length} caches após inserção de nova mensagem na sessão ${sessionId}`);
      }

      return result;
    } catch (error) {
      logger.error(`Erro ao inserir mensagem de chat na sessão ${sessionId}:`, error);
      return null;
    }
  },
};
