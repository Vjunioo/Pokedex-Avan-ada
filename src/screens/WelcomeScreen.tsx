import React, { useRef, useEffect } from "react";
import {
  Animated,
  ImageBackground,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
  Image,
  Text,
  Dimensions,
  SafeAreaView,
  Platform
} from "react-native";
import { MaterialIcons } from '@expo/vector-icons';

// --- ASSETS ---
const WALLPAPER_IMG = require('../../assets/background/wallpaper.jpg');
const LOGO_IMG = require('../../assets/logos/titulo.png');
const POKEBALL_ICON = require('../../assets/logos/pokeball.png');

const { height } = Dimensions.get('window');

interface Props {
  onStart: () => void;
}

export function WelcomeScreen({ onStart }: Props) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // CORREÇÃO: Na Web, useNativeDriver deve ser FALSE. No celular, TRUE.
  const useNativeDriver = Platform.OS !== 'web';

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver, 
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver,
        }),
      ])
    ).start();
  }, []);

  const handleStartPress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { 
        toValue: 0.95, // Ajustei para 0.95 para ser mais sutil
        duration: 100, 
        useNativeDriver 
      }),
      Animated.timing(scaleAnim, { 
        toValue: 1, 
        duration: 100, 
        useNativeDriver 
      })
    ]).start(() => {
      onStart();
    });
  };

  return (
    <ImageBackground
      source={WALLPAPER_IMG}
      style={styles.container}
      resizeMode="cover" 
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <View style={styles.overlay}>
        <SafeAreaView style={styles.contentContainer}>
          
          {/* --- HEADER --- */}
          <View style={styles.headerArea}>
            <Image 
              source={LOGO_IMG} 
              style={styles.logo} 
              resizeMode="contain" 
            />
            <Text style={styles.subtitle}>ADVANCED EDITION</Text>
          </View>

          {/* --- BOTÃO --- */}
          <View style={styles.footerArea}>
            <TouchableOpacity
              onPress={handleStartPress}
              activeOpacity={0.9}
              style={{ width: '100%', alignItems: 'center' }} // Garante centralização
            >
              <Animated.View
                style={[
                  styles.button,
                  { 
                    transform: [
                      { scale: scaleAnim }, 
                      { scale: pulseAnim }
                    ] 
                  },
                ]}
              >
                <View style={styles.iconCircle}>
                  <Image 
                    source={POKEBALL_ICON} 
                    style={styles.btnIcon} 
                    resizeMode="contain" 
                  />
                </View>

                <Text 
                  style={styles.buttonText} 
                  numberOfLines={1} 
                  adjustsFontSizeToFit // Texto diminui se a tela for minúscula
                >
                  INICIAR
                </Text>
                
                <MaterialIcons name="chevron-right" size={32} color="#FFF" style={{ opacity: 0.8 }} />
              </Animated.View>
            </TouchableOpacity>

            <Text style={styles.footerText}>Designed for Trainers</Text>
          </View>

        </SafeAreaView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)', 
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'space-between', 
    alignItems: 'center',
    paddingVertical: Platform.OS === 'android' ? 40 : 20,
  },
  
  // --- HEADER ---
  headerArea: {
    marginTop: height * 0.1, 
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
  },
  logo: {
    width: '90%',        // Porcentagem é melhor que width fixo
    maxWidth: 500,       // Trava para não ficar gigante no PC
    height: 250,         
    maxHeight: height * 0.3, // Não ocupa mais que 30% da altura
  },
  subtitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 6, 
    marginTop: -10,   
    opacity: 0.9,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowRadius: 10,
    textShadowOffset: { width: 0, height: 2 },
  },

  // --- FOOTER ---
  footerArea: {
    marginBottom: height * 0.08, 
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#FF5350', 
    
    // --- RESPONSIVIDADE DO BOTÃO ---
    width: '100%',       // Tenta ocupar tudo...
    maxWidth: 400,       // ...mas para em 400px (Fica ótimo no PC e Celular)
    height: 75,
    
    borderRadius: 37.5,
    alignItems: 'center',
    paddingHorizontal: 10,
    
    // Sombras
    shadowColor: '#FF5350',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 20,
    elevation: 15,
    
    // Borda
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  iconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  btnIcon: {
    width: 32,
    height: 32,
  },
  buttonText: {
    flex: 1,
    color: '#FFF',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  footerText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    marginTop: 25,
    letterSpacing: 1,
  },
});