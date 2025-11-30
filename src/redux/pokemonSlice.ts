import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { PokemonBasic, PokemonDetail } from '../types/pokemon';
import { PokeApi } from '../api/pokeApi';

interface PokemonState {
  list: PokemonBasic[];
  favorites: PokemonDetail[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  offset: number;
  isFinished: boolean;
}

const initialState: PokemonState = {
  list: [],
  favorites: [],
  status: 'idle',
  error: null,
  offset: 0,
  isFinished: false,
};

export const fetchPokemons = createAsyncThunk(
  'pokemon/fetchPokemons',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { pokemon } = getState() as { pokemon: PokemonState };
      const limit = 20;
      const data = await PokeApi.getPokemonList(limit, pokemon.offset);
      return data.results;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchPokemonsByType = createAsyncThunk(
  'pokemon/fetchByType',
  async (type: string, { rejectWithValue }) => {
    try {
      const data = await PokeApi.getPokemonByType(type);
      return data;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

const pokemonSlice = createSlice({
  name: 'pokemon',
  initialState,
  reducers: {
    resetList(state) {
      state.list = [];
      state.offset = 0;
      state.isFinished = false;
      state.status = 'idle';
    },
    toggleFavorite(state, action: PayloadAction<PokemonDetail>) {
      const index = state.favorites.findIndex(p => p.id === action.payload.id);
      if (index >= 0) {
        state.favorites.splice(index, 1);
      } else {
        state.favorites.push(action.payload);
      }
    },
    // --- NOVO: Lógica para limpar todos os favoritos ---
    clearFavorites(state) {
      state.favorites = [];
    },
    // --------------------------------------------------
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPokemons.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchPokemons.fulfilled, (state, action) => {
        state.status = 'succeeded';
        if (action.payload.length > 0) {
          const newPokemons = action.payload.filter(
            newP => !state.list.some(existingP => existingP.name === newP.name)
          );
          state.list = [...state.list, ...newPokemons];
          state.offset += 20;
        } else {
          state.isFinished = true;
        }
      })
      .addCase(fetchPokemons.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });

    builder
      .addCase(fetchPokemonsByType.pending, (state) => {
        state.status = 'loading';
        state.list = [];
      })
      .addCase(fetchPokemonsByType.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.list = action.payload;
        state.isFinished = true;
      })
      .addCase(fetchPokemonsByType.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

// Não esqueça de adicionar clearFavorites na exportação abaixo:
export const { toggleFavorite, resetList, clearFavorites } = pokemonSlice.actions;
export default pokemonSlice.reducer;