import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

const CACHE_PREFIX = '@pokedex_v1_';
const TTL_MINUTES = 30;

const memoryCache = new Map<string, { data: any; timestamp: number }>();

export const CacheManager = {
  set: async (key: string, data: any) => {
    const payload = {
      data,
      timestamp: Date.now(),
    };

    memoryCache.set(key, payload);

    try {
      await AsyncStorage.setItem(CACHE_PREFIX + key, JSON.stringify(payload));
    } catch (error: any) {
      const errorMsg = error.message || '';
      
      const isFullDisk =
        errorMsg.includes('SQLITE_FULL') ||
        errorMsg.includes('database or disk is full') ||
        errorMsg.includes('QuotaExceededError');

      if (isFullDisk) {
        try {
          await AsyncStorage.clear();
          memoryCache.clear();
        } catch {}
      }
    }
  },

  get: async <T>(key: string, ignoreTTL = false): Promise<T | null> => {
    let cached = memoryCache.get(key);

    if (!cached) {
      try {
        const raw = await AsyncStorage.getItem(CACHE_PREFIX + key);
        if (!raw) return null;
        
        cached = JSON.parse(raw);

        if (cached) {
          memoryCache.set(key, cached);
        }
      } catch {
        return null;
      }
    }

    if (!cached) return null;

    const { data, timestamp } = cached;

    const state = await NetInfo.fetch();
    const isOffline = !state.isConnected;

    if (ignoreTTL || isOffline) return data as T;

    const now = Date.now();
    const ageMinutes = (now - timestamp) / 1000 / 60;

    if (ageMinutes > TTL_MINUTES) {
      return null;
    }

    return data as T;
  },

  isOffline: async () => {
    const state = await NetInfo.fetch();
    return !state.isConnected;
  },
  
  clear: async () => {
    memoryCache.clear();
    await AsyncStorage.clear();
  }
};
