import { PokemonBasic, PokemonDetail } from '../types/pokemon';
import { CacheManager } from '../utils/cache';
import { httpClient } from '../utils/http';

const BASE_URL = 'https://pokeapi.co/api/v2';
const CONCURRENCY_LIMIT = 5;

export const PokeApi = {
  getPokemonList: async (limit = 20, offset = 0): Promise<{ results: PokemonBasic[] }> => {
    const url = `${BASE_URL}/pokemon?limit=${limit}&offset=${offset}`;
   
    const cached = await CacheManager.get<{ results: PokemonBasic[] }>(url);
    if (cached) return cached;

    const data = await httpClient<{ results: PokemonBasic[] }>(url);
    await CacheManager.set(url, data);
    return data;
  },

  getPokemonDetail: async (nameOrId: string | number, signal?: AbortSignal): Promise<PokemonDetail> => {
    const id = String(nameOrId).toLowerCase();
    const url = `${BASE_URL}/pokemon/${id}`;
 
    const cached = await CacheManager.get<PokemonDetail>(url);
    if (cached) return cached;

    const data = await httpClient<PokemonDetail>(url, { signal });
    await CacheManager.set(url, data);
    return data;
  },

  getPokemonByType: async (type: string): Promise<PokemonBasic[]> => {
    const url = `${BASE_URL}/type/${type}`;
    
    const cached = await CacheManager.get<PokemonBasic[]>(url); 
    if (cached) return cached;

    const data = await httpClient<{ pokemon: { pokemon: PokemonBasic }[] }>(url);
    const normalizedList = data.pokemon.map(p => p.pokemon);

    await CacheManager.set(url, normalizedList);
    return normalizedList;
  },

  getManyDetails: async (pokemonList: PokemonBasic[]): Promise<PokemonDetail[]> => {
    const results: PokemonDetail[] = [];
    
    for (let i = 0; i < pokemonList.length; i += CONCURRENCY_LIMIT) {
      const chunk = pokemonList.slice(i, i + CONCURRENCY_LIMIT);
        
      const chunkPromises = chunk.map(async (p) => {
        try {
          return await PokeApi.getPokemonDetail(p.name);
        } catch {
          return null;
        }
      });

      const chunkResults = await Promise.all(chunkPromises);
      chunkResults.forEach(res => {
        if (res) results.push(res);
      });
    }

    return results;
  },

  getAllPokemonNames: async (): Promise<PokemonBasic[]> => {
    const url = `${BASE_URL}/pokemon?limit=2000`;
    
    const cached = await CacheManager.get<{ results: PokemonBasic[] }>(url);
    if (cached) return cached.results;

    const data = await httpClient<{ results: PokemonBasic[] }>(url);
    await CacheManager.set(url, data); 
    
    return data.results;
  }
};
