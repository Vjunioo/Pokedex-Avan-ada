import Toast from 'react-native-toast-message';

export const useErrorHandler = () => {
  
  const handleError = (error: any) => {
    console.log('[Error Handler]', error);

  
    if (error.name === 'AbortError' || error.message === 'Aborted') {
      return; 
    }

    let title = 'Ops!';
    let message = 'Ocorreu um erro inesperado.';
    let type = 'error_default'; 

    
    if (error.message === 'OFFLINE_MODE' || error.message.includes('Network request failed')) {
      title = 'Sem Conexão';
      message = 'Verifique sua internet e tente novamente.';
      type = 'error_offline';
    }
    
    
    else if (error.message === 'NOT_FOUND' || error.message.includes('404')) {
      title = 'Não Encontrado';
      message = 'Não achamos esse Pokémon.';
      type = 'error_not_found';
    }

    
    else if (error.message === 'SERVER_ERROR' || error.message.includes('500')) {
      title = 'Erro na PokéAPI';
      message = 'Servidor instável. Tente mais tarde.';
      type = 'error_server';
    }

    
    else if (error.name === 'TimeoutError' || error.message === 'TimeoutError') {
      title = 'Demorou muito';
      message = 'Sua conexão está lenta demais.';
      type = 'error_timeout';
    }

    
    Toast.show({
      type: type, 
      text1: title,
      text2: message,
      position: 'bottom', 
      visibilityTime: 4000,
      bottomOffset: 30,
    });
  };

  return { handleError };
};