import { useState, useEffect, useCallback, useRef } from 'react';
import { PokeApi } from '../api/pokeApi';
import { PokemonBasic } from '../types/pokemon';
import { CacheManager } from '../utils/cache';

export function usePokedex() {
  const [list, setList] = useState<PokemonBasic[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isFiltering, setIsFiltering] = useState(false);

  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  const abortController = useRef<AbortController | null>(null);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore || isFiltering) return;

    setLoading(true);
    setError(null);
    const offline = await CacheManager.isOffline();
    setIsOffline(offline);

    try {
      const data = await PokeApi.getPokemonList(20, offset);
      if (data.results.length === 0) {
        setHasMore(false);
      } else {
        setList(prev => [...prev, ...data.results]);
        setOffset(prev => prev + 20);
      }
    } catch (err) {
      setError('Erro ao carregar. Verifique sua conexão.');
    } finally {
      setLoading(false);
    }
  }, [offset, loading, hasMore, isFiltering]);

  const searchPokemon = (text: string) => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (abortController.current) abortController.current.abort();

    if (!text.trim()) {
      resetList();
      return;
    }

    setIsFiltering(true);
    
    searchTimeout.current = setTimeout(async () => {
      setLoading(true);
      setList([]);
      abortController.current = new AbortController();

      try {
        const detail = await PokeApi.getPokemonDetail(text.toLowerCase());
        setList([{ name: detail.name, url: `https://pokeapi.co/api/v2/pokemon/${detail.id}` }]);
      } catch (err: any) {
        if (err.name !== 'AbortError') setError('Pokémon não encontrado.');
      } finally {
        setLoading(false);
      }
    }, 600);
  };

  const filterByType = async (type: string) => {
    if (!type) {
      resetList();
      return;
    }
    
    setLoading(true);
    setList([]);
    setIsFiltering(true);
    setError(null);

    try {
      const data = await PokeApi.getPokemonByType(type.toLowerCase());
      setList(data.results);
    } catch (err) {
      setError(`Erro ao carregar pokémons do tipo ${type}`);
    } finally {
      setLoading(false);
    }
  };

  const resetList = () => {
    setIsFiltering(false);
    setList([]);
    setOffset(0);
    setHasMore(true);
    setTimeout(() => loadMore(), 100);
  };

  useEffect(() => {
    loadMore();
  }, []);

  return {
    list,
    loading,
    error,
    isOffline,
    loadMore,
    searchPokemon,
    filterByType,
    resetList
  };
}