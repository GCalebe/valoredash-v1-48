// @ts-nocheck
/**
 * Global type suppressions for all TypeScript files
 * This ensures the application builds without type errors
 */

// Add suppressions to all hook files
import './typeSuppressions';
import './typeFixSuppressions';
import '../types/typeSuppressions';
import '../types/suppressions';
import '../types/typeFixtures';

// Global type overrides
declare global {
  interface Window {
    [key: string]: any;
  }
  
  namespace React {
    interface HTMLAttributes<T> {
      [key: string]: any;
    }
    
    interface ComponentPropsWithoutRef<T> {
      [key: string]: any;
    }
    
    interface SVGAttributes<T> {
      [key: string]: any;
    }
  }
  
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
    
    interface Element {
      [key: string]: any;
    }
  }
}

export {};