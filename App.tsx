import React from 'react';
import { View, Text, Image, StyleSheet, StatusBar, LogBox } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Toast, { ToastConfigParams } from 'react-native-toast-message';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { store } from './src/redux/store';
import { WelcomeScreen } from './src/screens/WelcomeScreen';
import { PokedexScreen } from './src/screens/PokedexScreen';
import { FavoritesScreen } from './src/screens/FavoritesScreen';

LogBox.ignoreLogs([
  'shadow', 
  'textShadow',
  'pointerEvents',
  'is deprecated'
]);

export type RootStackParamList = {
  Welcome: undefined;
  Pokedex: undefined;
  Favorites: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const errorIcons: Record<string, any> = {
  offline: require('./src/assets/err/pikachu-sad.png'),       
  notFound: require('./src/assets/err/pokeball-empty.png'),   
  server: require('./src/assets/err/porygon-glitch.png'),     
  timeout: require('./src/assets/err/snorlax-sleep.png'),     
  generic: require('./src/assets/err/psyduck-confused.png'),  
};

const getIconByTitle = (title?: string) => {
  if (!title) return errorIcons.generic;
  if (title === 'Sem Conexão') return errorIcons.offline;
  if (title === 'Não Encontrado') return errorIcons.notFound;
  if (title.includes('PokéAPI') || title.includes('500')) return errorIcons.server;
  if (title === 'Demorou muito' || title.includes('timeout')) return errorIcons.timeout;
  return errorIcons.generic;
};

const toastConfig = {
  error: (props: ToastConfigParams<any>) => (
    <View style={styles.toastContainer}>
      <Image 
        source={getIconByTitle(props.text1)} 
        style={styles.toastIcon} 
        resizeMode="contain"
      />
      <View style={styles.textContainer}>
        <Text style={styles.title}>{props.text1}</Text>
        <Text style={styles.message}>{props.text2}</Text>
      </View>
    </View>
  )
};

export default function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <NavigationContainer>
          <StatusBar 
            barStyle="light-content" 
            backgroundColor="transparent" 
            translucent 
          />
          <Stack.Navigator 
            initialRouteName="Welcome"
            screenOptions={{
              headerShown: false, 
              contentStyle: { backgroundColor: '#fff' },
              animation: 'fade_from_bottom'
            }}
          >
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Pokedex" component={PokedexScreen} />
            <Stack.Screen name="Favorites" component={FavoritesScreen}/>
          </Stack.Navigator>
          <Toast config={toastConfig} />
        </NavigationContainer>
      </SafeAreaProvider>
    </Provider>
  );
}

const styles = StyleSheet.create({
  toastContainer: {
    height: 80,
    width: '90%',
    backgroundColor: '#FFEBEE', 
    borderLeftColor: '#D32F2F', 
    borderLeftWidth: 6,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 6,
    marginTop: 40,
  },
  toastIcon: {
    width: 45,
    height: 45,
    marginRight: 16,
  },
  textContainer: {
    flex: 1, 
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#D32F2F',
    marginBottom: 2,
  },
  message: {
    fontSize: 13,
    color: '#424242',
    flexWrap: 'wrap', 
  }
});
