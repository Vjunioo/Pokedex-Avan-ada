import { useCallback, useEffect, useRef, useState } from 'react';
import { PokeApi } from '../api/pokeApi';
import { PokemonBasic, PokemonDetail } from '../types/pokemon';
import { CacheManager } from '../utils/cache';
import { resolvePokemonName } from '../utils/aliases';

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
  const allPokemonNamesCache = useRef<PokemonBasic[] | null>(null);

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
            setError('Erro ao carregar mais itens.');
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
      setError('Falha na conexão. Verifique sua internet.');
    } finally {
      setLoading(false);
    }
  }, [loading, filteredListQueue, hasMore, offset, addPokemonsUnique]);

  const searchPokemon = (text: string) => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    
    if (!text.trim()) {
      if (activeFilterType === 'SEARCH') resetList();
      return;
    }

    updateFilterMode('SEARCH'); 
    
    searchTimeout.current = setTimeout(async () => {
      setLoading(true);
      setPokemons([]); 
      setFilteredListQueue([]);
      setHasMore(true);
      setError(null);
      
      const searchTerm = resolvePokemonName(text);

      try {
        const isNumber = !isNaN(Number(searchTerm));
        
        if (isNumber) {
            try {
                const detail = await PokeApi.getPokemonDetail(searchTerm);
                setPokemons([detail]);
                setHasMore(false);
            } catch (e) {
                setError(`Pokémon #${text} não encontrado.`);
            }
            setLoading(false);
            return;
        }

        let allPokemons = allPokemonNamesCache.current;
        if (!allPokemons) {
            allPokemons = await PokeApi.getAllPokemonNames();
            allPokemonNamesCache.current = allPokemons;
        }

        const matches = allPokemons!.filter(p => p.name.includes(searchTerm));

        if (matches.length === 0) {
            try {
               const direct = await PokeApi.getPokemonDetail(searchTerm);
               setPokemons([direct]);
               setHasMore(false);
               setLoading(false);
               return;
            } catch(e) {
               setError(`Nenhum Pokémon encontrado com "${text}".`);
               setLoading(false);
               return;
            }
        }

        const firstBatch = matches.slice(0, 20);
        const remaining = matches.slice(20);

        setFilteredListQueue(remaining);
        const details = await fetchDetailsForList(firstBatch);
        
        if (filterRef.current === 'SEARCH') {
            setPokemons(details);
            if (remaining.length === 0) setHasMore(false);
        }
      } catch (err: any) {
        setError('Erro ao realizar a busca.');
      } finally {
        if (filterRef.current === 'SEARCH') setLoading(false);
      }
    }, 600);
  };

  const fetchSuggestions = useCallback(async (text: string): Promise<string[]> => {
    if (!text || text.length < 2) return [];
    if (!isNaN(Number(text))) return []; 

    const term = resolvePokemonName(text);

    try {
      let allPokemons = allPokemonNamesCache.current;
      if (!allPokemons) {
          allPokemons = await PokeApi.getAllPokemonNames();
          allPokemonNamesCache.current = allPokemons;
      }
      return allPokemons!.filter(p => p.name.includes(term)).map(p => p.name).slice(0, 5);
    } catch (e) {
      return [];
    }
  }, []);

  const filterByType = async (type: string) => {
    if (activeFilterType === type) return;
    setLoading(true);
    try {
      const allNamesWithType = await PokeApi.getPokemonByType(type.toLowerCase());
      updateFilterMode(type);
      setPokemons([]); 
      setFilteredListQueue([]); 
      setError(null);
      setHasMore(true);

      const firstBatch = allNamesWithType.slice(0, 20);
      const remaining = allNamesWithType.slice(20);
      setFilteredListQueue(remaining);
      const details = await fetchDetailsForList(firstBatch);
      if (filterRef.current === type) {
          setPokemons(details);
          if (remaining.length === 0) setHasMore(false);
      }
    } catch (err: any) {
      setError(`Erro ao carregar tipo ${type}`);
    } finally {
      setLoading(false);
    }
  };

  const updateFilterMode = (mode: string | null) => {
      setActiveFilterType(mode);
      filterRef.current = mode;
  };

  const resetList = async () => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    updateFilterMode(null);
    setFilteredListQueue([]);
    setHasMore(true);
    setOffset(0);
    setError(null);
    setPokemons([]); 
    setLoading(true); 
    try {
        const data = await PokeApi.getPokemonList(20, 0);
        const details = await fetchDetailsForList(data.results);
        if (filterRef.current === null) {
            setPokemons(details);
            setOffset(20);
        }
    } catch (err) {
        setError('Falha ao recarregar a lista.');
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    loadMore();
  }, []);

  return { pokemons, loading, error, isOffline, loadMore, searchPokemon, filterByType, resetList, activeFilterType, fetchSuggestions };
}
