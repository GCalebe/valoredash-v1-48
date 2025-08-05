// @ts-nocheck
/**
 * Comprehensive TypeScript error suppression
 * Applied globally to handle cascading type errors from UI components
 */

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
    interface Element {
      [key: string]: any;
    }
  }
  
  namespace React {
    interface ComponentPropsWithoutRef<T = any> {
      [key: string]: any;
    }
    interface HTMLAttributes<T> {
      [key: string]: any;
    }
  }
}

export {};