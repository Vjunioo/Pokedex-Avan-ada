import { PokemonBasic, PokemonDetail } from '../types/pokemon';
import { CacheManager } from '../utils/cache';
import { httpClient } from '../utils/http';

const BASE_URL = 'https://pokeapi.co/api/v2';

export const PokeApi = {
  // 1. Lista Paginada (Home)
  getPokemonList: async (limit = 20, offset = 0): Promise<{ results: PokemonBasic[] }> => {
    const url = `${BASE_URL}/pokemon?limit=${limit}&offset=${offset}`;
    
    const cached = await CacheManager.get<{ results: PokemonBasic[] }>(url);
    if (cached) return cached;

    const data = await httpClient<{ results: PokemonBasic[] }>(url);
    await CacheManager.set(url, data);
    return data;
  },

  // 2. Detalhes
  getPokemonDetail: async (nameOrId: string | number): Promise<PokemonDetail> => {
    const id = String(nameOrId).toLowerCase();
    const url = `${BASE_URL}/pokemon/${id}`;
    
    const cached = await CacheManager.get<PokemonDetail>(url);
    if (cached) return cached;

    const data = await httpClient<PokemonDetail>(url);
    await CacheManager.set(url, data);
    return data;
  },

  // 3. Filtro por Tipo
  getPokemonByType: async (type: string): Promise<PokemonBasic[]> => {
    const url = `${BASE_URL}/type/${type}`;
    const cached = await CacheManager.get<{ results: PokemonBasic[] }>(url);
    if (cached && Array.isArray(cached.results)) return cached.results;

    const data = await httpClient<{ pokemon: { pokemon: PokemonBasic }[] }>(url);
    const normalizedList = data.pokemon.map(p => p.pokemon);

    await CacheManager.set(url, { results: normalizedList });
    return normalizedList;
  },

  // 4. Detalhes em Lote
  getManyDetails: async (pokemonList: PokemonBasic[]): Promise<PokemonDetail[]> => {
    const results: PokemonDetail[] = [];
    const BATCH_SIZE = 5;

    for (let i = 0; i < pokemonList.length; i += BATCH_SIZE) {
      const chunk = pokemonList.slice(i, i + BATCH_SIZE);
      
      const chunkResponses = await Promise.all(
        chunk.map(p => PokeApi.getPokemonDetail(p.name))
      );
      
      results.push(...chunkResponses);
    }
    return results;
  },

  // 5. --- ESSA É A FUNÇÃO QUE ESTAVA FALTANDO ---
  getAllPokemonNames: async (): Promise<PokemonBasic[]> => {
    // Baixa lista de 10.000 (basicamente todos que existem) para busca local
    const url = `${BASE_URL}/pokemon?limit=10000`; 
    
    const cached = await CacheManager.get<{ results: PokemonBasic[] }>(url);
    if (cached) return cached.results;

    const data = await httpClient<{ results: PokemonBasic[] }>(url);
    
    // Cache longo pois novos pokemons não nascem todo dia
    await CacheManager.set(url, data); 
    
    return data.results;
  }
};