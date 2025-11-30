import React, { memo, useState } from 'react'; 
import { 
  TouchableOpacity, 
  View, 
  Text, 
  StyleSheet, 
  Image 
} from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { createShimmerPlaceholder } from 'react-native-shimmer-placeholder';

import { PokemonDetail } from '../types/pokemon';
import { getGradient, getTypeImage } from '../utils/colors';

const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);

interface Props {
  pokemon: PokemonDetail;
  onPress: (pokemon: PokemonDetail) => void;
}

export const PokemonCard = memo(({ pokemon, onPress }: Props) => {
  const mainType = pokemon.types[0]?.type.name;
  const colors = getGradient(mainType);
  const typeBgImage = getTypeImage(mainType);

  const [hasError, setHasError] = useState(false);

  return (
    <TouchableOpacity 
      activeOpacity={0.8} 
      onPress={() => onPress(pokemon)}
      style={styles.wrapper} 
    >
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <View style={styles.bgIconContainer}>
            <Image 
                source={typeBgImage} 
                style={styles.bgIcon} 
                resizeMode="contain"
            />
        </View>

        <View style={styles.topRow}>
            <Text style={styles.name} numberOfLines={1}>{pokemon.name}</Text>
            <Text style={styles.id}>#{String(pokemon.id).padStart(3, '0')}</Text>
        </View>

        <View style={styles.contentRow}>
          <View style={styles.typesCol}>
            {pokemon.types.map((t) => (
              <View key={t.type.name} style={styles.pill}>
                <Text style={styles.typeText}>{t.type.name}</Text>
              </View>
            ))}
          </View>
         
          {hasError ? (
            <ShimmerPlaceholder 
              style={styles.imageSkeletonFallback}
              shimmerColors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.5)', 'rgba(255,255,255,0.2)']}
            />
          ) : (
            <ExpoImage
              source={{ uri: pokemon.sprites.other['official-artwork'].front_default }}
              style={styles.image}
              contentFit="contain"
              transition={200}
              onError={() => setHasError(true)}
            />
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    marginBottom: 12,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
  },
  card: {
    borderRadius: 19,
    padding: 14,
    height: 110,
    overflow: 'hidden',
    position: 'relative',
  },
  bgIconContainer: {
    position: 'absolute',
    right: -10,
    bottom: -10,
    width: 100,
    height: 100,
    zIndex: 0,
    opacity: 0.15,
  },
  bgIcon: {
    width: '100%',
    height: '100%',
    tintColor: 'white',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
    zIndex: 1,
  },
  name: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 15,
    textTransform: 'capitalize',
    flex: 1,
    marginRight: 4
  },
  id: {
    color: 'rgba(255,255,255,0.6)',
    fontWeight: 'bold',
    fontSize: 12,
  },
  contentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flex: 1,
    alignItems: 'center',
    zIndex: 1, 
  },
  typesCol: {
    alignItems: 'flex-start',
  },
  pill: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    marginBottom: 4,
  },
  typeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  image: {
    width: 75,
    height: 75,
    marginBottom: -8, 
    marginRight: -5,
    zIndex: 2, 
  },
  imageSkeletonFallback: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginBottom: -5,
    marginRight: -5,
    opacity: 0.5
  }
});
