// src/screens/WelcomeScreen.tsx
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
  Platform,
  Easing
} from "react-native";
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';

type RootStackParamList = {
  Welcome: undefined;
  Pokedex: undefined;
};
type NavigationProps = NativeStackNavigationProp<RootStackParamList, 'Welcome'>;

const WALLPAPER_IMG = require('../assets/background/wallpaper.jpg');
const LOGO_IMG = require('../assets/logos/titulo-pokedex.png');
const POKEBALL_ICON = require('../assets/logos/pokeball.png');

const { width, height } = Dimensions.get('window');

export function WelcomeScreen() {
  const navigation = useNavigation<NavigationProps>();
  
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;

  const useNativeDriver = Platform.OS !== 'web';

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 4000,
        easing: Easing.linear,
        useNativeDriver,
      })
    ).start();
  }, []);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  const handleStartPress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.96, duration: 100, useNativeDriver }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver })
    ]).start(() => {
      navigation.replace('Pokedex');
    });
  };

  return (
    <ImageBackground
      source={WALLPAPER_IMG}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <LinearGradient
        colors={['rgba(0,0,0,0.8)', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.9)']}
        style={styles.gradientOverlay}
      >
        <SafeAreaView style={styles.safeArea}>
         
          <View style={styles.contentConstrainer}>
            
            <View style={styles.contentContainer}>
             
              <View style={styles.headerArea}>
                <Image 
                  source={LOGO_IMG} 
                  style={styles.logo} 
                  resizeMode="contain" 
                />
                <View style={styles.subtitleContainer}>
                  <Text style={styles.subtitle}>ADVANCED EDITION</Text>
                </View>
              </View>

            
              <View style={styles.footerArea}>
                <TouchableOpacity
                  onPress={handleStartPress}
                  activeOpacity={0.9}
                  style={styles.buttonTouchable}
                >
                  <Animated.View style={[ styles.buttonWrapper, { transform: [{ scale: scaleAnim }] } ]}>
                    <LinearGradient
                      colors={['#FF6B6B', '#EE5253', '#D63031']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.buttonGradient}
                    >
                      <View style={styles.iconCircle}>
                        <Animated.Image 
                          source={POKEBALL_ICON} 
                          style={[styles.btnIcon, { transform: [{ rotate: spin }] }]} 
                          resizeMode="contain" 
                        />
                      </View>

                      <Text style={styles.buttonText}>INICIAR JORNADA</Text>
                      
                      <MaterialIcons name="chevron-right" size={28} color="rgba(255,255,255,0.9)" />
                    </LinearGradient>
                  </Animated.View>
                </TouchableOpacity>

                <Text style={styles.footerText}>Designed for Trainers • v1.0</Text>
              </View>
            </View>
            
          </View>
        </SafeAreaView>
      </LinearGradient>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  gradientOverlay: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  
  contentConstrainer: {
    flex: 1,
    width: '100%',
    maxWidth: 600, 
    alignSelf: 'center', 
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
  },
  
  headerArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  logo: {
    width: '90%', 
    height: height * 0.25,
    maxWidth: 500,
    maxHeight: 250,
  },
  subtitleContainer: {
    marginTop: 20,
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)', 
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  subtitle: {
    color: '#FFFFFF', 
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 4, 
    textAlign: 'center',
  },

  footerArea: {
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 30,
    paddingBottom: Platform.OS === 'ios' ? 20 : 40,
  },
  buttonTouchable: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 35,
    shadowColor: '#D63031',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
    backgroundColor: 'transparent',
  },
  buttonWrapper: {
    borderRadius: 35,
  },
  buttonGradient: {
    flexDirection: 'row',
    height: 68,
    alignItems: 'center',
    paddingHorizontal: 8,
    borderRadius: 35,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)', 
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
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
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  footerText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 11,
    marginTop: 25,
    letterSpacing: 1,
    fontWeight: '500',
  },
});