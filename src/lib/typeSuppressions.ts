/**
 * Temporary type suppression utilities
 * These functions help handle the transition from security hardening unknown types
 */

// @ts-nocheck directives and utility functions for handling unknown types
export const suppressUnknownType = (value: unknown): any => value;

export const asString = (value: unknown): string => {
  if (value === null || value === undefined) return '';
  return String(value);
};

export const asArray = (value: unknown): any[] => {
  if (Array.isArray(value)) return value;
  return [];
};

export const asObject = (value: unknown): Record<string, any> => {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, any>;
  }
  return {};
};

export const hasProperty = (obj: any, key: string): boolean => {
  return obj && typeof obj === 'object' && key in obj;
};

export const safeAccess = (obj: any, key: string, defaultValue: any = undefined): any => {
  try {
    return obj?.[key] ?? defaultValue;
  } catch {
    return defaultValue;
  }
};

// Type assertion helpers for common patterns in the codebase
export const makeTypeSafe = {
  formValue: (value: unknown): any => value,
  inputValue: (value: unknown): any => value,
  selectValue: (value: unknown): string => asString(value),
  component: (value: unknown): any => value,
  props: (value: unknown): any => value,
};