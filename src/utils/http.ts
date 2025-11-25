// Configurações
const TIMEOUT_MS = 8000;
const MAX_RETRIES = 3;

export async function fetchWithRetry<T>(
  url: string, 
  options: RequestInit = {}, 
  retries = MAX_RETRIES
): Promise<T> {
  const controller = new AbortController();
  
  const signal = options.signal || controller.signal;

  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(url, { ...options, signal });
    clearTimeout(timeoutId);

    if (response.status >= 500 && retries > 0) {
      const waitTime = Math.pow(2, MAX_RETRIES - retries) * 1000 + Math.random() * 1000;
      await new Promise(resolve => setTimeout(resolve, waitTime));
      return fetchWithRetry<T>(url, options, retries - 1);
    }

    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }

    return await response.json();
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw error;
    }
    if (retries > 0) {
      console.log(`Tentando novamente... Restam ${retries}`);
      return fetchWithRetry<T>(url, options, retries - 1);
    }
    throw error;
  }
}