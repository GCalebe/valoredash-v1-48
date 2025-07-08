import { CalendarEvent } from "@/types/calendar";

const CACHE_KEY = "calendar-events-cache";
const CACHE_DURATION_MS = 5 * 60 * 1000;

type CachedEventsData = {
  key: string;
  fetchedAt: number;
  events: CalendarEvent[];
};

export function getCacheKey(date?: Date, range?: { start: Date; end: Date }) {
  if (range) {
    return `range:${range.start.toISOString().slice(0, 10)}:${range.end
      .toISOString()
      .slice(0, 10)}`;
  }
  if (date) {
    return `date:${date.toISOString().slice(0, 10)}`;
  }
  return "today";
}

export function loadFromCache(key: string): CalendarEvent[] | null {
  try {
    const item = localStorage.getItem(CACHE_KEY);
    if (item) {
      const parsed: CachedEventsData[] = JSON.parse(item);
      const entry = parsed.find((d) => d.key === key);
      if (entry && Date.now() - entry.fetchedAt < CACHE_DURATION_MS) {
        return entry.events;
      }
    }
    return null;
  } catch (e) {
    console.error("[calendarCache] Erro ao carregar eventos do cache:", e);
    return null;
  }
}

export function saveToCache(key: string, events: CalendarEvent[]) {
  try {
    let arr: CachedEventsData[] = [];
    const item = localStorage.getItem(CACHE_KEY);
    if (item) arr = JSON.parse(item);
    arr = arr.filter((d) => d.key !== key);
    arr.unshift({
      key,
      events,
      fetchedAt: Date.now(),
    });
    if (arr.length > 5) arr = arr.slice(0, 5);
    localStorage.setItem(CACHE_KEY, JSON.stringify(arr));
  } catch (e) {
    console.error("[calendarCache] Erro ao salvar eventos no cache:", e);
  }
}
