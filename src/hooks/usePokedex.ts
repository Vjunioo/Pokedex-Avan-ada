import { useState, useEffect, useCallback, useRef } from 'react';
import { PokeApi } from '../api/pokeApi';
import { PokemonBasic, PokemonDetail } from '../types/pokemon';
import { CacheManager } from '../utils/cache';

export function usePokedex() {
  const [pokemons, setPokemons] = useState<PokemonDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);

  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const [isFiltering, setIsFiltering] = useState(false);
  const [filteredListQueue, setFilteredListQueue] = useState<PokemonBasic[]>([]);

  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  const addPokemonsUnique = useCallback((newPokemons: PokemonDetail[]) => {
    setPokemons(prev => {
      const existingIds = new Set(prev.map(p => p.id));
      const uniqueNew = newPokemons.filter(p => !existingIds.has(p.id));
      
      if (uniqueNew.length === 0) return prev;
      return [...prev, ...uniqueNew];
    });
  }, []);

  const fetchDetailsForList = async (basicList: PokemonBasic[]) => {
    try {
      const details = await PokeApi.getManyDetails(basicList);
      addPokemonsUnique(details);
    } catch (err) {
      console.error(err);
      setError('Erro ao carregar detalhes.');
    }
  };

  const loadMore = useCallback(async () => {
    if (loading) return;

    setLoading(true);
    const offline = await CacheManager.isOffline();
    setIsOffline(offline);

    try {
      if (isFiltering) {
        if (filteredListQueue.length === 0) {
          setHasMore(false);
        } else {
          const nextBatch = filteredListQueue.slice(0, 20);
          const remaining = filteredListQueue.slice(20);
          setFilteredListQueue(remaining);
          await fetchDetailsForList(nextBatch);
          if (remaining.length === 0) setHasMore(false);
        }
      } else {
        if (!hasMore) {
           setLoading(false); 
           return;
        }
        
        const data = await PokeApi.getPokemonList(20, offset);
        if (data.results.length === 0) {
          setHasMore(false);
        } else {
          await fetchDetailsForList(data.results);
          setOffset(prev => prev + 20);
        }
      }
    } catch (err) {
      setError('Falha na conexão.');
    } finally {
      setLoading(false);
    }
  }, [offset, hasMore, isFiltering, filteredListQueue, loading, addPokemonsUnique]);

  const searchPokemon = (text: string) => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    
    if (!text.trim()) {
      resetList();
      return;
    }

    setIsFiltering(true); 
    
    searchTimeout.current = setTimeout(async () => {
      setLoading(true);
      setPokemons([]);
      
      try {
        const detail = await PokeApi.getPokemonDetail(text.toLowerCase());
        setPokemons([detail]);
        setHasMore(false);
      } catch (err) {
        setError('Pokémon não encontrado.');
        setPokemons([]);
      } finally {
        setLoading(false);
      }
    }, 600);
  };

  const filterByType = async (type: string) => {
    setLoading(true);
    setIsFiltering(true);
    setHasMore(true);
    setPokemons([]);
    setFilteredListQueue([]);
    setError(null);

    try {
      const allNamesWithType = await PokeApi.getPokemonByType(type.toLowerCase());
      
      const firstBatch = allNamesWithType.slice(0, 20);
      const remaining = allNamesWithType.slice(20);

      setFilteredListQueue(remaining);

      await fetchDetailsForList(firstBatch);

    } catch (err) {
      setError(`Erro ao carregar tipo ${type}`);
    } finally {
      setLoading(false);
    }
  };

  const resetList = () => {
    setIsFiltering(false);
    setFilteredListQueue([]);
    setPokemons([]);
    setOffset(0);
    setHasMore(true);
    setLoading(false);
    
    setTimeout(() => {
        PokeApi.getPokemonList(20, 0).then(data => {
             fetchDetailsForList(data.results);
             setOffset(20);
        });
    }, 50);
  };

  useEffect(() => {
    loadMore();
  }, []);

  return {
    pokemons,
    loading,
    error,
    isOffline,
    loadMore,
    searchPokemon,
    filterByType,
    resetList
  };
}