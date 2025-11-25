import { fetchWithRetry } from '../utils/http';
import { CacheManager } from '../utils/cache';
import { PokemonBasic, PokemonDetail } from '../types/pokemon';

const BASE_URL = 'https://pokeapi.co/api/v2';

export const PokeApi = {
  getPokemonList: async (limit = 20, offset = 0) => {
    const url = `${BASE_URL}/pokemon?limit=${limit}&offset=${offset}`;
    
    const cached = await CacheManager.get(url);
    if (cached) return cached;

    const data = await fetchWithRetry<{ results: PokemonBasic[] }>(url);
    
    await CacheManager.set(url, data);
    return data;
  },

  getPokemonDetail: async (nameOrId: string | number) => {
    const url = `${BASE_URL}/pokemon/${nameOrId}`;
    
    const cached = await CacheManager.get(url);
    if (cached) return cached;

    const data = await fetchWithRetry<PokemonDetail>(url);
    await CacheManager.set(url, data);
    return data;
  },

  getPokemonByType: async (type: string) => {
    const url = `${BASE_URL}/type/${type}`;
    
    const cached = await CacheManager.get(url);
    if (cached) return cached;

    const data = await fetchWithRetry<{ pokemon: { pokemon: PokemonBasic }[] }>(url);
    
    const normalized = {
      results: data.pokemon.map(p => p.pokemon)
    };

    await CacheManager.set(url, normalized);
    return normalized;
  }
};