import { useState, useEffect } from 'react';

/**
 * Hook para debounce de valores
 * Útil para otimizar buscas e filtros em tempo real
 * 
 * @param value - Valor a ser debounced
 * @param delay - Delay em millisegundos (padrão: 300ms)
 * @returns Valor debounced
 */
export function useDebouncedValue<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook para debounce de callbacks
 * Útil para otimizar event handlers
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 300
): T {
  const [debouncedCallback, setDebouncedCallback] = useState<T>(() => callback);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedCallback(() => callback);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [callback, delay]);

  return debouncedCallback;
}

/**
 * Hook para debounce de estado com retorno do estado pendente
 * Útil quando você precisa saber se há uma mudança pendente
 */
export function useDebouncedState<T>(
  initialValue: T,
  delay: number = 300
): [T, T, (value: T) => void, boolean] {
  const [value, setValue] = useState<T>(initialValue);
  const [debouncedValue, setDebouncedValue] = useState<T>(initialValue);
  const [isPending, setIsPending] = useState<boolean>(false);

  useEffect(() => {
    if (value !== debouncedValue) {
      setIsPending(true);
      const handler = setTimeout(() => {
        setDebouncedValue(value);
        setIsPending(false);
      }, delay);

      return () => {
        clearTimeout(handler);
      };
    } else {
      setIsPending(false);
    }
  }, [value, debouncedValue, delay]);

  return [value, debouncedValue, setValue, isPending];
}

/**
 * Hook para debounce de search queries
 * Especializado para buscas com otimizações específicas
 */
export function useDebouncedSearch(
  initialQuery: string = '',
  delay: number = 300,
  minLength: number = 2
) {
  const [query, setQuery] = useState<string>(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState<string>(
    initialQuery.length >= minLength ? initialQuery : ''
  );
  const [isSearching, setIsSearching] = useState<boolean>(false);

  useEffect(() => {
    // Se a query for menor que o mínimo, limpar o debounced
    if (query.length < minLength) {
      setDebouncedQuery('');
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
      setIsSearching(false);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [query, delay, minLength]);

  const clearSearch = () => {
    setQuery('');
    setDebouncedQuery('');
    setIsSearching(false);
  };

  return {
    query,
    debouncedQuery,
    setQuery,
    isSearching,
    clearSearch,
    hasValidQuery: debouncedQuery.length >= minLength,
  };
}