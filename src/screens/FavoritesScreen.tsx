import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Image,
  Platform,
  useWindowDimensions
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Animatable from 'react-native-animatable';
import { SafeAreaView as SafeAreaContext } from 'react-native-safe-area-context';

import { useAppSelector, useAppDispatch } from '../redux/hooks';
import { clearFavorites } from '../redux/pokemonSlice';

import { PokemonCard } from '../components/PokemonCard';
import { PokemonModal } from '../components/PokemonModal';
import { ClearFavoritesModal } from '../components/ClearFavoritesModal'; // <--- IMPORTADO
import { PokemonDetail } from '../types/pokemon';


const EMPTY_LIST_IMG = require('../assets/err/pokeball-empty.png'); 

export function FavoritesScreen() {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  
  const { width } = useWindowDimensions();
  const numColumns = width > 1000 ? 4 : width > 700 ? 3 : 2;

  const favorites = useAppSelector(state => state.pokemon.favorites);
  const [selectedPokemon, setSelectedPokemon] = useState<PokemonDetail | null>(null);
  
 
  const [showClearModal, setShowClearModal] = useState(false);

  const handleCardPress = useCallback((pokemon: PokemonDetail) => {
    setSelectedPokemon(pokemon);
  }, []);

 
  const handleTrashPress = () => {
    if (favorites.length > 0) {
      setShowClearModal(true);
    }
  };

 
  const confirmClear = () => {
    dispatch(clearFavorites());
    setShowClearModal(false);
  };

  const renderItem = useCallback(({ item, index }: { item: PokemonDetail, index: number }) => (
    <Animatable.View 
      animation="fadeInUp" 
      duration={600} 
      delay={index * 100}
      useNativeDriver
      style={{ flex: 1, margin: 6 }} 
    >
      <PokemonCard pokemon={item} onPress={handleCardPress} />
    </Animatable.View>
  ), [handleCardPress]);

  return (
    <View style={styles.mainBackground}>
      <StatusBar barStyle="light-content" backgroundColor="#D83021" translucent />
      
      <View style={styles.webContainer}>
        <SafeAreaContext style={styles.safeArea} edges={['top', 'left', 'right']}>
          
          {Platform.OS !== 'web' && <View style={styles.statusBarBackground} />}

          <View style={styles.headerContainer}>
            <View style={styles.contentConstrainer}>
              <View style={styles.topBar}>
                <TouchableOpacity 
                    onPress={() => navigation.goBack()} 
                    style={styles.iconButton}
                    hitSlop={{top: 15, bottom: 15, left: 15, right: 15}}
                >
                    <MaterialIcons name="arrow-back" size={28} color="#FFF" />
                </TouchableOpacity>
                
                <View style={styles.titleContainer}>
                  <Text style={styles.headerTitle}>Favoritos</Text>
                  <Text style={styles.headerSubtitle}>
                    {favorites.length} {favorites.length === 1 ? 'Pokémon' : 'Pokémons'}
                  </Text>
                </View>
                
                {favorites.length > 0 ? (
                  <TouchableOpacity 
                    onPress={handleTrashPress} // Abre o modal customizado
                    style={[styles.iconButton, { backgroundColor: 'rgba(255,0,0,0.2)' }]}
                    hitSlop={{top: 15, bottom: 15, left: 15, right: 15}}
                  >
                    <MaterialIcons name="delete-outline" size={28} color="#FFF" />
                  </TouchableOpacity>
                ) : (
                  <View style={{width: 44}} />
                )}
              </View>
            </View>
          </View>

        
          <View style={styles.bodyContainer}>
            <View style={[styles.contentConstrainer, { flex: 1 }]}>
              
              {favorites.length === 0 ? (
                <Animatable.View animation="fadeIn" style={styles.emptyState}>
                  <Image 
                    source={EMPTY_LIST_IMG}
                    style={styles.emptyImage}
                    resizeMode="contain"
                  />
                  <Text style={styles.emptyTitle}>Sua mochila está vazia!</Text>
                  <Text style={styles.emptyDesc}>
                    Você ainda não marcou nenhum Pokémon como favorito.
                  </Text>
                </Animatable.View>
              ) : (
                <FlatList
                  key={`fav-list-${numColumns}`}
                  data={favorites}
                  keyExtractor={(item) => String(item.id)}
                  renderItem={renderItem}
                  numColumns={numColumns}
                  columnWrapperStyle={{ gap: 12 }}
                  contentContainerStyle={styles.listContent}
                  showsVerticalScrollIndicator={false}
                />
              )}
            </View>
          </View>

        
          <PokemonModal 
            visible={!!selectedPokemon} 
            pokemon={selectedPokemon}
            onClose={() => setSelectedPokemon(null)}
          />

        
          <ClearFavoritesModal 
            visible={showClearModal}
            onConfirm={confirmClear}
            onCancel={() => setShowClearModal(false)}
          />

        </SafeAreaContext>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainBackground: {
    flex: 1,
    backgroundColor: '#fff', 
  },
  webContainer: {
    flex: 1,
    width: '100%',
    backgroundColor: '#fff', 
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  contentConstrainer: {
    width: '100%',
    maxWidth: 1024,
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
    paddingBottom: 25,
    paddingTop: Platform.OS === 'android' ? 30 : Platform.OS === 'web' ? 20 : 0,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    zIndex: 10,
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
  titleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 2,
  },
  bodyContainer: {
    flex: 1,
    backgroundColor: '#FFF',
    width: '100%',
  },
  listContent: {
    paddingHorizontal: 10,
    paddingTop: 20,
    paddingBottom: 20,
  },
  
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    marginTop: -50,
  },
  emptyImage: {
    width: 120,
    height: 120,
    marginBottom: 20,
    opacity: 0.8,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#313131',
    marginBottom: 10,
  },
  emptyDesc: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});