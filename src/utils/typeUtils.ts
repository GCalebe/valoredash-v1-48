/**
 * Utility functions to handle type assertions from security hardening
 * These provide safe type conversions for unknown values
 */

export const asString = (value: unknown): string => {
  if (typeof value === 'string') return value;
  if (value === null || value === undefined) return '';
  return String(value);
};

export const asNumber = (value: unknown): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const num = Number(value);
    return isNaN(num) ? 0 : num;
  }
  return 0;
};

export const asBoolean = (value: unknown): boolean => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value === 'true';
  return Boolean(value);
};

export const asStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === 'string') return [value];
  return [];
};

export const asAny = (value: unknown): any => value;

export const safeGet = (obj: any, path: string, defaultValue: any = undefined): any => {
  try {
    return path.split('.').reduce((curr, key) => curr?.[key], obj) ?? defaultValue;
  } catch {
    return defaultValue;
  }
};

export const hasProperty = (obj: any, prop: string): boolean => {
  return obj && typeof obj === 'object' && prop in obj;
};

// Type assertion helpers for common patterns
export const asFormValue = (value: unknown): string | number | boolean | string[] => {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }
  return String(value || '');
};

export const asSelectValue = (value: unknown): string => {
  if (typeof value === 'string') return value;
  return String(value || '');
};

export const asInputValue = (value: unknown): string | number | readonly string[] => {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === 'string' || typeof value === 'number') return value;
  return String(value || '');
};