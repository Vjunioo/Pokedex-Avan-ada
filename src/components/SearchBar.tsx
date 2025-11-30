import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Text,
  Keyboard,
  Platform,
  ActivityIndicator
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';

interface SearchBarProps {
  onSearch: (text: string) => void; // Dispara a busca final
  fetchSuggestions: (text: string) => Promise<string[]>; // Função que busca nomes
}

export function SearchBar({ onSearch, fetchSuggestions }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const searchTimeout = useRef<any>(null);

  // Função chamada a cada letra digitada
  const handleChangeText = (text: string) => {
    setQuery(text);

    // Debounce: Espera 300ms antes de buscar sugestões para não travar
    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    if (text.length > 1) {
      setIsLoading(true);
      searchTimeout.current = setTimeout(async () => {
        const results = await fetchSuggestions(text);
        setSuggestions(results);
        setIsLoading(false);
      }, 300);
    } else {
      setSuggestions([]);
      setIsLoading(false);
    }
  };

  // Quando o usuário escolhe uma sugestão ou aperta Enter
  const handleSubmit = (text: string) => {
    setQuery(text);
    setSuggestions([]); // Esconde a lista
    Keyboard.dismiss(); // Fecha o teclado
    onSearch(text); // Avisa o pai para filtrar
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    onSearch(''); // Reseta a lista principal
  };

  return (
    <View style={styles.container}>
      {/* Input de Texto */}
      <View style={styles.inputWrapper}>
        <MaterialIcons name="search" size={24} color="#D83021" style={styles.icon} />
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={handleChangeText}
          placeholder="Nome ou número"
          placeholderTextColor="#999"
          onSubmitEditing={() => handleSubmit(query)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            // Pequeno delay para permitir o clique na lista antes de fechar
            setTimeout(() => setIsFocused(false), 200);
          }}
          autoCapitalize="none"
          returnKeyType="search"
        />
        {isLoading ? (
          <ActivityIndicator size="small" color="#D83021" style={styles.rightIcon} />
        ) : query.length > 0 ? (
          <TouchableOpacity onPress={handleClear} style={styles.rightIcon}>
            <MaterialIcons name="close" size={20} color="#999" />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Lista de Sugestões (Dropdown Flutuante) */}
      {suggestions.length > 0 && isFocused && (
        <Animatable.View animation="fadeInDown" duration={200} style={styles.dropdown}>
          {suggestions.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.suggestionItem}
              onPress={() => handleSubmit(item)}
            >
              <MaterialIcons name="history" size={20} color="#ccc" style={{ marginRight: 10 }} />
              <Text style={styles.suggestionText}>
                {item.charAt(0).toUpperCase() + item.slice(1)}
              </Text>
              <MaterialIcons name="north-west" size={16} color="#ccc" />
            </TouchableOpacity>
          ))}
        </Animatable.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    zIndex: 100, 
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 25,
    height: 50,
    paddingHorizontal: 15,
    elevation: 8, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    zIndex: 101, 
  },
  icon: {
    marginRight: 10,
  },
  rightIcon: {
    padding: 5,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: '#313131',
    ...Platform.select({
      web: { outlineStyle: 'none' as any }
    })
  },
  dropdown: {
    position: 'absolute',
    top: 60, 
    left: 10,
    right: 10,
    backgroundColor: '#FFF',
    borderRadius: 15,
    paddingVertical: 10,
    elevation: 10, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    zIndex: 100,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  suggestionText: {
    flex: 1,
    fontSize: 15,
    color: '#444',
  }
});