import * as React from "react";

/**
 * Hook para criar uma função debounced.
 * @param callback Função original a ser debounced
 * @param delay Delay em ms (default 400)
 */
export function useDebouncedCallback<T extends (...args: any[]) => void>(
  callback: T,
  delay: number = 400,
) {
  const timeout = React.useRef<NodeJS.Timeout | null>(null);

  const debounced = React.useCallback(
    (...args: Parameters<T>) => {
      if (timeout.current) clearTimeout(timeout.current);
      timeout.current = setTimeout(() => callback(...args), delay);
    },
    [callback, delay],
  );

  // cleanup (evita vazamento de timers)
  React.useEffect(() => {
    return () => {
      if (timeout.current) clearTimeout(timeout.current);
    };
  }, []);

  return debounced;
}
