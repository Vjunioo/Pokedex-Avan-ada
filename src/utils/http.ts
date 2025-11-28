import NetInfo from '@react-native-community/netinfo';
import { appIsOffline } from '../api/pokeApi';

interface RequestConfig extends RequestInit {
  timeout?: number;
  retries?: number;
}

const DEFAULT_TIMEOUT = 8000;
const MAX_RETRIES = 3;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function httpClient<T>(url: string, config: RequestConfig = {}): Promise<T> {
  const { timeout = DEFAULT_TIMEOUT, retries = MAX_RETRIES, ...customConfig } = config;

  if (appIsOffline) {
    throw new Error('OFFLINE_MODE');
  }

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

    const isNetworkError = error.message === 'SERVER_ERROR' || 
                           error.name === 'AbortError' || 
                           error.message.includes('Network request failed');

    if (isNetworkError && retries > 0) {
      const delay = 1000 * (2 ** (MAX_RETRIES - retries));
      await wait(delay);
      return httpClient<T>(url, { ...config, retries: retries - 1 });
    }

    throw error;
  }
}