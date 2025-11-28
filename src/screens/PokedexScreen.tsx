import React, { useState, useEffect, useCallback } from 'react';
import { 
  StyleSheet, View, Text, FlatList, ActivityIndicator, 
  SafeAreaView, StatusBar, TextInput, TouchableOpacity, Platform,
  Keyboard
} from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons'; 
import { usePokedex } from '../hooks/usePokedex';
import { PokemonDetail } from '../types/pokemon';
import { TYPE_COLORS, DEFAULT_COLOR } from '../utils/colors';
import { PokemonModal } from '../components/PokemonModal';

const MAX_CONTENT_WIDTH = 600; 

const POKEMON_TYPES = [
  'fire', 'water', 'grass', 'electric', 'bug', 'ghost', 'psychic', 
  'dragon', 'fairy', 'ice', 'fighting', 'normal', 'poison', 
  'ground', 'flying', 'rock', 'steel', 'dark'
];

interface Props {
  onBack: () => void;
}

export function PokedexScreen({ onBack }: Props) {
  const { 
    pokemons, 
    loading, 
    error, 
    isOffline, 
    loadMore, 
    searchPokemon, 
    filterByType, 
    resetList,
    fetchSuggestions, 
  } = usePokedex();

  const [searchText, setSearchText] = useState('');
  const [activeType, setActiveType] = useState<string | null>(null);
  const [selectedPokemon, setSelectedPokemon] = useState<PokemonDetail | null>(null);
  
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (searchText.length > 2) {
      const timer = setTimeout(async () => {
        try {
          const names = await fetchSuggestions(searchText);
          setSuggestions(names);
          setShowSuggestions(true);
        } catch (e) {
          setSuggestions([]);
        }
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchText, fetchSuggestions]);

  const handleSearchAction = (text: string) => {
    setSearchText(text);
    setActiveType(null);
    setShowSuggestions(false);
    Keyboard.dismiss();
    searchPokemon(text);
  }

  const handleSearch = (text: string) => {
    setSearchText(text);
    if (text.length === 0) {
        handleSearchAction('');
    }
  };
  
  const handleSuggestionPress = (name: string) => {
    handleSearchAction(name);
  };


  const handleTypePress = (type: string) => {
    if (activeType === type) {
      setActiveType(null);
      resetList();
    } else {
      setActiveType(type);
      setSearchText('');
      handleSearchAction('');
      filterByType(type);
    }
  };

  const renderCard = ({ item }: { item: PokemonDetail }) => {
    const mainType = item.types[0]?.type.name || 'normal';
    const backgroundColor = TYPE_COLORS[mainType] || DEFAULT_COLOR;

    return (
      <TouchableOpacity 
        activeOpacity={0.8} 
        style={[styles.cardContainer, { backgroundColor }]}
        onPress={() => setSelectedPokemon(item)}
      >
        <View style={styles.cardDecoration} />
        
        <View style={styles.cardInfo}>
          <Text style={styles.pokemonName} numberOfLines={1} adjustsFontSizeToFit>
            {item.name}
          </Text>
          <View style={styles.typesRow}>
            {item.types.map((t, index) => (
              <View key={index} style={styles.typePill}>
                <Text style={styles.typeText}>{t.type.name}</Text>
              </View>
            ))}
          </View>
        </View>

        <Text style={styles.pokemonId}>#{String(item.id).padStart(3, '0')}</Text>

        <Image
          source={{ uri: item.sprites.other['official-artwork'].front_default }}
          style={styles.pokemonImage}
          contentFit="contain"
          transition={300}
        />
      </TouchableOpacity>
    );
  };

  const renderFilterItem = ({ item }: { item: string }) => {
    const isActive = activeType === item;
    const pillColor = TYPE_COLORS[item];
    
    return (
      <TouchableOpacity 
        style={[
          styles.filterItem, 
          isActive 
            ? { backgroundColor: pillColor, borderColor: pillColor, elevation: 5 } 
            : { backgroundColor: '#fff', borderColor: '#eee' }
        ]} 
        onPress={() => handleTypePress(item)}
      >
        {!isActive && <View style={[styles.filterDot, { backgroundColor: pillColor }]} />}
        
        <Text style={[
          styles.filterText, 
          { color: isActive ? '#fff' : '#666', fontWeight: isActive ? 'bold' : '500' }
        ]}>
          {item.charAt(0).toUpperCase() + item.slice(1)}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderSuggestions = () => {
    if (!showSuggestions || suggestions.length === 0) return null;

    return (
      <View style={styles.suggestionsContainer}>
        {suggestions.slice(0, 5).map((name) => (
          <TouchableOpacity 
            key={name} 
            style={styles.suggestionItem}
            onPress={() => handleSuggestionPress(name)}
          >
            <MaterialIcons name="chevron-right" size={20} color="#666" />
            <Text style={styles.suggestionText}>{name.charAt(0).toUpperCase() + name.slice(1)}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f2f4f8" />
      
      <View style={styles.responsiveContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
             <MaterialIcons name="arrow-back" size={28} color="#333" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.appTitle}>Pokédex</Text>
            {isOffline && <Text style={styles.offlineText}>Modo Offline</Text>}
          </View>
          {isOffline ? <MaterialIcons name="wifi-off" size={24} color="#d9534f" /> : null}
        </View>

        <View style={styles.searchSection}>
            <View style={styles.searchContainer}>
            <MaterialIcons name="search" size={24} color="#999" />
            <TextInput 
                style={styles.searchInput}
                placeholder="Buscar Pokémon..."
                value={searchText}
                onChangeText={handleSearch}
                onSubmitEditing={() => handleSearchAction(searchText)}
                onFocus={() => searchText.length > 2 && suggestions.length > 0 && setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholderTextColor="#999"
            />
            {searchText.length > 0 && (
                <TouchableOpacity onPress={() => handleSearchAction('')}>
                <MaterialIcons name="close" size={20} color="#999" />
                </TouchableOpacity>
            )}
            </View>
            {renderSuggestions()}
        </View>


        <View style={styles.filtersWrapper}>
          <FlatList
            data={POKEMON_TYPES}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={renderFilterItem}
            keyExtractor={(item) => item}
            contentContainerStyle={{ paddingHorizontal: 20 }}
            keyboardShouldPersistTaps="handled"
          />
        </View>

        {error && !loading && pokemons.length === 0 ? (
          <View style={styles.centerState}>
            <MaterialIcons name="error-outline" size={60} color="#ff6b6b" />
            <Text style={styles.errorTitle}>Ops, algo deu errado!</Text>
            <Text style={styles.errorDesc}>{error}</Text>
            <TouchableOpacity onPress={() => resetList()} style={styles.retryButton}>
              <Text style={styles.retryText}>Tentar Novamente</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={pokemons}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderCard}
            numColumns={2}
            columnWrapperStyle={styles.columnWrapper}
            contentContainerStyle={styles.listContent}
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={
              loading ? <ActivityIndicator size="large" color="#FF5350" style={{ margin: 30 }} /> : <View style={{ height: 80 }} />
            }
            ListEmptyComponent={
              !loading ? (
                <View style={styles.centerState}>
                  <Text style={styles.emptyText}>Nenhum Pokémon encontrado.</Text>
                </View>
              ) : null
            }
          />
        )}
      </View>

      
      <PokemonModal 
        visible={!!selectedPokemon} 
        pokemon={selectedPokemon}
        onClose={() => setSelectedPokemon(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f2f4f8', alignItems: 'center' },
  responsiveContainer: { flex: 1, width: '100%', maxWidth: MAX_CONTENT_WIDTH, backgroundColor: '#f2f4f8' },
  
  
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: Platform.OS === 'android' ? 40 : 10, paddingBottom: 15 },
  backButton: { padding: 8, marginRight: 10, marginLeft: -8, borderRadius: 20 },
  appTitle: { fontSize: 28, fontWeight: '800', color: '#333', letterSpacing: 0.5 },
  offlineText: { fontSize: 12, color: '#d9534f', fontWeight: '600' },
  
  searchSection: { marginHorizontal: 20, zIndex: 10 }, 

  
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 25, paddingHorizontal: 15, height: 50, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2, marginBottom: 5 },
  searchInput: { flex: 1, fontSize: 16, color: '#333', marginLeft: 10 },
  
  
  suggestionsContainer: { position: 'absolute', top: 55, left: 0, right: 0, backgroundColor: '#fff', borderRadius: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 5, elevation: 3, paddingVertical: 5 },
  suggestionItem: { paddingHorizontal: 15, paddingVertical: 10, flexDirection: 'row', alignItems: 'center' },
  suggestionText: { fontSize: 16, color: '#333', marginLeft: 5, textTransform: 'capitalize' },

 
  filtersWrapper: { height: 40, marginBottom: 15, zIndex: 5 },
  filterItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 8, borderWidth: 1, height: 36 },
  filterDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  filterText: { fontSize: 14 },
  
  
  listContent: { paddingHorizontal: 15, paddingBottom: 20 },
  columnWrapper: { justifyContent: 'space-between' },
  cardContainer: { flex: 1, aspectRatio: 1.4, borderRadius: 20, margin: 6, padding: 12, overflow: 'hidden', shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 6 },
  cardDecoration: { position: 'absolute', bottom: -10, right: -10, width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.2)' },
  cardInfo: { flex: 1 },
  pokemonName: { fontSize: 16, fontWeight: '800', color: '#fff', textTransform: 'capitalize', marginBottom: 6, textShadowColor: 'rgba(0,0,0,0.1)', textShadowRadius: 4 },
  typesRow: { alignItems: 'flex-start' },
  typePill: { backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3, marginBottom: 4 },
  typeText: { color: '#fff', fontSize: 10, fontWeight: '700', textTransform: 'capitalize' },
  pokemonId: { position: 'absolute', right: 10, top: 10, fontSize: 12, fontWeight: '900', color: 'rgba(0,0,0,0.15)' },
  pokemonImage: { width: '55%', height: '55%', position: 'absolute', bottom: 5, right: 5, zIndex: 2 },
  
 
  centerState: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 60, padding: 20 },
  errorTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginTop: 10 },
  errorDesc: { fontSize: 14, color: '#666', textAlign: 'center', marginVertical: 10 },
  retryButton: { backgroundColor: '#FF5350', paddingHorizontal: 25, paddingVertical: 12, borderRadius: 25, marginTop: 10, elevation: 4 },
  retryText: { color: '#fff', fontWeight: 'bold' },
  emptyText: { color: '#999', fontSize: 16, fontWeight: '500' },
});