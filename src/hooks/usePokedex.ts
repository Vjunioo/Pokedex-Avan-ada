import { useState, useEffect, useCallback, useRef } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { PokeApi, setAppOfflineStatus } from '../api/pokeApi';
import { PokemonBasic, PokemonDetail } from '../types/pokemon';
import { CacheManager } from '../utils/cache';

const BATCH_SIZE = 20;

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
      const existingIds = prev.length > 0 ? new Set(prev.map(p => p.id)) : new Set();
      const uniqueNew = newPokemons.filter(p => !existingIds.has(p.id));
      
      if (uniqueNew.length === 0) return prev;
      return [...prev, ...uniqueNew];
    });
  }, []);

  const fetchDetailsForList = async (basicList: PokemonBasic[]) => {
    try {
      const details = await PokeApi.getManyDetails(basicList);
      addPokemonsUnique(details);
    } catch (err: any) {
      if (err.message === 'OFFLINE_MODE') {
        return;
      }
      setError('Erro ao carregar detalhes.');
      throw err;
    }
  };

  const loadMore = useCallback(async () => {
    if (loading || (!isFiltering && !hasMore)) return;

    setLoading(true);
    if (!error) setError(null);

    try {
      if (isFiltering) {
        if (filteredListQueue.length === 0 && pokemons.length > 0) {
          setHasMore(false);
        } else {
          const nextBatch = filteredListQueue.slice(0, BATCH_SIZE);
          const remaining = filteredListQueue.slice(BATCH_SIZE);
          setFilteredListQueue(remaining);
          
          await fetchDetailsForList(nextBatch);
          
          if (remaining.length === 0) setHasMore(false);
        }
      } else {
        if (!hasMore) {
           setLoading(false);
           return;
        }
        
        const data = await PokeApi.getPokemonList(BATCH_SIZE, offset);
        
        if (data.results.length === 0) {
          setHasMore(false);
        } else {
          await fetchDetailsForList(data.results);
          setOffset(prev => prev + BATCH_SIZE);
        }
      }
    } catch (err: any) {
        if (err.message === 'OFFLINE_MODE' && pokemons.length > 0) {
            setHasMore(false);
        } else {
            setError('Falha na conexão ou no carregamento dos dados.');
        }
    } finally {
      setLoading(false);
    }
  }, [offset, hasMore, isFiltering, filteredListQueue, loading, pokemons.length, addPokemonsUnique, error]);

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
      setError(null);
      setHasMore(false);
      
      try {
        const detail = await PokeApi.getPokemonDetail(text.toLowerCase());
        setPokemons([detail]);
      } catch (err: any) {
        if (err.message !== 'OFFLINE_MODE') {
          setError('Pokémon não encontrado.');
        }
      } finally {
        setLoading(false);
      }
    }, 600);
  };

  const filterByType = async (type: string) => {
    if (loading) return;
    
    setLoading(true);
    setIsFiltering(true);
    setHasMore(true);
    setPokemons([]);
    setFilteredListQueue([]);
    setError(null);

    try {
      const allNamesWithType = await PokeApi.getPokemonByType(type.toLowerCase());
      
      const firstBatch = allNamesWithType.slice(0, BATCH_SIZE);
      const remaining = allNamesWithType.slice(BATCH_SIZE);

      setFilteredListQueue(remaining);

      await fetchDetailsForList(firstBatch);

      if (remaining.length === 0) setHasMore(false);

    } catch (err: any) {
      if (err.message === 'OFFLINE_MODE' && pokemons.length > 0) {
          setHasMore(false);
      } else {
          setError(`Erro ao carregar Pokémons do tipo ${type}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const resetList = () => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    
    setIsFiltering(false);
    setFilteredListQueue([]);
    setPokemons([]);
    setOffset(0);
    setHasMore(true);
    setLoading(false);
    setError(null);
    
    setTimeout(() => {
        loadMore();
    }, 50);
  };

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const offlineStatus = !state.isConnected;
      
      setIsOffline(offlineStatus);
      setAppOfflineStatus(offlineStatus);
      
      if (!offlineStatus && pokemons.length === 0 && !loading && !isFiltering) {
          loadMore();
      }
    });

    loadMore();
    
    return () => unsubscribe();
  }, [loadMore, isFiltering, pokemons.length, loading]);

  return {
    pokemons,
    loading,
    error,
    isOffline,
    loadMore,
    searchPokemon,
    filterByType,
    resetList,
    hasMore
  };
}