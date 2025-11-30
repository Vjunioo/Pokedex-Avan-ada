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

interface Props {
  visible: boolean;
  onConfirm: () => void; 
  onCancel: () => void;  
}

export function ExitModal({ visible, onConfirm, onCancel }: Props) {
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
              source={require('../assets/err/pikachu-sad.png')} 
              style={styles.image}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.title}>Já vai embora?</Text>
          
          <Text style={styles.message}>
            Tem certeza que deseja voltar para a tela inicial?
          </Text>

          <View style={styles.buttonRow}>
          
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]} 
              onPress={onCancel}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelText}>Ficar</Text>
            </TouchableOpacity>

            
            <TouchableOpacity 
              style={[styles.button, styles.confirmButton]} 
              onPress={onConfirm}
              activeOpacity={0.8}
            >
              <Text style={styles.confirmText}>Sair</Text>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  imageContainer: {
    marginBottom: 20,
  },
  image: {
    width: 140,
    height: 140,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#313131',
    marginBottom: 10,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
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
    backgroundColor: '#D83021',
    shadowColor: '#D83021',
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