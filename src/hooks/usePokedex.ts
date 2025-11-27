import { useState, useEffect, useCallback, useRef } from 'react';
import { PokeApi } from '../api/pokeApi';
import { CacheManager } from '../utils/cache';
import { PokemonBasic, PokemonDetail } from '../types/pokemon';

export function usePokedex() {
  const [pokemons, setPokemons] = useState<PokemonDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isFiltering, setIsFiltering] = useState(false);

  // NOVO: Lista Mestra com todos os nomes para o Autocomplete
  const allPokemonRef = useRef<PokemonBasic[]>([]);

  const isFetching = useRef(false); 
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  const abortController = useRef<AbortController | null>(null);

  // 1. Carrega a Lista Mestra (Nomes) ao iniciar o App (Background)
  useEffect(() => {
    const loadMasterList = async () => {
      try {
        const all = await PokeApi.getAllPokemonNames();
        allPokemonRef.current = all;
      } catch (e) {
        console.warn('Falha ao carregar lista de autocomplete');
      }
    };
    loadMasterList();
    loadMore(); // Carrega a página 1 normal
  }, []);

  // --- CARREGAR MAIS (INFINITE SCROLL) ---
  const loadMore = useCallback(async () => {
    if (loading || !hasMore || isFiltering || isFetching.current) return;

    setLoading(true);
    isFetching.current = true; 
    setError(null);
    
    const offline = await CacheManager.isOffline();
    setIsOffline(offline);

    try {
      const data = await PokeApi.getPokemonList(20, offset);
      
      if (data.results.length === 0) {
        setHasMore(false);
        setLoading(false);
        return;
      }

      const urls = data.results.map((p: PokemonBasic) => p.url);
      const details = await PokeApi.getManyDetails(urls);

      setPokemons(prev => {
        const existingIds = new Set(prev.map(p => p.id));
        const uniqueNewPokemons = details.filter(p => !existingIds.has(p.id));
        return [...prev, ...uniqueNewPokemons];
      });

      setOffset(prev => prev + 20);

    } catch (err: any) {
      const currentOfflineStatus = await CacheManager.isOffline();
      setIsOffline(currentOfflineStatus);
      if (!currentOfflineStatus) setError('Erro ao carregar.');
    } finally {
      setLoading(false);
      isFetching.current = false; 
    }
  }, [offset, loading, hasMore, isFiltering]);

  // --- BUSCA INTELIGENTE (AUTOCOMPLETE) ---
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
      setError(null);
      
      try {
        const searchTerm = text.toLowerCase();
        
        // 1. Filtra localmente na Lista Mestra (Instantâneo)
        // Procura pokemons que "contêm" o texto (Ex: 'iv' -> Ivysaur, Snivy, Vivillon)
        const matches = allPokemonRef.current.filter(p => p.name.includes(searchTerm));

        if (matches.length === 0) {
          setError(`Nenhum Pokémon encontrado com "${text}".`);
          setPokemons([]);
          setLoading(false);
          return;
        }

        // 2. Pega apenas os primeiros 20 resultados para não travar
        const topMatches = matches.slice(0, 20);
        const urls = topMatches.map(p => p.url);

        // 3. Busca os detalhes visuais desses 20
        const details = await PokeApi.getManyDetails(urls);
        setPokemons(details);

      } catch (err: any) {
        setError('Erro na busca.');
        setPokemons([]); 
      } finally {
        setLoading(false);
      }
    }, 200); // 600ms de debounce para esperar você terminar de digitar
  };

  // --- FILTRO POR TIPO ---
  const filterByType = async (type: string) => {
    if (!type) {
      resetList();
      return;
    }
    
    setLoading(true);
    setPokemons([]); 
    setIsFiltering(true);
    setError(null);

    try {
      const data = await PokeApi.getPokemonByType(type.toLowerCase());
      
      const urls = data.results.slice(0, 20).map((p: PokemonBasic) => p.url);
      const details = await PokeApi.getManyDetails(urls);
      
      setPokemons(details);
    } catch (err) {
      setError(`Erro ao carregar tipo ${type}`);
    } finally {
      setLoading(false);
    }
  };

  const resetList = () => {
    setIsFiltering(false);
    setPokemons([]);
    setOffset(0);
    setHasMore(true);
    
    setTimeout(() => {
      isFetching.current = false;
      loadMore();
    }, 100);
  };

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