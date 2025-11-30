// src/utils/aliases.ts

export const POKEMON_ALIASES: Record<string, string> = {
  'bulbizarre': 'bulbasaur', 'bisasam': 'bulbasaur', 'fushigidane': 'bulbasaur', 'бульбазавр': 'bulbasaur',
  'ivysaur': 'ivysaur', 'herbizarre': 'ivysaur', 'fushigisou': 'ivysaur', 'ивизавр': 'ivysaur',
  'venusaur': 'venusaur', 'florizarre': 'venusaur', 'fushigibana': 'venusaur', 'венузавр': 'venusaur',

  'charmander': 'charmander', 'salameche': 'charmander', 'glumanda': 'charmander', 'hitokage': 'charmander', 'чармандер': 'charmander',
  'charmeleon': 'charmeleon', 'reptincel': 'charmeleon', 'lizardo': 'charmeleon', 'чармелеон': 'charmeleon',
  'charizard': 'charizard', 'dracaufeu': 'charizard', 'glurak': 'charizard', 'чаризард': 'charizard',

  'squirtle': 'squirtle', 'carapuce': 'squirtle', 'schiggy': 'squirtle', 'zenigame': 'squirtle', 'сквиртл': 'squirtle',
  'wartortle': 'wartortle', 'carabaffe': 'wartortle', 'turtok': 'wartortle', 'вартортл': 'wartortle',
  'blastoise': 'blastoise', 'tortank': 'blastoise', 'бластойз': 'blastoise',

  'pikachu': 'pikachu', 'pikachuu': 'pikachu', 'пикачу': 'pikachu',
  'raichu': 'raichu', 'райчу': 'raichu',

  'jigglypuff': 'jigglypuff', 'rondoudou': 'jigglypuff', 'ぷりん': 'jigglypuff', 'парасель': 'jigglypuff',
  'wigglytuff': 'wigglytuff', 'grodoudou': 'wigglytuff', 'プリン': 'wigglytuff', 'вигиатф': 'wigglytuff',

  'meowth': 'meowth', 'miau': 'meowth', 'nyarth': 'meowth', 'ニャース': 'meowth', 'миаут': 'meowth',
  'persian': 'persian', 'fukano': 'persian', 'ペルシアン': 'persian', 'персиан': 'persian',

  'psyduck': 'psyduck', 'psykokwak': 'psyduck', 'コダック': 'psyduck', 'псидак': 'psyduck',
  'golduck': 'golduck', 'ゴルダック': 'golduck', 'голдак': 'golduck',

  'snorlax': 'snorlax', 'ronflex': 'snorlax', 'relaxo': 'snorlax', 'カビゴン': 'snorlax', 'снорлакс': 'snorlax',

  'eevee': 'eevee', 'évoli': 'eevee', 'イーブイ': 'eevee', 'эвиви': 'eevee',
  'vaporeon': 'vaporeon', 'aquali': 'vaporeon', 'シャワーズ': 'vaporeon', 'вапореон': 'vaporeon',
  'jolteon': 'jolteon', 'voltali': 'jolteon', 'サンダース': 'jolteon', 'джолтеон': 'jolteon',
  'flareon': 'flareon', 'pyroli': 'flareon', 'ブースター': 'flareon', 'флареон': 'flareon',

  'mew': 'mew', 'ミュウ': 'mew', 'мью': 'mew',
  'mewtwo': 'mewtwo', 'ミュウツー': 'mewtwo', 'мьюту': 'mewtwo',
};

export const resolvePokemonName = (text: string): string => {
  const lowerText = text.toLowerCase().trim();
  return POKEMON_ALIASES[lowerText] || lowerText;
};
