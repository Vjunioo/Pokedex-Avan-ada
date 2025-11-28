import { useCallback, useEffect, useRef, useState } from 'react';
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

  const [activeFilterType, setActiveFilterType] = useState<string | null>(null);
  const [filteredListQueue, setFilteredListQueue] = useState<PokemonBasic[]>([]);
  
  const filterRef = useRef<string | null>(null);
  const searchTimeout = useRef<any>(null);

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
      return details;
    } catch (err) {
      console.error(err);
      setError('Erro ao carregar detalhes.');
      return [];
    }
  };

  const loadMore = useCallback(async () => {
    if (loading) return;

    if (filterRef.current !== null) {
        if (filteredListQueue.length === 0) {
            setHasMore(false);
            return;
        }

        setLoading(true);
        try {
            const nextBatch = filteredListQueue.slice(0, 20);
            const remaining = filteredListQueue.slice(20);
            
            if (filterRef.current === null) return;

            setFilteredListQueue(remaining);
            const details = await fetchDetailsForList(nextBatch);
            
            if (filterRef.current !== null) {
                addPokemonsUnique(details);
                if (remaining.length === 0) setHasMore(false);
            }
        } catch(e) {
            setError('Erro ao carregar filtro.');
        } finally {
            setLoading(false);
        }
        return; 
    }

    if (!hasMore) return;

    setLoading(true);
    const offline = await CacheManager.isOffline();
    setIsOffline(offline);

    try {
      const data = await PokeApi.getPokemonList(20, offset);
      if (filterRef.current !== null) return;

      if (data.results.length === 0) {
        setHasMore(false);
      } else {
        const details = await fetchDetailsForList(data.results);
        if (filterRef.current === null) {
            addPokemonsUnique(details);
            setOffset(prev => prev + 20);
        }
      }
    } catch (err) {
      setError('Falha na conexão.');
    } finally {
      setLoading(false);
    }
  }, [loading, filteredListQueue, hasMore, offset, addPokemonsUnique]);

  const searchPokemon = (text: string) => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    
    if (!text.trim()) {
      resetList();
      return;
    }

    updateFilterMode('SEARCH'); 
    
    searchTimeout.current = setTimeout(async () => {
      setLoading(true);
      setPokemons([]); 
      setFilteredListQueue([]);
      setHasMore(true);
      
      try {
        const allPokemons = await PokeApi.getAllPokemonNames();
        const term = text.toLowerCase();
        const matches = allPokemons.filter(p => p.name.includes(term));

        if (matches.length === 0) {
            setError('Nenhum Pokémon encontrado.');
            setLoading(false);
            return;
        }

        const firstBatch = matches.slice(0, 20);
        const remaining = matches.slice(20);

        setFilteredListQueue(remaining);
        const details = await fetchDetailsForList(firstBatch);
        
        if (filterRef.current === 'SEARCH') {
            setPokemons(details);
            if (remaining.length === 0) setHasMore(false);
        }
      } catch (err) {
        setError('Erro na busca.');
      } finally {
        setLoading(false);
      }
    }, 600);
  };

  const fetchSuggestions = useCallback(async (text: string) => {
    if (!text || text.length < 2) return [];
    
    try {
      const allPokemons = await PokeApi.getAllPokemonNames();
      const term = text.toLowerCase();
      
      return allPokemons
        .filter(p => p.name.includes(term))
        .map(p => p.name)
        .slice(0, 5);
    } catch (e) {
      return [];
    }
  }, []);

  const filterByType = async (type: string) => {
    updateFilterMode(type);

    setLoading(true);
    setPokemons([]); 
    setFilteredListQueue([]); 
    setError(null);
    setHasMore(true);

    try {
      const allNamesWithType = await PokeApi.getPokemonByType(type.toLowerCase());
      
      const firstBatch = allNamesWithType.slice(0, 20);
      const remaining = allNamesWithType.slice(20);

      setFilteredListQueue(remaining);
      const details = await fetchDetailsForList(firstBatch);
      
      if (filterRef.current === type) {
          setPokemons(details);
      }

    } catch (err) {
      setError(`Erro ao carregar tipo ${type}`);
    } finally {
      setLoading(false);
    }
  };

  const updateFilterMode = (mode: string | null) => {
      setActiveFilterType(mode);
      filterRef.current = mode;
  };

  const resetList = () => {
    updateFilterMode(null);
    setFilteredListQueue([]);
    setPokemons([]);
    setOffset(0);
    setHasMore(true);
    setLoading(false);
    
    setTimeout(() => {
        if (filterRef.current === null) {
            PokeApi.getPokemonList(20, 0).then(async (data) => {
                 if (filterRef.current === null) {
                    const details = await fetchDetailsForList(data.results);
                    addPokemonsUnique(details);
                    setOffset(20);
                 }
            });
        }
    }, 50);
  };

  useEffect(() => {
    if (filterRef.current === null) {
        loadMore();
    }
  }, []);

  return {
    pokemons,
    loading,
    error,
    isOffline,
    loadMore,
    searchPokemon,
    filterByType,
    resetList,
    activeFilterType,
    fetchSuggestions
  };
}