import NetInfo from '@react-native-community/netinfo';

interface RequestConfig extends RequestInit {
  timeout?: number;
  retries?: number;
}

const DEFAULT_TIMEOUT = 8000;
const MAX_RETRIES = 3;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// CORREÇÃO: Nome alterado para httpClient para bater com a API
export async function httpClient<T>(url: string, config: RequestConfig = {}): Promise<T> {
  const { timeout = DEFAULT_TIMEOUT, retries = MAX_RETRIES, ...customConfig } = config;

  // 1. Fail Fast se não houver internet
  const netState = await NetInfo.fetch();
  if (!netState.isConnected) {
    throw new Error('OFFLINE_MODE');
  }

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...customConfig,
      signal: controller.signal,
    });

    clearTimeout(id);

    if (!response.ok) {
      if (response.status >= 500) throw new Error(`SERVER_ERROR`);
      throw new Error(`HTTP_ERROR_${response.status}`);
    }

    return (await response.json()) as T;

  } catch (error: any) {
    clearTimeout(id);

    const shouldRetry = error.message === 'SERVER_ERROR' || error.name === 'AbortError';

    if (shouldRetry && retries > 0) {
      const delay = 1000 * (2 ** (MAX_RETRIES - retries));
      console.log(`[HTTP] Erro em ${url}. Tentando em ${delay}ms...`);
      await wait(delay);
      // Recursão chamando httpClient
      return httpClient<T>(url, { ...config, retries: retries - 1 });
    }

    throw error;
  }
}