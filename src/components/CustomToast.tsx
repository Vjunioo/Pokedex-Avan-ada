import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import { BaseToastProps } from 'react-native-toast-message';


const icons = {
  offline: require('../assets/err/pikachu-sad.png'),
  timeout: require('../assets/err/snorlax-sleep.png'),
  server: require('../assets/err/porygon-glitch.png'),
  notFound: require('../assets/err/pokeball-empty.png'),
  default: require('../assets/err/psyduck-confused.png'),
};

interface CustomToastProps {
  text1?: string;
  text2?: string;
  type: 'offline' | 'timeout' | 'server' | 'notFound' | 'default';
}

export const CustomToast = ({ text1, text2, type }: CustomToastProps) => {
  const iconSource = icons[type];

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Image source={iconSource} style={styles.icon} resizeMode="contain" />
      </View>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>{text1}</Text>
        <Text style={styles.message}>{text2}</Text>
      </View>
    </View>
  );
};


export const toastConfig = {
  error_offline: ({ text1, text2 }: BaseToastProps) => (
    <CustomToast text1={text1} text2={text2} type="offline" />
  ),
  error_timeout: ({ text1, text2 }: BaseToastProps) => (
    <CustomToast text1={text1} text2={text2} type="timeout" />
  ),
  error_server: ({ text1, text2 }: BaseToastProps) => (
    <CustomToast text1={text1} text2={text2} type="server" />
  ),
  error_not_found: ({ text1, text2 }: BaseToastProps) => (
    <CustomToast text1={text1} text2={text2} type="notFound" />
  ),
  error_default: ({ text1, text2 }: BaseToastProps) => (
    <CustomToast text1={text1} text2={text2} type="default" />
  ),
};

const styles = StyleSheet.create({
  container: {
    width: '90%',
    backgroundColor: '#D83021', 
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
    borderLeftWidth: 6,
    borderLeftColor: '#8B0000', 
  },
  iconContainer: {
    marginRight: 15,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 25,
    padding: 5
  },
  icon: {
    width: 40,
    height: 40,
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  message: {
    color: '#FFE5E5',
    fontSize: 13,
  }
});