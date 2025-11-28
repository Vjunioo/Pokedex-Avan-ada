import { httpClient } from '../utils/http';
import { CacheManager } from '../utils/cache';
import { PokemonBasic, PokemonDetail } from '../types/pokemon';

const BASE_URL = 'https://pokeapi.co/api/v2';

export const PokeApi = {
  // ... (métodos existentes: getPokemonList, getPokemonDetail, getPokemonByType)

  // NOVO MÉTODO PARA BUSCAR VARIAÇÕES DE FORMA
  getPokemonForms: async (name: string): Promise<PokemonBasic[]> => {
    const id = name.toLowerCase();
    const url = `${BASE_URL}/pokemon-species/${id}`;

    // Tenta obter do cache usando a URL da espécie
    const cached = await CacheManager.get<{ varieties: { pokemon: PokemonBasic }[] }>(url);

    let speciesData;
    if (cached) {
      speciesData = cached;
    } else {
      // Se não estiver no cache, faz a requisição
      speciesData = await httpClient<{ varieties: { pokemon: PokemonBasic }[] }>(url);
      await CacheManager.set(url, speciesData);
    }
    
    
    const formsList = speciesData.varieties.map(v => v.pokemon);
    
   
    return formsList;
  },

  getPokemonList: async (limit = 20, offset = 0): Promise<{ results: PokemonBasic[] }> => {
    const url = `${BASE_URL}/pokemon?limit=${limit}&offset=${offset}`;
    
    const cached = await CacheManager.get<{ results: PokemonBasic[] }>(url);
    if (cached) return cached;

    const data = await httpClient<{ results: PokemonBasic[] }>(url);
    await CacheManager.set(url, data);
    return data;
  },

  getPokemonDetail: async (nameOrId: string | number): Promise<PokemonDetail> => {
    const id = String(nameOrId).toLowerCase();
    const url = `${BASE_URL}/pokemon/${id}`;
    
    const cached = await CacheManager.get<PokemonDetail>(url);
    if (cached) return cached;

    const data = await httpClient<PokemonDetail>(url);
    await CacheManager.set(url, data);
    return data;
  },

  getPokemonByType: async (type: string): Promise<PokemonBasic[]> => {
    const url = `${BASE_URL}/type/${type}`;
    
    const cached = await CacheManager.get<{ results: PokemonBasic[] }>(url);
    if (cached && Array.isArray(cached.results)) return cached.results;

    const data = await httpClient<{ pokemon: { pokemon: PokemonBasic }[] }>(url);
    
    const normalizedList = data.pokemon.map(p => p.pokemon);

    await CacheManager.set(url, { results: normalizedList });
    return normalizedList;
  },

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
  }
};