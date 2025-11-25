import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

const CACHE_PREFIX = 'pokedex_cache_';
const TTL_MINUTES = 30;

export const CacheManager = {
  async set(key: string, data: any) {
    const item = {
      value: data,
      timestamp: Date.now(),
    };
    try {
      await AsyncStorage.setItem(CACHE_PREFIX + key, JSON.stringify(item));
    } catch (e) {
      console.error('Erro ao salvar cache', e);
    }
  },

  async get(key: string) {
    try {
      const value = await AsyncStorage.getItem(CACHE_PREFIX + key);
      if (!value) return null;

      const item = JSON.parse(value);
      const now = Date.now();
      const ageMinutes = (now - item.timestamp) / 1000 / 60;

      const isExpired = ageMinutes > TTL_MINUTES;
      const state = await NetInfo.fetch();

      if (!state.isConnected) {
        return item.value;
      }

      if (isExpired) return null;

      return item.value;
    } catch (e) {
      return null;
    }
  },

  async isOffline() {
    const state = await NetInfo.fetch();
    return !state.isConnected;
  }
};