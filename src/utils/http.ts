import NetInfo from '@react-native-community/netinfo';

interface RequestConfig extends RequestInit {
  timeout?: number;
  retries?: number;
}

const DEFAULT_TIMEOUT = 8000;
const MAX_RETRIES = 3;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function httpClient<T>(url: string, config: RequestConfig = {}): Promise<T> {
  const { timeout = DEFAULT_TIMEOUT, retries = MAX_RETRIES, signal: externalSignal, ...customConfig } = config;

  const netState = await NetInfo.fetch();
  if (!netState.isConnected) {
    throw new Error('OFFLINE_MODE');
  }

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  if (externalSignal) {
    externalSignal.addEventListener('abort', () => {
      controller.abort();
    });
  }

  try {
    const response = await fetch(url, {
      ...customConfig,
      signal: controller.signal,
    });

    clearTimeout(id);

    if (!response.ok) {
      if (response.status >= 500) throw new Error(`SERVER_ERROR`);
      if (response.status === 404) throw new Error(`NOT_FOUND`);
      throw new Error(`HTTP_ERROR_${response.status}`);
    }

    return (await response.json()) as T;

  } catch (error: any) {
    clearTimeout(id);

    if (error.name === 'AbortError') {
      if (externalSignal?.aborted) {
        throw error;
      }
      error.name = 'TimeoutError';
      error.message = 'TimeoutError';
    }

    const isNetworkError = error.name === 'TimeoutError' || error.message === 'Network request failed';
    const isServerError = error.message === 'SERVER_ERROR';
    const shouldRetry = (isNetworkError || isServerError) && retries > 0;

    if (shouldRetry) {
      const attempt = MAX_RETRIES - retries + 1;
      const baseDelay = 1000 * Math.pow(2, attempt - 1);
      const jitter = Math.random() * 500;
      const totalDelay = baseDelay + jitter;

      console.log(`[HTTP] Erro em ${url}. Tentativa ${attempt}/${MAX_RETRIES}. Aguardando ${Math.floor(totalDelay)}ms...`);

      await wait(totalDelay);

      return httpClient<T>(url, { ...config, retries: retries - 1, signal: externalSignal });
    }

    throw error;
  }
}
