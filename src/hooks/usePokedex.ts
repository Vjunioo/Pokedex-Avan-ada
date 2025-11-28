import { useState, useEffect, useCallback, useRef } from 'react';
import { PokeApi } from '../api/pokeApi';
import { PokemonBasic, PokemonDetail } from '../types/pokemon';
import { CacheManager } from '../utils/cache';

const BATCH_SIZE = 20; // Definindo o tamanho do lote para consistência

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
      // Alterado para ser mais genérico, pois pode ser erro de conexão.
      setError('Erro ao carregar detalhes.'); 
    }
  };

  const loadMore = useCallback(async () => {
    if (loading) return;

    setLoading(true);
    // Removido o await CacheManager.isOffline() daqui se for usar NetInfo no futuro.
    // Por enquanto, mantendo a chamada original:
    const offline = await CacheManager.isOffline(); 
    setIsOffline(offline);

    try {
      if (isFiltering) {
        if (filteredListQueue.length === 0) {
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
    } catch (err) {
      setError('Falha na conexão.');
    } finally {
      setLoading(false);
    }
  }, [offset, hasMore, isFiltering, filteredListQueue, loading, addPokemonsUnique]);

  const fetchSuggestions = useCallback(async (query: string): Promise<string[]> => {
    // Mantendo a lógica de busca de nomes completa para o filtro e checagem exata
    try {
      let allNames: string[] | null = await CacheManager.get('all_pokemon_names');

      if (!allNames) {
        const data = await PokeApi.getPokemonList(10000, 0); 
        allNames = data.results.map(p => p.name);
        
        await CacheManager.set('all_pokemon_names', allNames);
      }

      const lowerCaseQuery = query.toLowerCase().trim();
      
      // Se a query for vazia, retorna todos os nomes.
      if (lowerCaseQuery.length === 0) {
          return allNames || [];
      }
      
      // Caso contrário, retorna sugestões filtradas.
      const suggestions = (allNames || [])
        .filter(name => name.includes(lowerCaseQuery))
        .slice(0, 10); 

      return suggestions;

    } catch (err) {
      console.error("Erro ao buscar sugestões:", err);
      // Em caso de erro, tenta retornar do cache.
      return await CacheManager.get('all_pokemon_names') || []; 
    }
  }, []);


  const searchPokemon = (text: string) => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    
    const query = text.trim().toLowerCase();
    
    if (!query) {
      resetList();
      return;
    }

    setIsFiltering(true); 
    setHasMore(true);

    searchTimeout.current = setTimeout(async () => {
      setLoading(true);
      setPokemons([]);
      setFilteredListQueue([]);
      setError(null);
      
      try {
        const allNames = await fetchSuggestions(''); 
        const isExactMatch = allNames.some(name => name === query);

        if (isExactMatch) {
          // --- MODO MODIFICADO: BUSCA EXATA (Incluindo variações) ---
          
          let formsList: PokemonBasic[] = [];
          try {
              // Assumindo que 'PokeApi.getPokemonForms(query)' busca todas as formas (Base + variações)
              formsList = await PokeApi.getPokemonForms(query);
              
              // Garante que a forma base (ex: 'pikachu') venha primeiro na lista.
              formsList.sort((a, b) => {
                  if (a.name === query) return -1; // Coloca o nome base primeiro
                  if (b.name === query) return 1;
                  return 0;
              });

          } catch (formError) {
              console.warn(`Falha ao buscar formas para ${query}. Buscando apenas o base.`);
              // Se a busca de formas falhar, busca apenas o Pokémon original.
              formsList = [{ name: query, url: `https://pokeapi.co/api/v2/pokemon/${query}/` }];
          }

          if (formsList.length === 0) {
              setError(`Nenhuma forma encontrada para ${query}.`);
              setHasMore(false);
              return;
          }

          // Transfere os resultados para a fila para carregamento paginado (BATCH_SIZE = 20)
          const firstBatch = formsList.slice(0, BATCH_SIZE);
          const remaining = formsList.slice(BATCH_SIZE);

          setFilteredListQueue(remaining);
          await fetchDetailsForList(firstBatch);
          
          if (remaining.length === 0) setHasMore(false);
          
        } else {
          // --- MODO ORIGINAL: BUSCA PARCIAL (Filtro) ---
          
          const matchingNames = (allNames || [])
            .filter(name => name.includes(query));

          if (matchingNames.length === 0) {
            setError('Nenhum Pokémon encontrado com este nome.');
            setHasMore(false);
            return;
          }

          const basicList: PokemonBasic[] = matchingNames.map(name => ({ 
              name, 
              url: `https://pokeapi.co/api/v2/pokemon/${name}/` 
          }));

          const firstBatch = basicList.slice(0, BATCH_SIZE);
          const remaining = basicList.slice(BATCH_SIZE);
          
          setFilteredListQueue(remaining);
          await fetchDetailsForList(firstBatch);

          if (remaining.length === 0) setHasMore(false);
        }
      } catch (err) {
        // Se a busca exata falhar E a lista parcial for zero, ou qualquer outro erro
        setError('Ocorreu um erro na busca.');
        setPokemons([]);
        setHasMore(false);
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
      
      const firstBatch = allNamesWithType.slice(0, BATCH_SIZE);
      const remaining = allNamesWithType.slice(BATCH_SIZE);

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
        PokeApi.getPokemonList(BATCH_SIZE, 0).then(data => {
             fetchDetailsForList(data.results);
             setOffset(BATCH_SIZE);
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
    resetList,
    fetchSuggestions,
  };
}