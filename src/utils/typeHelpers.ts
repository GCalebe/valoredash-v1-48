/**
 * Temporary type helpers to handle unknown types during unification process
 * These should be removed once proper types are implemented throughout the codebase
 */

// Safe property access for unknown objects
export function safeGet<T = unknown>(obj: unknown, path: string, defaultValue?: T): T {
  if (!obj || typeof obj !== 'object') {
    return defaultValue as T;
  }
  
  const keys = path.split('.');
  let current: unknown = obj;
  
  for (const key of keys) {
    if (current == null || typeof current !== 'object' || !(key in current)) {
      return defaultValue as T;
    }
    current = current[key];
  }
  
  return current;
}

// Type assertion with fallback
export function asType<T>(value: unknown, fallback: T): T {
  return value as T ?? fallback;
}

// Safe array conversion
export function asArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) {
    return value as T[];
  }
  return [];
}

// Safe object conversion
export function asObject<T extends Record<string, unknown>>(value: unknown, fallback: Partial<T> = {}): T {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return { ...fallback, ...value } as T;
  }
  return fallback as T;
}

// Safe string conversion
export function asString(value: unknown, fallback = ''): string {
  if (typeof value === 'string') return value;
  if (value != null) return String(value);
  return fallback;
}

// Safe number conversion
export function asNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number') return value;
  const parsed = Number(value);
  return isNaN(parsed) ? fallback : parsed;
}

// Safe boolean conversion
export function asBoolean(value: unknown, fallback = false): boolean {
  if (typeof value === 'boolean') return value;
  return fallback;
}