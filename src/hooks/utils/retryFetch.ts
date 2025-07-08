/**
 * Função utilitária para tentar fetch com retry exponencial.
 * @param fn Função async a executar
 * @param retries Número de tentativas
 * @param delay Delay inicial em ms
 */
export async function retryFetch<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 700,
): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (retries <= 0) throw err;
    await new Promise((resolve) => setTimeout(resolve, delay));
    return retryFetch(fn, retries - 1, delay * 2);
  }
}
