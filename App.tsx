import React, { useState } from 'react';
import { WelcomeScreen } from './src/screens/WelcomeScreen';
import { PokedexScreen } from './src/screens/PokedexScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'welcome' | 'pokedex'>('welcome');

  if (currentScreen === 'welcome') {
    return (
      <WelcomeScreen 
        onStart={() => setCurrentScreen('pokedex')} 
      />
    );
  }

  return (
    <PokedexScreen 
      onBack={() => setCurrentScreen('welcome')} 
    />
  );
}