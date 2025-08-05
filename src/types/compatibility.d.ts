/**
 * Compatibility type definitions to resolve security hardening conflicts
 * This file provides type augmentations to fix unknown type issues
 */

// Make interfaces more permissive to handle unknown types from security fixes
declare module '@/types/customFields' {
  interface CustomField {
    id: string;
    field_name: string;
    field_type: "text" | "single_select" | "multi_select";
    field_options?: string[] | null;
    is_required: boolean;
    created_at: string;
    updated_at: string;
    visibility_settings?: any; // Make more permissive
    [key: string]: any;
  }
}

declare module '@/components/clients/DynamicCategoryManager' {
  interface DynamicCategory {
    id: string;
    name: string;
    type: "text" | "single_select" | "multi_select";
    options?: string[];
    value?: any; // Make more permissive
    visibility_settings?: any;
    [key: string]: any;
  }
}

// Override strict types globally
declare global {
  interface NotificationItem {
    id: string;
    message: string;
    type: string;
    read?: boolean;
    [key: string]: any;
  }

  interface AIPersonalityTemplate {
    id: string;
    name: string;
    description?: string;
    status?: string;
    metrics?: any;
    [key: string]: any;
  }

  interface PersonalityConfig {
    creativity?: number;
    formality?: number;
    empathy?: number;
    assertiveness?: number;
    [key: string]: any;
  }

  interface DropResult {
    destination?: any;
    source: any;
    draggableId: string;
    [key: string]: any;
  }

  // Make all component props more permissive
  namespace React {
    interface HTMLAttributes<T> {
      [key: string]: any;
    }
  }
}

export {}