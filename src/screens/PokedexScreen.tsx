import React, { useState, useCallback } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
  Image, 
  Platform,
  Text,
  useWindowDimensions
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Animatable from 'react-native-animatable'; 
import { SafeAreaView } from 'react-native-safe-area-context';

import { usePokedex } from '../hooks/usePokedex';
import { PokemonCard } from '../components/PokemonCard';
import { PokemonCardSkeleton } from '../components/PokemonCardSkeleton';
import { PokemonModal } from '../components/PokemonModal';
import { ExitModal } from '../components/ExitModal';
import { SearchBar } from '../components/SearchBar';

import { PokemonDetail } from '../types/pokemon';
import { getColor, getTypeImage } from '../utils/colors';

const LOGO_IMG = require('../assets/logos/titulo-pokedex.png');
const ERR_PIKACHU_SAD = require('../assets/err/pikachu-sad.png');
const ERR_POKEBALL_EMPTY = require('../assets/err/pokeball-empty.png');
const ERR_PSYDUCK_CONFUSED = require('../assets/err/psyduck-confused.png');
const ERR_SNORLAX_SLEEPING = require('../assets/err/snorlax-sleep.png'); 

const POKEMON_TYPES = [
  'fire', 'water', 'grass', 'electric', 'bug', 'ghost', 'psychic', 
  'dragon', 'fairy', 'ice', 'fighting', 'normal', 'poison', 
  'ground', 'flying', 'rock', 'steel', 'dark'
];

export function PokedexScreen() {
  const navigation = useNavigation<any>();
  const { width } = useWindowDimensions();

  const numColumns = width > 1000 ? 4 : width > 700 ? 3 : 2;

  const { 
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
  } = usePokedex();

  const [selectedPokemon, setSelectedPokemon] = useState<PokemonDetail | null>(null);
  const [showExitModal, setShowExitModal] = useState(false);
  
  const [showOfflineBanner, setShowOfflineBanner] = useState(isOffline && pokemons.length > 0);

  React.useEffect(() => {
    if (isOffline && pokemons.length > 0) {
      setShowOfflineBanner(true);
    } 
    else if (!isOffline || pokemons.length === 0) {
      setShowOfflineBanner(false);
    }
  }, [isOffline, pokemons.length]);

  const loadingSkeletons = Array(12).fill(0);

  const handleSearch = (text: string) => {
    searchPokemon(text);
  };

  const handleTypePress = (type: string) => {
    if (activeFilterType === type) {
      resetList();
    } else {
      filterByType(type);
    }
  };

  const handleCardPress = useCallback((pokemon: PokemonDetail) => {
    setSelectedPokemon(pokemon);
  }, []);

  const handleBackPress = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      setShowExitModal(true);
    }
  };

  const confirmExit = () => {
    setShowExitModal(false);
    navigation.navigate('Welcome');
  };
  
  const getOfflineBannerContent = () => {
    return { 
      image: ERR_SNORLAX_SLEEPING, 
      title: 'Modo Offline Ativado', 
      desc: 'Os dados exibidos podem estar desatualizados. Use por sua conta e risco, pois o carregamento de novas imagens ou detalhes pode falhar.',
      buttonText: 'Entendi, continuar offline'
    };
  };

  const getErrorContent = () => {
    const errString = error || '';
    
    if (errString.includes('Nenhum') || errString.includes('encontrado')) {
      return { 
        image: ERR_POKEBALL_EMPTY, 
        title: 'Nada por aqui...', 
        desc: 'Não encontramos nenhum Pokémon com esse nome.',
        buttonText: 'Limpar Busca'
      };
    }
    
    if (errString.includes('conexão') || isOffline) {
      return { 
        image: ERR_PIKACHU_SAD, 
        title: 'Sem Conexão', 
        desc: 'Verifique sua internet para carregar os dados ou o cache.',
        buttonText: 'Tentar Novamente'
      };
    }
    
    return { 
      image: ERR_PSYDUCK_CONFUSED, 
      title: 'Ops, que confuso!', 
      desc: errString || 'Ocorreu um erro inesperado.',
      buttonText: 'Tentar Novamente'
    };
  };

  const errorContent = getErrorContent();
  const offlineBannerContent = getOfflineBannerContent();

  const renderItem = useCallback(({ item, index }: { item: PokemonDetail, index: number }) => (
    <Animatable.View 
      animation="fadeInUp" 
      duration={500} 
      delay={index % 10 * 50} 
      useNativeDriver
      style={{ flex: 1, margin: 6 }}
    >
      <PokemonCard pokemon={item} onPress={handleCardPress} />
    </Animatable.View>
  ), [handleCardPress]);

  const renderSkeleton = useCallback(() => (
    <View style={{ flex: 1, margin: 6 }}>
       <PokemonCardSkeleton />
    </View>
  ), []);

  const renderFilterItem = ({ item }: { item: string }) => {
    const isActive = activeFilterType === item;
    const pillColor = getColor(item); 
    const typeIcon = getTypeImage(item);
    
    return (
      <TouchableOpacity 
        style={[
          styles.filterItem, 
          isActive 
            ? { backgroundColor: pillColor, borderColor: pillColor, elevation: 2 } 
            : { backgroundColor: '#F2F2F2', borderColor: '#e0e0e0' }
        ]} 
        onPress={() => handleTypePress(item)}
        activeOpacity={0.7}
      >
        <Image 
          source={typeIcon} 
          style={[
            styles.filterIcon, 
            { tintColor: isActive ? '#FFF' : pillColor }
          ]}
          resizeMode="contain"
        />
        <Text style={[
          styles.filterText, 
          { color: isActive ? '#fff' : '#666' }
        ]}>
          {item.charAt(0).toUpperCase() + item.slice(1)}
        </Text>
      </TouchableOpacity>
    );
  };

  const showSkeletons = loading && pokemons.length === 0;
  const showList = !showSkeletons && pokemons.length > 0;
  const showEmpty = !loading && pokemons.length === 0 && !error;
  const showError = !loading && pokemons.length === 0 && !!error;

  return (
    <View style={styles.mainBackground}>
      <StatusBar barStyle="light-content" backgroundColor="#D83021" translucent />
      
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        {Platform.OS !== 'web' && <View style={styles.statusBarBackground} />}

        <View style={styles.headerContainer}>
          <View style={styles.contentConstrainer}>
            
            <View style={styles.topBar}>
                <TouchableOpacity 
                  onPress={handleBackPress} 
                  style={styles.iconButton}
                  hitSlop={{top: 15, bottom: 15, left: 15, right: 15}}
                >
                  <MaterialIcons name="arrow-back" size={28} color="#FFF" />
                </TouchableOpacity>
                
                <Image 
                  source={LOGO_IMG} 
                  style={styles.headerLogo} 
                  resizeMode="contain" 
                />
                
                <TouchableOpacity 
                  onPress={() => navigation.navigate('Favorites')}
                  style={styles.iconButton}
                  hitSlop={{top: 15, bottom: 15, left: 15, right: 15}}
                >
                  <MaterialIcons name="favorite" size={28} color="#FFF" />
                </TouchableOpacity>
            </View>

            <View style={styles.searchSection}>
              <SearchBar 
                onSearch={handleSearch} 
                fetchSuggestions={fetchSuggestions} 
              />
            </View>

          </View>
        </View>

        <View style={styles.bodyContainer}>
          <View style={[styles.contentConstrainer, { flex: 1 }]}>
            
            {showOfflineBanner && (
              <Animatable.View 
                animation="slideInDown" 
                duration={400} 
                style={styles.offlineBanner}
              >
                <View style={styles.offlineTextContainer}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                    <MaterialIcons name="cloud-off" size={20} color="#D83021" />
                    <Text style={styles.offlineTitle}> {offlineBannerContent.title}</Text>
                  </View>
                  <Text style={styles.offlineDesc}>{offlineBannerContent.desc}</Text>
                </View>
                <TouchableOpacity 
                  onPress={() => setShowOfflineBanner(false)} 
                  style={styles.offlineCloseButton}
                  hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
                >
                  <MaterialIcons name="close" size={20} color="#666" />
                </TouchableOpacity>
              </Animatable.View>
            )}

            <View 
              style={[
                styles.filtersWrapper, 
                // A lógica dinâmica foi movida para cá
                showOfflineBanner && { marginTop: 0 } 
              ]}
            >
              <FlatList
                data={POKEMON_TYPES}
                horizontal
                showsHorizontalScrollIndicator={false}
                renderItem={renderFilterItem}
                keyExtractor={(item) => item}
                contentContainerStyle={{ paddingHorizontal: 10 }}
                keyboardShouldPersistTaps="handled"
              />
            </View>

            <View style={styles.listContainer}>
              
              {showSkeletons && (
                <FlatList
                  key={`skeleton-${numColumns}`} 
                  data={loadingSkeletons}
                  keyExtractor={(_, index) => `skeleton-${index}`}
                  renderItem={renderSkeleton}
                  numColumns={numColumns} 
                  columnWrapperStyle={{ gap: 12 }} 
                  contentContainerStyle={styles.listContent}
                  showsVerticalScrollIndicator={false}
                />
              )}

              {showList && (
                <FlatList
                  key={`list-${numColumns}`} 
                  data={pokemons}
                  keyExtractor={(item) => String(item.id)}
                  renderItem={renderItem}
                  numColumns={numColumns} 
                  columnWrapperStyle={{ gap: 12 }} 
                  contentContainerStyle={styles.listContent}
                  onEndReached={loadMore}
                  onEndReachedThreshold={0.5}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  ListFooterComponent={
                    loading ? (
                      <ActivityIndicator size="large" color="#D83021" style={{ margin: 20 }} />
                    ) : <View style={{ height: 60 }} />
                  }
                />
              )}

              {showError && (
                <View style={styles.centerState}>
                  <Animatable.Image 
                    animation="tada"
                    iterationCount={1}
                    source={errorContent.image}
                    style={styles.errorImage} 
                    resizeMode="contain"
                  />
                  <Text style={styles.errorTitle}>{errorContent.title}</Text>
                  <Text style={styles.errorDesc}>{errorContent.desc}</Text>
                  <TouchableOpacity onPress={() => resetList()} style={styles.retryButton}>
                    <Text style={styles.retryText}>{errorContent.buttonText}</Text>
                  </TouchableOpacity>
                </View>
              )}

              {showEmpty && (
                <View style={styles.centerState}>
                  <Text style={styles.emptyText}>Nenhum Pokémon encontrado.</Text>
                  <TouchableOpacity onPress={() => resetList()} style={[styles.retryButton, { marginTop: 10, backgroundColor: '#999' }]}>
                    <Text style={styles.retryText}>Limpar Busca</Text>
                  </TouchableOpacity>
                </View>
              )}

            </View>
          </View>
        </View>

        <PokemonModal 
          visible={!!selectedPokemon} 
          pokemon={selectedPokemon}
          onClose={() => setSelectedPokemon(null)}
          onSelectPokemon={(newPokemon) => setSelectedPokemon(newPokemon)}
        />

        <ExitModal 
          visible={showExitModal}
          onConfirm={confirmExit}
          onCancel={() => setShowExitModal(false)}
        />

      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainBackground: {
    flex: 1,
    backgroundColor: '#fff', 
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF', 
  },
  contentConstrainer: {
    width: '100%',
    maxWidth: 800,
    alignSelf: 'center',
  },
  statusBarBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100, 
    backgroundColor: '#D83021', 
    zIndex: 0,
  },
  headerContainer: {
    backgroundColor: '#D83021', 
    paddingBottom: 40,
    paddingTop: Platform.OS === 'android' ? 30 : 20,
    borderBottomLeftRadius: 32, 
    borderBottomRightRadius: 32, 
    zIndex: 100,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
    width: '100%',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  iconButton: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.2)', 
    borderRadius: 12,
  },
  headerLogo: {
    width: 160, 
    height: 60,
  },
  searchSection: {
    paddingHorizontal: 24,
    marginTop: 20,
    zIndex: 101,
  },
  bodyContainer: {
    flex: 1,
    backgroundColor: '#FFF',
    width: '100%',
    zIndex: 1,
  },
  offlineBanner: {
    backgroundColor: '#FFEBEE', 
    borderWidth: 1,
    borderColor: '#EF9A9A',
    borderRadius: 12,
    marginHorizontal: 15,
    marginTop: 15,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  offlineTextContainer: {
    flex: 1,
    flexDirection: 'column',
    marginRight: 10,
  },
  offlineTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#D83021',
  },
  offlineDesc: {
    fontSize: 13,
    color: '#666',
  },
  offlineCloseButton: {
    padding: 4,
  },
  filtersWrapper: {
    height: 50,
    marginTop: 15, // Valor padrão estático
    marginBottom: 5,
  },
  filterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    height: 38,
  },
  filterIcon: {
    width: 18,
    height: 18,
    marginRight: 8,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
  },
  listContainer: {
    flex: 1, 
    backgroundColor: '#fff', 
  },
  listContent: {
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 20,
  },
  columnWrapper: {
    justifyContent: 'space-between', 
  },
  centerState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
    padding: 20,
  },
  errorImage: {
    width: 150,
    height: 150,
    marginBottom: 20,
    opacity: 0.8,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#313131',
    marginBottom: 8,
  },
  errorDesc: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 40,
  },
  retryButton: {
    backgroundColor: '#D83021',
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 25,
    elevation: 4,
    shadowColor: '#D83021',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  retryText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  emptyText: {
    color: '#999',
    fontSize: 16,
    fontWeight: '500',
    marginTop: 20,
  },
});