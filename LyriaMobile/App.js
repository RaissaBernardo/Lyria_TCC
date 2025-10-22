import React, { useState } from 'react';
import { StyleSheet, View, Pressable, Text, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome } from '@expo/vector-icons';
import { Audio } from 'expo-av';

export default function App() {
  const [recording, setRecording] = useState();
  const [appState, setAppState] = useState('idle'); // 'idle' | 'recording' | 'sending'

  /**
   * Solicita permissão do microfone e inicia a gravação de áudio.
   */
  async function startRecording() {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status === 'granted') {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });
        setAppState('recording');
        const { recording } = await Audio.Recording.createAsync(
          Audio.RecordingOptionsPresets.HIGH_QUALITY
        );
        setRecording(recording);
      } else {
        Alert.alert('Permissão necessária', 'A permissão do microfone é necessária para gravar áudio.');
      }
    } catch (err) {
      console.error('Falha ao iniciar a gravação', err);
      setAppState('idle');
    }
  }

  /**
   * Para a gravação, envia o áudio para o servidor e processa a resposta.
   */
  async function stopRecording() {
    if (!recording) return;

    setAppState('sending');
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    setRecording(undefined);

    // Criar FormData para enviar o arquivo de áudio
    const formData = new FormData();
    formData.append('audio', {
      uri,
      name: `recording-${Date.now()}.m4a`, // O Expo AV grava em .m4a no iOS/Android
      type: 'audio/m4a',
    });
    formData.append('persona', 'professor'); // ou qualquer outra persona

    try {
      // ** IMPORTANTE: Substitua pelo IP local da sua máquina onde o back-end está rodando **
      const response = await fetch('http://192.168.0.101:5000/Lyria/audio-input', {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      const responseData = await response.json();

      if (response.ok) {
        console.log('Resposta do servidor:', responseData.resposta);
        console.log('Texto transcrito:', responseData.texto_transcrito);
        // Aqui você pode fazer algo com a resposta, como exibi-la na tela
      } else {
        Alert.alert('Erro na resposta', responseData.erro || 'Ocorreu um erro no servidor.');
      }
    } catch (error) {
      console.error('Falha ao enviar o áudio', error);
      Alert.alert('Erro de conexão', 'Não foi possível se conectar ao servidor. Verifique o endereço IP e a conexão de rede.');
    } finally {
      setAppState('idle'); // Volta ao estado inicial
    }
  }

  /**
   * Alterna entre iniciar e parar a gravação.
   */
  function handleRecordButtonPress() {
    if (appState === 'recording') {
      stopRecording();
    } else {
      startRecording();
    }
  }

  /**
   * Retorna o texto de status com base no estado atual do aplicativo.
   */
  function getStatusText() {
    switch (appState) {
      case 'recording':
        return 'Gravando...';
      case 'sending':
        return 'Enviando...';
      default:
        return 'Pressione para gravar';
    }
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1d294d', '#000000']}
        style={styles.background}
      />
      <View style={styles.micContainer}>
        <Pressable
          style={({ pressed }) => [
            styles.micButton,
            appState === 'recording' && styles.micButtonRecording,
            pressed && styles.micButtonPressed,
          ]}
          onPress={handleRecordButtonPress}
          disabled={appState === 'sending'}
        >
          <FontAwesome
            name="microphone"
            size={100}
            color={appState === 'recording' ? '#ff4747' : '#ffffff'}
          />
        </Pressable>
      </View>
      <Text style={styles.statusText}>{getStatusText()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: '100%',
  },
  micContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 10,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'transparent',
  },
  micButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#3b4a74',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.5,
    shadowRadius: 13.16,
    elevation: 20,
  },
  micButtonRecording: {
    backgroundColor: '#5a2a2a',
  },
  micButtonPressed: {
    backgroundColor: '#2c385a',
  },
  statusText: {
    marginTop: 30,
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  }
});