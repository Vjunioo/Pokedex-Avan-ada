import { httpClient } from '../utils/http';
import { CacheManager } from '../utils/cache';
import { PokemonBasic, PokemonDetail } from '../types/pokemon';

const BASE_URL = 'https://pokeapi.co/api/v2';
const BATCH_SIZE = 5;

export let appIsOffline = false; 

export const setAppOfflineStatus = (status: boolean) => {
    appIsOffline = status;
};

const getCachedDetail = (nameOrId: string | number) => {
    const id = String(nameOrId).toLowerCase();
    const cacheKey = `${BASE_URL}/pokemon/${id}`;
    return CacheManager.get<PokemonDetail>(cacheKey, appIsOffline); 
}

const fetchAndCacheDetail = async (nameOrId: string | number): Promise<PokemonDetail> => {
    const id = String(nameOrId).toLowerCase();
    const url = `${BASE_URL}/pokemon/${id}`;
    const data = await httpClient<PokemonDetail>(url);
    
    const simplifiedData = {
        id: data.id,
        name: data.name,
        types: data.types,
        stats: data.stats,
        abilities: data.abilities,
        sprites: { 
            other: {
                'official-artwork': {
                    front_default: data.sprites.other['official-artwork'].front_default,
                }
            }
        },
    } as PokemonDetail;

    await CacheManager.set(url, simplifiedData);
    return simplifiedData;
};

export const PokeApi = {
  getPokemonList: async (limit = 20, offset = 0): Promise<{ results: PokemonBasic[] }> => {
    const url = `${BASE_URL}/pokemon?limit=${limit}&offset=${offset}`;
    
    const cached = await CacheManager.get<{ results: PokemonBasic[] }>(url, appIsOffline); 
    if (cached) return cached;

    if (appIsOffline) throw new Error('Sem conexão. Cache expirado ou não encontrado.');
    
    const data = await httpClient<{ results: PokemonBasic[] }>(url);
    await CacheManager.set(url, data);
    return data;
  },

  getPokemonDetail: async (nameOrId: string | number): Promise<PokemonDetail> => {
    const cached = await getCachedDetail(nameOrId);
    if (cached) return cached;
    
    if (appIsOffline) throw new Error('Sem conexão. Cache de detalhe não encontrado.');
    
    return fetchAndCacheDetail(nameOrId);
  },

  getPokemonByType: async (type: string): Promise<PokemonBasic[]> => {
    const url = `${BASE_URL}/type/${type}`;
    
    const cached = await CacheManager.get<{ results: PokemonBasic[] }>(url, appIsOffline);
    if (cached && Array.isArray(cached.results)) return cached.results;

    if (appIsOffline) throw new Error('Sem conexão. Cache expirado ou não encontrado.');
    
    const data = await httpClient<{ pokemon: { pokemon: PokemonBasic }[] }>(url);
    
    const normalizedList = data.pokemon.map(p => p.pokemon);

    await CacheManager.set(url, { results: normalizedList });
    return normalizedList;
  },

  getManyDetails: async (pokemonList: PokemonBasic[]): Promise<PokemonDetail[]> => {
    const allDetails: PokemonDetail[] = [];

    for (let i = 0; i < pokemonList.length; i += BATCH_SIZE) {
      const chunk = pokemonList.slice(i, i + BATCH_SIZE);
      
      const chunkPromises = chunk.map(async (p) => {
        const cached = await getCachedDetail(p.name);
        if (cached) {
            return cached;
        }

        if (appIsOffline) {
             return null;
        }
        
        return fetchAndCacheDetail(p.name);
      });
      
      const results = await Promise.all(chunkPromises);
      
      const validDetails = results.filter(d => d !== null) as PokemonDetail[];
      allDetails.push(...validDetails);
    }
    
    return allDetails;
  }
};