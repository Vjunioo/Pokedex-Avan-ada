import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Button, ActivityIndicator } from 'react-native';
import { usePokedex } from './src/hooks/usePokedex';

export default function App() {
  const { list, loading, error, isOffline, loadMore, searchPokemon, filterByType, resetList } = usePokedex();
  
  // Estado para guardar os logs e mostrar na tela
  const [logs, setLogs] = useState<string[]>([]);

  // Função auxiliar para adicionar logs na tela
  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [`[${time}] ${msg}`, ...prev]);
  };

  // Monitora mudanças no backend e loga na tela
  useEffect(() => {
    if (loading) addLog("⏳ Status mudou: Carregando...");
    if (error) addLog(`❌ Erro detectado: ${error}`);
    if (isOffline) addLog("🔌 Status: Sem internet (Offline)");
  }, [loading, error, isOffline]);

  // Monitora quando a lista cresce ou muda
  useEffect(() => {
    if (list.length > 0) {
      addLog(`📦 Lista atualizada: ${list.length} itens.`);
      addLog(`   -> Primeiro: ${list[0].name}`);
    } else if (!loading && list.length === 0) {
      addLog("📦 Lista está vazia.");
    }
  }, [list]); // Removi 'loading' daqui para não duplicar log

  return (
    <View style={styles.container}>
      <Text style={styles.header}>🧪 Teste de Backend</Text>

      {/* Área de Botões */}
      <View style={styles.controls}>
        <Button title="1. Carregar Mais (Paginação)" onPress={() => {
            addLog("⬇️ Solicitando próxima página...");
            loadMore();
        }} />
        <View style={styles.spacer} />
        
        <Button title="2. Buscar 'Pikachu'" onPress={() => {
            addLog("🔍 Buscando 'pikachu'...");
            searchPokemon("pikachu");
        }} />
        <View style={styles.spacer} />

        <Button title="3. Filtrar Tipo 'Fire'" onPress={() => {
            addLog("🔥 Filtrando tipo 'fire'...");
            filterByType("fire");
        }} />
        <View style={styles.spacer} />

        <Button title="4. Resetar Tudo" color="red" onPress={() => {
            addLog("🔄 Resetando estado...");
            resetList();
        }} />
      </View>

      {/* Console Visual na Tela */}
      <Text style={styles.consoleTitle}>Console de Saída:</Text>
      <View style={styles.consoleBox}>
        <ScrollView nestedScrollEnabled>
          {logs.length === 0 && <Text style={styles.logText}>Aguardando ações...</Text>}
          {logs.map((log, index) => (
            <Text key={index} style={styles.logText}>{log}</Text>
          ))}
        </ScrollView>
      </View>
      
      {/* Indicador de Loading Visual */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={{color: 'white', marginTop: 10}}>Processando Requisição...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5', paddingTop: 50 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  controls: { marginBottom: 20 },
  spacer: { height: 10 },
  consoleTitle: { fontWeight: 'bold', marginBottom: 5 },
  consoleBox: { 
    flex: 1, 
    backgroundColor: '#1e1e1e', 
    borderRadius: 8, 
    padding: 10,
    borderWidth: 1,
    borderColor: '#333'
  },
  logText: { color: '#00ff00', fontFamily: 'monospace', fontSize: 12, marginBottom: 4 },
  loadingOverlay: {
    position: 'absolute', bottom: 20, right: 20, 
    backgroundColor: 'rgba(0,0,0,0.8)', padding: 15, borderRadius: 8,
    alignItems: 'center'
  }
});