export const TYPE_COLORS: Record<string, string> = {
  normal: '#A8A77A',
  fire: '#FB6C6C',
  water: '#76BDFE',
  electric: '#FFD86F',
  grass: '#48D0B0',
  ice: '#98D8D8',
  fighting: '#C22E28',
  poison: '#A33EA1',
  ground: '#E2BF65',
  flying: '#A98FF3',
  psychic: '#F95587',
  bug: '#A6B91A',
  rock: '#B6A136',
  ghost: '#735797',
  dragon: '#6F35FC',
  dark: '#705746',
  steel: '#B7B7CE',
  fairy: '#D685AD',
};

type GradientColor = [string, string];

export const TYPE_GRADIENTS: Record<string, GradientColor> = {
  bug: ['#8BD674', '#8B931A'],
  dark: ['#6F6E78', '#383636'],
  dragon: ['#7383B9', '#46499C'],
  electric: ['#f6c945', '#E9A608'],
  fairy: ['#EBA8C3', '#D36F94'],
  fighting: ['#EB4971', '#C12239'],
  fire: ['#FA6555', '#F73322'],
  flying: ['#83A2E3', '#5666B0'],
  ghost: ['#8571BE', '#504179'],
  grass: ['#8BBE8A', '#419E63'],
  ground: ['#F78551', '#C45D2E'],
  ice: ['#91D8DF', '#589EA5'],
  normal: ['#B5B9C4', '#7C8191'],
  poison: ['#9F6E97', '#7A4372'],
  psychic: ['#FF6568', '#D63438'],
  rock: ['#D4C294', '#998657'],
  steel: ['#4C91B2', '#345E75'],
  water: ['#58ABF6', '#2868C6'],
};

export const TYPE_IMAGES: Record<string, any> = {
  bug: require('../assets/types/bug.png'),
  dark: require('../assets/types/dark.png'),
  dragon: require('../assets/types/dragon.png'),
  electric: require('../assets/types/electric.png'),
  fairy: require('../assets/types/fairy.png'),
  fighting: require('../assets/types/fighting.png'),
  fire: require('../assets/types/fire.png'),
  flying: require('../assets/types/flying.png'),
  ghost: require('../assets/types/ghost.png'),
  grass: require('../assets/types/grass.png'),
  ground: require('../assets/types/ground.png'),
  ice: require('../assets/types/ice.png'),
  normal: require('../assets/types/normal.png'),
  poison: require('../assets/types/poison.png'),
  psychic: require('../assets/types/psychic.png'),
  rock: require('../assets/types/rock.png'),
  steel: require('../assets/types/steel.png'),
  water: require('../assets/types/water.png'),
};

export const DEFAULT_COLOR = '#A8A878';
export const DEFAULT_GRADIENT: GradientColor = ['#8A8A8A', '#525252'];
export const DEFAULT_TYPE_IMAGE = require('../assets/logos/pokeball.png');

export function getGradient(type?: string): [string, string] {
  const key = type?.toLowerCase() || 'normal';
  return TYPE_GRADIENTS[key] || DEFAULT_GRADIENT;
}

export function getColor(type?: string): string {
  const key = type?.toLowerCase() || 'normal';
  return TYPE_COLORS[key] || DEFAULT_COLOR;
}

export function getTypeImage(type?: string): any {
  const key = type?.toLowerCase() || 'normal';
  return TYPE_IMAGES[key] || DEFAULT_TYPE_IMAGE;
}
