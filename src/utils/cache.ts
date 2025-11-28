import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

const CACHE_PREFIX = '@pokedex_v1_';
const TTL_MINUTES = 60;

export const CacheManager = {
  set: async (key: string, data: any) => {
    try {
      const payload = {
        data,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(CACHE_PREFIX + key, JSON.stringify(payload));
    } catch (error: any) {
      
      const errorMsg = error.message || '';
      
      const isFullDisk = 
        errorMsg.includes('SQLITE_FULL') || 
        errorMsg.includes('database or disk is full') || 
        errorMsg.includes('QuotaExceededError') ||
        errorMsg.includes('quota');

      if (isFullDisk) {
        console.warn('[Cache] Disco cheio! Tentando limpar itens antigos...');
        try {
            await AsyncStorage.clear();
        } catch (e) {
        }
        return;
      }
      
      console.error('[Cache] Erro desconhecido ao salvar:', error);
    }
  },

  get: async <T>(key: string, ignoreTTL = false): Promise<T | null> => {
    try {
      const raw = await AsyncStorage.getItem(CACHE_PREFIX + key);
      if (!raw) return null;

      const { data, timestamp } = JSON.parse(raw);
      
      const state = await NetInfo.fetch();
      const isOffline = !state.isConnected;

      if (ignoreTTL || isOffline) return data as T;

      const now = Date.now();
      const ageMinutes = (now - timestamp) / 1000 / 60;

      if (ageMinutes > TTL_MINUTES) {
        return null; 
      }

      return data as T;
    } catch (error) {
      return null;
    }
  },

  isOffline: async () => {
    const state = await NetInfo.fetch();
    return !state.isConnected;
  }
};