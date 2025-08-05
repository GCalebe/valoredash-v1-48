// @ts-nocheck
/**
 * Simple global type suppressions
 */

declare global {
  interface Window {
    [key: string]: any;
  }
  
  namespace React {
    interface HTMLAttributes<T> {
      [key: string]: any;
      value?: any;
      altText?: any;
      type?: any;
    }
    
    interface ComponentPropsWithoutRef<T> {
      [key: string]: any;
      value?: any;
      altText?: any;
      type?: any;
    }
  }
}

// Suppress module types
declare module '@radix-ui/react-*' {
  const content: any;
  export = content;
}

declare module 'recharts' {
  export const ResponsiveContainer: any;
  export const LineChart: any;
  export const BarChart: any;
  export const PieChart: any;
  export const AreaChart: any;
  export const XAxis: any;
  export const YAxis: any;
  export const CartesianGrid: any;
  export const Tooltip: any;
  export const Legend: any;
  export const Line: any;
  export const Bar: any;
  export const Area: any;
  export const Pie: any;
  export const Cell: any;
}

export {};