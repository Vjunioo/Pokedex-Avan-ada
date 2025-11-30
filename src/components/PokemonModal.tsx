import React, { useRef, useEffect, useState } from 'react';
import {
  Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView,
  PanResponder, Animated, ActivityIndicator, Image, Platform
} from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';

import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { toggleFavorite } from '../redux/pokemonSlice';

import { PokemonDetail, EvolutionChainResponse, EvolutionChainLink } from '../types/pokemon';
import { TYPE_GRADIENTS, getTypeImage } from '../utils/colors';
import { httpClient } from '../utils/http';
import { PokeApi } from '../api/pokeApi';

interface Props {
  visible: boolean;
  pokemon: PokemonDetail | null;
  onClose: () => void;
  onSelectPokemon?: (pokemon: PokemonDetail) => void; 
}

interface SpeciesResponse {
  flavor_text_entries: { flavor_text: string; language: { name: string } }[];
  genera: { genus: string; language: { name: string } }[];
  evolution_chain: { url: string };
}

interface EvolutionData {
  name: string;
  id: string;
  image: string;
}

export function PokemonModal({ visible, pokemon, onClose, onSelectPokemon }: Props) {
  const panY = useRef(new Animated.Value(0)).current;
  
  const [description, setDescription] = useState<string | null>(null);
  const [category, setCategory] = useState<string>('');
  const [loadingDesc, setLoadingDesc] = useState(false);
  const [evolutions, setEvolutions] = useState<EvolutionData[]>([]);
  const [loadingEvo, setLoadingEvo] = useState(false);

  const dispatch = useAppDispatch();
  const favorites = useAppSelector(state => state.pokemon.favorites);
  const isFavorite = pokemon ? !!favorites.find(p => p.id === pokemon.id) : false;

  const handleToggleFavorite = () => {
    if (pokemon) dispatch(toggleFavorite(pokemon));
  };

  const mainType = pokemon?.types[0]?.type.name ?? 'normal';
  const gradientColors = TYPE_GRADIENTS[mainType] || ['#A8A878', '#6D6D4E'];
  const primaryColor = gradientColors[0];
  const typeBgImage = getTypeImage(mainType);

  useEffect(() => {
    if (visible) {
      panY.setValue(0);
      if (pokemon) {
        fetchSpeciesAndEvolution(pokemon.id);
      }
    } else {
      setDescription(null);
      setCategory('');
      setEvolutions([]);
    }
  }, [visible, pokemon]);

  const fetchSpeciesAndEvolution = async (id: number) => {
    setLoadingDesc(true);
    setLoadingEvo(true);
    try {
      const speciesData = await httpClient<SpeciesResponse>(`https://pokeapi.co/api/v2/pokemon-species/${id}`);
      const entry = speciesData.flavor_text_entries.find(e => e.language.name === 'pt-br') 
                 || speciesData.flavor_text_entries.find(e => e.language.name === 'en');
      const genus = speciesData.genera.find(g => g.language.name === 'en');

      setDescription(entry?.flavor_text.replace(/[\n\f]/g, ' ') ?? "Sem descrição.");
      setCategory(genus?.genus ?? '');

      if (speciesData.evolution_chain?.url) {
        const evoData = await httpClient<EvolutionChainResponse>(speciesData.evolution_chain.url);
        const chain: EvolutionData[] = [];
        
        const traverseChain = (node: EvolutionChainLink) => {
          const urlParts = node.species.url.split('/');
          const speciesId = urlParts[urlParts.length - 2];
          
          chain.push({
            name: node.species.name,
            id: speciesId,
            image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${speciesId}.png`
          });

          if (node.evolves_to.length > 0) {
            node.evolves_to.forEach(child => traverseChain(child));
          }
        };

        traverseChain(evoData.chain);
        setEvolutions(chain);
      }

    } catch (e) {
      setDescription("Descrição indisponível.");
    } finally {
      setLoadingDesc(false);
      setLoadingEvo(false);
    }
  };

  const handleEvolutionPress = async (nameOrId: string) => {
      if (onSelectPokemon) {
          try {
              const newPokemon = await PokeApi.getPokemonDetail(nameOrId);
              onSelectPokemon(newPokemon);
          } catch (e) {
              console.warn("Erro ao carregar evolução");
          }
      }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dy) > 10,
      onPanResponderMove: (_, gestureState) => { if(gestureState.dy > 0) panY.setValue(gestureState.dy); },
      onPanResponderRelease: (_, gestureState) => {
        gestureState.dy > 150 ? onClose() : Animated.spring(panY, { toValue: 0, useNativeDriver: true, bounciness: 8 }).start();
      },
    })
  ).current;

  if (!pokemon) return null;

  const formatValue = (value: number) => (value / 10).toString().replace('.', ',');

  const StatRow = ({ label, value, max = 255 }: { label: string; value: number; max?: number }) => {
    const percentage = Math.min((value / max) * 100, 100);
    return (
      <View style={styles.statRow}>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={styles.statValue}>{value}</Text>
        <View style={styles.statBarBackground}>
          <Animatable.View animation="fadeInLeft" duration={1000} style={[styles.statBarFill, { width: `${percentage}%`, backgroundColor: primaryColor }]} />
        </View>
      </View>
    );
  };

  const InfoItem = ({ label, value }: { label: string; value: string }) => (
    <View style={styles.infoItem}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.dismissArea} onPress={onClose} activeOpacity={1} />
        
        <Animated.View style={[styles.modalContent, { transform: [{ translateY: panY }] }]}>
          <LinearGradient colors={[primaryColor, '#ffffff', '#ffffff']} locations={[0, 0.45, 1]} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} style={{ flex: 1 }}>
            
              <View style={[styles.header, Platform.OS === 'web' && { cursor: 'grab' } as any]} {...panResponder.panHandlers}>
                <View style={styles.headerBgContainer}>
                  <Image source={typeBgImage} style={styles.headerBgImage} resizeMode="contain" />
                </View>
                <View style={styles.dragHandleContainer}><View style={styles.dragHandle} /></View>
                
                <View style={styles.topRow}>
                  <TouchableOpacity onPress={onClose} hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}>
                    <MaterialIcons name="close" size={32} color="rgba(255,255,255,0.9)" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleToggleFavorite}>
                    {isFavorite ? (
                      <Animatable.View animation="rubberBand" duration={500}>
                        <MaterialIcons name="favorite" size={32} color="white" />
                      </Animatable.View>
                    ) : (
                      <MaterialIcons name="favorite-border" size={32} color="rgba(255,255,255,0.8)" />
                    )}
                  </TouchableOpacity>
                </View>

                <View style={styles.nameContainer}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <Text style={styles.name}>{pokemon.name}</Text>
                    <Text style={styles.id}>#{String(pokemon.id).padStart(3, '0')}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
                    <View style={styles.typeRow}>{pokemon.types.map(t => <View key={t.type.name} style={styles.typePill}><Text style={styles.typeText}>{t.type.name}</Text></View>)}</View>
                    {category ? <Text style={styles.categoryText}>{category}</Text> : null}
                  </View>
                </View>
                <View style={styles.imageContainer}>
                  <ExpoImage source={{ uri: pokemon.sprites.other['official-artwork'].front_default ?? '' }} style={styles.image} contentFit="contain" transition={300} />
                </View>
              </View>

              <ScrollView style={styles.body} showsVerticalScrollIndicator={true} contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
                <View style={{ height: 60 }} />
                
                <View style={styles.infoRow}>
                  <InfoItem label="Peso" value={`${formatValue(pokemon.weight)} kg`} />
                  <View style={styles.verticalDivider} />
                  <InfoItem label="Altura" value={`${formatValue(pokemon.height)} m`} />
                  <View style={styles.verticalDivider} />
                  <InfoItem label="Habilidade" value={pokemon.abilities[0]?.ability.name.replace('-', ' ') ?? '-'} />
                </View>

                <View style={styles.descSection}>
                  <Text style={[styles.sectionTitle, { color: primaryColor }]}>Sobre</Text>
                  {loadingDesc ? (
                      <ActivityIndicator size="small" color={primaryColor} style={{ alignSelf: 'flex-start' }} /> 
                  ) : (
                      <Animatable.Text animation="fadeIn" style={styles.descriptionText}>{description}</Animatable.Text>
                  )}
                </View>

                <View style={styles.evoSection}>
                  <Text style={[styles.sectionTitle, { color: primaryColor }]}>Evoluções</Text>
                  {loadingEvo ? (
                      <ActivityIndicator size="small" color={primaryColor} />
                  ) : (
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.evoRow}>
                          {evolutions.map((evo, index) => (
                              <View key={evo.id} style={styles.evoItemWrapper}>
                                  {index > 0 && <MaterialIcons name="arrow-forward" size={20} color="#ccc" style={styles.evoArrow} />}
                                  <TouchableOpacity onPress={() => handleEvolutionPress(evo.name)} style={styles.evoItem}>
                                      <View style={[styles.evoImageBg, { borderColor: evo.id === String(pokemon.id) ? primaryColor : '#eee' }]}>
                                          <ExpoImage source={{ uri: evo.image }} style={styles.evoImage} contentFit="contain" />
                                      </View>
                                      <Text style={[styles.evoName, evo.id === String(pokemon.id) && { color: primaryColor, fontWeight: 'bold' }]}>
                                          {evo.name}
                                      </Text>
                                  </TouchableOpacity>
                              </View>
                          ))}
                      </ScrollView>
                  )}
                </View>

                <Text style={[styles.sectionTitle, { color: primaryColor, marginTop: 20 }]}>Status Base</Text>
                {pokemon.stats.map(stat => {
                  const name = stat.stat.name
                    .replace('special-attack', 'Sp. Atk').replace('special-defense', 'Sp. Def')
                    .replace('attack', 'Attack').replace('defense', 'Defense')
                    .replace('speed', 'Speed').replace('hp', 'HP');
                  return <StatRow key={stat.stat.name} label={name} value={stat.base_stat} />;
                })}
              </ScrollView>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
  dismissArea: { flex: 1 },
  modalContent: { 
    height: '90%', width: '100%', maxWidth: 600, alignSelf: 'center',    
    borderTopLeftRadius: 32, borderTopRightRadius: 32, overflow: 'hidden', 
    shadowColor: "#000", shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.25, shadowRadius: 10, elevation: 10 
  },
  header: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 0, zIndex: 1, position: 'relative' },
  headerBgContainer: { position: 'absolute', top: 50, alignSelf: 'center', opacity: 0.15, zIndex: -1 },
  headerBgImage: { width: 320, height: 320, tintColor: 'white', transform: [{ rotate: '0deg' }] },
  dragHandleContainer: { width: '100%', alignItems: 'center', marginBottom: 10 },
  dragHandle: { width: 48, height: 6, backgroundColor: 'rgba(255,255,255,0.4)', borderRadius: 3 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  id: { color: '#FFF', fontWeight: 'bold', fontSize: 18 },
  nameContainer: { marginBottom: 10, zIndex: 2 },
  name: { fontSize: 34, fontWeight: '800', color: '#fff', textTransform: 'capitalize', letterSpacing: 0.5 },
  typeRow: { flexDirection: 'row' },
  typePill: { backgroundColor: 'rgba(255,255,255,0.3)', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 15, marginRight: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)' },
  typeText: { color: '#fff', fontWeight: '700', fontSize: 12, textTransform: 'capitalize' },
  categoryText: { color: 'rgba(255,255,255,0.9)', fontSize: 14, marginLeft: 5, fontStyle: 'italic' },
  imageContainer: { alignItems: 'center', marginBottom: -50, zIndex: 10, elevation: 20 },
  image: { width: 250, height: 250 },
  body: { flex: 1, paddingHorizontal: 24, backgroundColor: 'transparent' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25, marginTop: 15 },
  infoItem: { alignItems: 'center', flex: 1 },
  verticalDivider: { width: 1, height: '100%', backgroundColor: 'rgba(0,0,0,0.1)' },
  infoLabel: { color: '#666', fontSize: 12, marginBottom: 4, fontWeight: '600' },
  infoValue: { color: '#333', fontSize: 16, fontWeight: 'bold' },
  descSection: { marginBottom: 20 },
  descriptionText: { color: '#444', fontSize: 15, lineHeight: 22, textAlign: 'justify' },
  sectionTitle: { fontSize: 18, fontWeight: '800', marginBottom: 12 },
  evoSection: { marginBottom: 20 },
  evoRow: { alignItems: 'center', paddingVertical: 10 },
  evoItemWrapper: { flexDirection: 'row', alignItems: 'center' },
  evoArrow: { marginHorizontal: 10 },
  evoItem: { alignItems: 'center' },
  evoImageBg: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#f5f5f5', justifyContent: 'center', alignItems: 'center', borderWidth: 2 },
  evoImage: { width: 50, height: 50 },
  evoName: { marginTop: 5, fontSize: 12, color: '#666', textTransform: 'capitalize' },
  statRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  statLabel: { width: 60, color: '#666', fontWeight: '600', fontSize: 13 },
  statValue: { width: 35, color: '#333', fontWeight: 'bold', textAlign: 'right', marginRight: 12 },
  statBarBackground: { flex: 1, height: 6, backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 3, overflow: 'hidden' },
  statBarFill: { height: '100%', borderRadius: 3 },
});
