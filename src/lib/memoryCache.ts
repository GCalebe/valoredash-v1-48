/**
 * Sistema de cache em memória para otimização do serviço de memória da IA
 * 
 * Este módulo implementa um sistema de cache em memória para reduzir consultas
 * repetidas ao banco de dados e melhorar a performance do sistema de memória.
 */

import { logger } from '../utils/logger';

interface CacheOptions {
  /** Tempo de vida em milissegundos */
  ttl?: number;
  /** Tamanho máximo do cache (número de itens) */
  maxSize?: number;
  /** Nome do cache para logs */
  name?: string;
}

interface CacheStats {
  /** Número total de acessos ao cache */
  accesses: number;
  /** Número de acertos no cache */
  hits: number;
  /** Número de erros no cache */
  misses: number;
  /** Taxa de acertos (hits/accesses) */
  hitRate: number;
  /** Número de itens atualmente no cache */
  size: number;
  /** Número de itens expirados removidos */
  evictions: number;
}

/**
 * Classe que implementa um cache em memória com TTL e limite de tamanho
 */
export class MemoryCache<T = unknown> {
  private data: Map<string, T>;
  private ttls: Map<string, number>;
  private lastAccess: Map<string, number>;
  private readonly options: Required<CacheOptions>;
  private stats: CacheStats;

  /**
   * Cria uma nova instância de cache em memória
   * @param options Opções de configuração do cache
   */
  constructor(options: CacheOptions = {}) {
    this.data = new Map<string, T>();
    this.ttls = new Map<string, number>();
    this.lastAccess = new Map<string, number>();
    this.options = {
      ttl: options.ttl ?? 5 * 60 * 1000, // 5 minutos por padrão
      maxSize: options.maxSize ?? 1000, // 1000 itens por padrão
      name: options.name ?? 'memory-cache',
    };
    this.stats = {
      accesses: 0,
      hits: 0,
      misses: 0,
      hitRate: 0,
      size: 0,
      evictions: 0,
    };

    // Iniciar limpeza periódica de itens expirados
    this.startCleanupInterval();
  }

  /**
   * Obtém um item do cache
   * @param key Chave do item
   * @returns O item ou undefined se não encontrado ou expirado
   */
  get(key: string): T | undefined {
    this.stats.accesses++;
    
    // Verificar se o item existe
    if (!this.data.has(key)) {
      this.stats.misses++;
      this.updateHitRate();
      return undefined;
    }

    // Verificar se o item expirou
    if (this.isExpired(key)) {
      this.delete(key);
      this.stats.misses++;
      this.updateHitRate();
      return undefined;
    }

    // Atualizar último acesso
    this.lastAccess.set(key, Date.now());
    
    // Registrar acerto
    this.stats.hits++;
    this.updateHitRate();
    
    return this.data.get(key);
  }

  /**
   * Armazena um item no cache
   * @param key Chave do item
   * @param value Valor a ser armazenado
   * @param ttl Tempo de vida em milissegundos (opcional, usa o padrão se não informado)
   */
  set(key: string, value: T, ttl?: number): void {
    // Verificar se o cache está cheio e remover itens se necessário
    if (this.data.size >= this.options.maxSize && !this.data.has(key)) {
      this.evictLeastRecentlyUsed();
    }

    // Armazenar o item
    this.data.set(key, value);
    this.ttls.set(key, Date.now() + (ttl ?? this.options.ttl));
    this.lastAccess.set(key, Date.now());
    this.stats.size = this.data.size;

    logger.debug(`[${this.options.name}] Item adicionado ao cache: ${key}`);
  }

  /**
   * Remove um item do cache
   * @param key Chave do item a ser removido
   * @returns true se o item foi removido, false se não existia
   */
  delete(key: string): boolean {
    const existed = this.data.delete(key);
    this.ttls.delete(key);
    this.lastAccess.delete(key);
    this.stats.size = this.data.size;

    if (existed) {
      logger.debug(`[${this.options.name}] Item removido do cache: ${key}`);
    }

    return existed;
  }

  /**
   * Limpa todo o cache
   */
  clear(): void {
    this.data.clear();
    this.ttls.clear();
    this.lastAccess.clear();
    this.stats.size = 0;
    logger.debug(`[${this.options.name}] Cache limpo`);
  }

  /**
   * Verifica se um item expirou
   * @param key Chave do item
   * @returns true se o item expirou, false caso contrário
   */
  private isExpired(key: string): boolean {
    const expiry = this.ttls.get(key);
    return expiry !== undefined && expiry < Date.now();
  }

  /**
   * Remove o item menos recentemente acessado
   */
  private evictLeastRecentlyUsed(): void {
    if (this.data.size === 0) return;

    let oldestKey: string | null = null;
    let oldestAccess = Infinity;

    // Encontrar o item menos recentemente acessado
    for (const [key, lastAccess] of this.lastAccess.entries()) {
      if (lastAccess < oldestAccess) {
        oldestAccess = lastAccess;
        oldestKey = key;
      }
    }

    // Remover o item
    if (oldestKey) {
      this.delete(oldestKey);
      this.stats.evictions++;
      logger.debug(`[${this.options.name}] Item removido por política LRU: ${oldestKey}`);
    }
  }

  /**
   * Inicia um intervalo para limpar itens expirados periodicamente
   */
  private startCleanupInterval(): void {
    const cleanupInterval = Math.min(this.options.ttl / 2, 60 * 1000); // Metade do TTL ou 1 minuto, o que for menor

    setInterval(() => {
      this.cleanupExpired();
    }, cleanupInterval);

    logger.debug(`[${this.options.name}] Limpeza periódica iniciada (intervalo: ${cleanupInterval}ms)`);
  }

  /**
   * Remove todos os itens expirados do cache
   */
  private cleanupExpired(): void {
    const now = Date.now();
    let expiredCount = 0;

    for (const [key, expiry] of this.ttls.entries()) {
      if (expiry < now) {
        this.delete(key);
        expiredCount++;
        this.stats.evictions++;
      }
    }

    if (expiredCount > 0) {
      logger.debug(`[${this.options.name}] ${expiredCount} itens expirados removidos`);
    }
  }

  /**
   * Atualiza a taxa de acertos do cache
   */
  private updateHitRate(): void {
    this.stats.hitRate = this.stats.accesses > 0 
      ? this.stats.hits / this.stats.accesses 
      : 0;
  }

  /**
   * Obtém estatísticas do cache
   * @returns Estatísticas atuais do cache
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Obtém o número de itens no cache
   * @returns Número de itens no cache
   */
  size(): number {
    return this.data.size;
  }

  /**
   * Verifica se uma chave existe no cache (mesmo que expirada)
   * @param key Chave a verificar
   * @returns true se a chave existe, false caso contrário
   */
  has(key: string): boolean {
    return this.data.has(key);
  }

  /**
   * Obtém todas as chaves no cache
   * @returns Array com todas as chaves
   */
  keys(): string[] {
    return Array.from(this.data.keys());
  }
}

/**
 * Cache global para memórias
 * Uso: import { memoryCache } from './memoryCache';
 */
export const memoryCache = new MemoryCache<unknown>({
  name: 'memory-service-cache',
  ttl: 10 * 60 * 1000, // 10 minutos
  maxSize: 2000,
});