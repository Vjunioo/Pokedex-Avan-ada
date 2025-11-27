export interface PokemonType {
  slot: number;
  type: {
    name: string;
    url: string;
  };
}

export interface PokemonSprites {
  other: {
    'official-artwork': {
      front_default: string;
    };
  };
}

export interface PokemonStat {
  base_stat: number;
  stat: {
    name: string;
  };
}

export interface PokemonAbility {
  ability: {
    name: string;
  };
}

export interface PokemonBasic {
  name: string;
  url: string;
}

// Interface completa usada nos detalhes e modal
export interface PokemonDetail {
  id: number;
  name: string;
  types: PokemonType[];
  sprites: PokemonSprites;
  weight: number;       // Adicionado
  height: number;       // Adicionado
  stats: PokemonStat[]; 
  abilities: PokemonAbility[]; 
}