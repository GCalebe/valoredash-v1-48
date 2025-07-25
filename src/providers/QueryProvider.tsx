import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../lib/queryClient';

interface QueryProviderProps {
  children: React.ReactNode;
}

/**
 * Provider do React Query para gerenciamento de estado de servidor
 * 
 * Features:
 * - Cache inteligente configurado
 * - DevTools para desenvolvimento
 * - Error boundaries integrados
 * - Performance otimizada
 */
export const QueryProvider: React.FC<QueryProviderProps> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

/**
 * Hook para acessar o QueryClient em qualquer lugar da aplicação
 */
export { queryClient };

/**
 * Error Boundary específico para React Query
 */
export class QueryErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ComponentType<{ error: Error; resetError: () => void }> },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: unknown) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Query Error Boundary caught an error:', error, errorInfo);
    
    // Log para monitoramento em produção
    if (process.env.NODE_ENV === 'production') {
      // Aqui você pode integrar com serviços como Sentry
      console.error('Production Query Error:', {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
      });
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
    // Limpar cache corrompido se necessário
    queryClient.clear();
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback;
      
      if (FallbackComponent) {
        return <FallbackComponent error={this.state.error!} resetError={this.resetError} />;
      }
      
      return (
        <div className="flex flex-col items-center justify-center min-h-[200px] p-6 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-red-600 text-lg font-semibold mb-2">
            Erro no carregamento dos dados
          </div>
          <div className="text-red-500 text-sm mb-4 text-center">
            {this.state.error?.message || 'Ocorreu um erro inesperado'}
          </div>
          <button
            onClick={this.resetError}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Wrapper que combina QueryProvider com ErrorBoundary
 */
export const QueryProviderWithErrorBoundary: React.FC<QueryProviderProps> = ({ children }) => {
  return (
    <QueryErrorBoundary>
      <QueryProvider>
        {children}
      </QueryProvider>
    </QueryErrorBoundary>
  );
};