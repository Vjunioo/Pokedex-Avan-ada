import React from 'react';
import { 
  Modal, 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions,
  Image 
} from 'react-native';

const { width } = Dimensions.get('window');


const DELETE_IMG = require('../assets/favorito/excluirfavorito.png');

interface Props {
  visible: boolean;
  onConfirm: () => void; 
  onCancel: () => void;  
}

export function ClearFavoritesModal({ visible, onConfirm, onCancel }: Props) {
  return (
    <Modal
      transparent={true} 
      visible={visible}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          
          <View style={styles.imageContainer}>
            <Image 
              source={DELETE_IMG} 
              style={styles.image}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.title}>Limpar Favoritos?</Text>
          
          <Text style={styles.message}>
            Isso irá remover todos os Pokémon da sua lista. Essa ação não pode ser desfeita.
          </Text>

          <View style={styles.buttonRow}>
            {/* Botão CANCELAR */}
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]} 
              onPress={onCancel}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>

            {/* Botão CONFIRMAR (Vermelho) */}
            <TouchableOpacity 
              style={[styles.button, styles.confirmButton]} 
              onPress={onConfirm}
              activeOpacity={0.8}
            >
              <Text style={styles.confirmText}>Sim, Limpar</Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width * 0.85,
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  imageContainer: {
    marginBottom: 15,
    height: 120, // Altura reservada para a imagem
    justifyContent: 'center'
  },
  image: {
    width: 100,
    height: 100,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#313131',
    marginBottom: 10,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
  },
  confirmButton: {
    backgroundColor: '#FF4C4C', // Vermelho alerta
    shadowColor: '#FF4C4C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  cancelText: {
    color: '#666',
    fontWeight: 'bold',
    fontSize: 16,
  },
  confirmText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});