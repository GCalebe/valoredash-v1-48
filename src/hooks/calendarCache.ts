import { CalendarEvent } from "@/types/calendar";
import { format } from "date-fns";

const CACHE_PREFIX = "calendar-events";
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

type CachedMonthData = {
  fetchedAt: number;
  events: CalendarEvent[];
};

export function getCacheKey(date: Date): string {
  return `${CACHE_PREFIX}-${format(date, "yyyy-MM")}`;
}

export function loadFromCache(key: string): CalendarEvent[] | null {
  try {
    const item = localStorage.getItem(key);
    if (!item) return null;

    const data: CachedMonthData = JSON.parse(item);
    if (Date.now() - data.fetchedAt < CACHE_DURATION_MS) {
      console.log(`[cache] Eventos carregados do cache para a chave: ${key}`);
      return data.events;
    }
    
    console.log(`[cache] Cache expirado para a chave: ${key}`);
    localStorage.removeItem(key);
    return null;
  } catch (e) {
    console.error("[cache] Erro ao carregar eventos do cache:", e);
    return null;
  }
}

export function saveToCache(key: string, events: CalendarEvent[]) {
  try {
    const data: CachedMonthData = {
      fetchedAt: Date.now(),
      events,
    };
    localStorage.setItem(key, JSON.stringify(data));
    console.log(`[cache] Eventos salvos no cache para a chave: ${key}`);
  } catch (e) {
    console.error("[cache] Erro ao salvar eventos no cache:", e);
  }
}

export function clearCache() {
  try {
    Object.keys(localStorage)
      .filter((key) => key.startsWith(CACHE_PREFIX))
      .forEach((key) => localStorage.removeItem(key));
    console.log("[cache] Cache de eventos do calendário limpo.");
  } catch (e) {
    console.error("[cache] Erro ao limpar o cache do calendário:", e);
  }
}
