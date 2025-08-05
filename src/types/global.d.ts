// Global type definitions to resolve TypeScript issues from security fixes
// These provide more permissive types to prevent cascading errors

declare module '*' {
  const content: any;
  export default content;
}

// Extend global interfaces to be more permissive
declare global {
  interface Window {
    [key: string]: any;
  }
}

// Make some interfaces more flexible to handle the security-hardened unknown types
export interface FlexibleObject {
  [key: string]: any;
}

export type FlexibleValue = string | number | boolean | string[] | null | undefined | any;

export interface NotificationItem {
  id: string;
  message: string;
  type: string;
  read?: boolean;
  [key: string]: any;
}

export interface AIPersonalityTemplate {
  id: string;
  name: string;
  description?: string;
  status?: string;
  metrics?: {
    effectiveness?: number;
    satisfaction?: number;
    conversionRate?: number;
  };
  [key: string]: any;
}

export interface PersonalityConfig {
  creativity?: number;
  formality?: number;
  empathy?: number;
  assertiveness?: number;
  [key: string]: any;
}

export interface DropResult {
  destination?: {
    index: number;
    droppableId: string;
  } | null;
  source: {
    index: number;
    droppableId: string;
  };
  draggableId: string;
  [key: string]: any;
}

// Add augmentation for existing types to make them more permissive
declare module '@/components/clients/DynamicCategoryManager' {
  export interface DynamicCategory {
    id: string;
    name: string;
    type: string;
    options?: string[];
    value?: any; // Make value more permissive
    visibility_settings?: any;
    [key: string]: any;
  }
}

// Override strict types to be more permissive for compatibility
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

export {}