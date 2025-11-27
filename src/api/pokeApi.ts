import { httpClient } from '../utils/http';
import { CacheManager } from '../utils/cache';
import { PokemonBasic, PokemonDetail } from '../types/pokemon';

const BASE_URL = 'https://pokeapi.co/api/v2';

export const PokeApi = {
  // 1. Busca lista paginada (Home)-mudada
  getPokemonList: async (limit = 20, offset = 0): Promise<{ results: PokemonBasic[] }> => {
    const url = `${BASE_URL}/pokemon?limit=${limit}&offset=${offset}`;
    
    const cached = await CacheManager.get<{ results: PokemonBasic[] }>(url);
    if (cached) return cached;

    const data = await httpClient<{ results: PokemonBasic[] }>(url);
    
    await CacheManager.set(url, data);
    return data;
  },

  // 2. NOVO: Busca TODOS os nomes (para o Autocomplete)
  // Baixa apenas nomes e urls de todos os 1300+ pokemons (leve e rápido)
  getAllPokemonNames: async (): Promise<PokemonBasic[]> => {
    const url = `${BASE_URL}/pokemon?limit=10000`; // Limite alto para pegar tudo
    
    // Cache longo (24h) pois novos pokemons não surgem todo dia
    const cached = await CacheManager.get<{ results: PokemonBasic[] }>(url, true); 
    if (cached) return cached.results;

    const data = await httpClient<{ results: PokemonBasic[] }>(url);
    await CacheManager.set(url, data); // Salva no cache
    
    return data.results;
  },

  // 3. Busca detalhes de um Pokémon
  getPokemonDetail: async (nameOrId: string | number): Promise<PokemonDetail> => {
    const id = String(nameOrId).toLowerCase();
    const url = `${BASE_URL}/pokemon/${id}`;
    
    const cached = await CacheManager.get<PokemonDetail>(url);
    if (cached) return cached;

    const data = await httpClient<PokemonDetail>(url);
    await CacheManager.set(url, data);
    return data;
  },

  // 4. Busca lista por Tipo
  getPokemonByType: async (type: string): Promise<{ results: PokemonBasic[] }> => {
    const url = `${BASE_URL}/type/${type}`;
    const cached = await CacheManager.get<{ results: PokemonBasic[] }>(url);
    if (cached) return cached;

    const data = await httpClient<{ pokemon: { pokemon: PokemonBasic }[] }>(url);
    const normalized = {
      results: data.pokemon.map((p: { pokemon: PokemonBasic }) => p.pokemon)
    };

    await CacheManager.set(url, normalized);
    return normalized;
  },

  // 5. Busca detalhes em lote
  getManyDetails: async (urls: string[]): Promise<PokemonDetail[]> => {
    const results: PokemonDetail[] = [];
    const BATCH_SIZE = 5;

    for (let i = 0; i < urls.length; i += BATCH_SIZE) {
      const chunk = urls.slice(i, i + BATCH_SIZE);
      const chunkResponses = await Promise.all(
        chunk.map(url => {
            const id = url.split('/').filter(Boolean).pop(); 
            return PokeApi.getPokemonDetail(id as string);
        })
      );
      results.push(...chunkResponses);
    }
    return results;
  }
};