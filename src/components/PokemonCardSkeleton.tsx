// src/components/PokemonCardSkeleton.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native'; 
import { LinearGradient } from 'expo-linear-gradient';
import { createShimmerPlaceholder } from 'react-native-shimmer-placeholder';

const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);

export const PokemonCardSkeleton = () => {
  return (
    // Agora usa flex: 1 para preencher a coluna do FlatList, igual ao Card real
    <View style={styles.wrapper}> 
      <View style={styles.card}>
        <View style={styles.topRow}>
          <ShimmerPlaceholder 
            style={styles.namePlaceholder}
            shimmerColors={['#E0E0E0', '#F5F5F5', '#E0E0E0']}
          />
          <ShimmerPlaceholder 
            style={styles.idPlaceholder}
            shimmerColors={['#E0E0E0', '#F5F5F5', '#E0E0E0']}
          />
        </View>

        <View style={styles.contentRow}>
          <View style={styles.typesCol}>
            <ShimmerPlaceholder 
              style={styles.typePlaceholder}
              shimmerColors={['#E0E0E0', '#F5F5F5', '#E0E0E0']}
            />
            <ShimmerPlaceholder 
              style={[styles.typePlaceholder, { width: 40, marginTop: 4 }]}
              shimmerColors={['#E0E0E0', '#F5F5F5', '#E0E0E0']}
            />
          </View>
          
          <ShimmerPlaceholder 
            style={styles.imagePlaceholder}
            shimmerColors={['#E0E0E0', '#F5F5F5', '#E0E0E0']}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1, // Ocupa todo o espaço disponível na coluna
    marginBottom: 12,
    borderRadius: 15,
    backgroundColor: '#fff',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    overflow: 'hidden'
  },
  card: {
    padding: 12,
    height: 110,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10
  },
  namePlaceholder: {
    width: '60%',
    height: 16,
    borderRadius: 4,
  },
  idPlaceholder: {
    width: '20%',
    height: 12,
    borderRadius: 4,
  },
  contentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1
  },
  typesCol: {
    flex: 1,
  },
  typePlaceholder: {
    width: 60,
    height: 20,
    borderRadius: 10,
  },
  imagePlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: -5,
    marginBottom: -5
  }
});