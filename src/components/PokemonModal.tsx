import React, { useRef, useEffect } from 'react';
import { 
  Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, 
  PanResponder, Animated 
} from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { PokemonDetail } from '../types/pokemon';
import { TYPE_COLORS } from '../utils/colors';

const { height } = Dimensions.get('window');

interface Props {
  visible: boolean;
  pokemon: PokemonDetail | null;
  onClose: () => void;
}

export function PokemonModal({ visible, pokemon, onClose }: Props) {
  const panY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      panY.setValue(0);
    }
  }, [visible]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dy > 5;
      },
      onPanResponderMove: Animated.event(
        [null, { dy: panY }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 150) {
          onClose();
        } else {
          Animated.spring(panY, {
            toValue: 0,
            useNativeDriver: false,
            bounciness: 10
          }).start();
        }
      },
    })
  ).current;

  if (!pokemon) return null;

  const mainType = pokemon.types[0].type.name;
  const color = TYPE_COLORS[mainType] || '#A8A878';
  const formatValue = (value: number) => (value / 10).toString().replace('.', ',');

  const renderStat = (label: string, value: number, max = 255) => {
    const percentage = (value / max) * 100;
    return (
      <View style={styles.statRow} key={label}>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={styles.statValue}>{value}</Text>
        <View style={styles.statBarBackground}>
          <View style={[styles.statBarFill, { width: `${percentage}%`, backgroundColor: color }]} />
        </View>
      </View>
    );
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.dismissArea} onPress={onClose} />

        <Animated.View 
          style={[
            styles.modalContent,
            { transform: [{ translateY: panY }] }
          ]}
        >
          
          {/* --- HEADER --- */}
          <View 
            style={[styles.header, { backgroundColor: color }]}
            {...panResponder.panHandlers}
          >
            <View style={styles.dragHandleContainer}>
              <View style={styles.dragHandle} />
            </View>

            <View style={styles.topRow}>
              <TouchableOpacity onPress={onClose} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                <MaterialIcons name="keyboard-arrow-down" size={32} color="rgba(255,255,255,0.6)" />
              </TouchableOpacity>
              <Text style={styles.id}>#{String(pokemon.id).padStart(3, '0')}</Text>
            </View>

            <View style={styles.nameContainer}>
              <Text style={styles.name}>{pokemon.name}</Text>
              <View style={styles.typeRow}>
                {pokemon.types.map(t => (
                  <View key={t.type.name} style={styles.typePill}>
                    <Text style={styles.typeText}>{t.type.name}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.imageContainer}>
                <Image
                  source={{ uri: pokemon.sprites.other['official-artwork'].front_default }}
                  style={styles.image}
                  contentFit="contain"
                />
            </View>
          </View>

          {/* --- CORPO --- */}
          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            <View style={{ height: 60 }} />

            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Peso</Text>
                <Text style={styles.infoValue}>{formatValue(pokemon.weight)} kg</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Altura</Text>
                <Text style={styles.infoValue}>{formatValue(pokemon.height)} m</Text>
              </View>
            </View>

            <Text style={[styles.sectionTitle, { color }]}>Base Stats</Text>
            {pokemon.stats.map((stat: any) => {
              let name = stat.stat.name
                .replace('special-attack', 'Sp. Atk')
                .replace('special-defense', 'Sp. Def')
                .replace('attack', 'Attack')
                .replace('defense', 'Defense')
                .replace('speed', 'Speed')
                .replace('hp', 'HP');
              return renderStat(name, stat.base_stat);
            })}

            <Text style={[styles.sectionTitle, { color, marginTop: 20 }]}>Habilidades</Text>
            <View style={styles.abilitiesContainer}>
                {pokemon.abilities.map((a: any) => (
                    <View key={a.ability.name} style={styles.abilityBadge}>
                        <Text style={styles.abilityText}>{a.ability.name}</Text>
                    </View>
                ))}
            </View>

            <View style={{ height: 40 }} />
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  dismissArea: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: '#fff',
    height: '92%', 
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: 'hidden',
  },
  
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 0,
    zIndex: 1,
  },
  
  dragHandleContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  dragHandle: {
    width: 40,
    height: 5,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 3,
  },

  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  id: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 20,
    opacity: 0.8,
  },
  nameContainer: {
    marginBottom: 10,
  },
  name: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    textTransform: 'capitalize',
    marginBottom: 5,
  },
  typeRow: {
    flexDirection: 'row',
  },
  typePill: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
  },
  typeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    textTransform: 'capitalize',
  },
  imageContainer: {
    alignItems: 'center',
    zIndex: 10, 
    marginBottom: -50,
  },
  image: {
    width: 240,
    height: 240,
  },

  body: {
    flex: 1,
    paddingHorizontal: 30,
    backgroundColor: '#fff',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginBottom: 30,
    marginTop: 10,
  },
  infoItem: {
    alignItems: 'center',
  },
  infoLabel: {
    color: '#999',
    fontSize: 14,
    marginBottom: 5,
  },
  infoValue: {
    color: '#333',
    fontSize: 22,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statLabel: {
    width: 60,
    color: '#666',
    fontWeight: '600',
    fontSize: 14,
  },
  statValue: {
    width: 35,
    color: '#333',
    fontWeight: 'bold',
    textAlign: 'right',
    marginRight: 10,
  },
  statBarBackground: {
    flex: 1,
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  statBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  abilitiesContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
  },
  abilityBadge: {
      borderWidth: 1,
      borderColor: '#eee',
      backgroundColor: '#fafafa',
      paddingHorizontal: 15,
      paddingVertical: 8,
      borderRadius: 20,
      marginRight: 10,
      marginBottom: 10,
  },
  abilityText: {
      color: '#555',
      textTransform: 'capitalize',
      fontWeight: '600',
  }
});