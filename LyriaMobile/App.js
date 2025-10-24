import React, { useState, useRef } from 'react';
import { StyleSheet, View, Pressable, Text, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';

export default function App() {
  const [recording, setRecording] = useState();
  const [appState, setAppState] = useState('idle'); // 'idle' | 'recording' | 'processing'
  const ws = useRef(null);

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
   * Para a gravação, envia o áudio via WebSocket e reproduz a resposta.
   */
  async function stopRecording() {
    if (!recording) return;

    setAppState('processing');
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    setRecording(undefined);

    // Garante que a reprodução de áudio subsequente use o viva-voz no iOS
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
    });

    // Conectar ao servidor WebSocket
    ws.current = new WebSocket("wss://lyria-servicodetranscricao.onrender.com/ws");

    ws.current.onopen = async () => {
      try {
        // Ler o arquivo de áudio como base64
        const audioData = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        // Enviar os dados via WebSocket
        ws.current.send(audioData);
      } catch (error) {
        console.error('Falha ao ler ou enviar o arquivo de áudio', error);
        Alert.alert('Erro', 'Não foi possível enviar o áudio.');
        setAppState('idle');
      }
    };

    ws.current.onmessage = async (e) => {
      try {
        // A resposta do servidor deve ser uma string base64 representando o arquivo de áudio.
        const responseUri = `${FileSystem.cacheDirectory}response-${Date.now()}.mp3`;

        // Escrever a string base64 recebida em um arquivo local.
        await FileSystem.writeAsStringAsync(responseUri, e.data, {
            encoding: FileSystem.EncodingType.Base64,
        });

        // Reproduzir o áudio recebido
        const { sound } = await Audio.Sound.createAsync({ uri: responseUri });

        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            setAppState('idle');
            sound.unloadAsync();
            FileSystem.deleteAsync(responseUri); // Opcional: limpar o cache
          }
        });

        await sound.playAsync();

      } catch (error) {
        console.error('Falha ao processar ou reproduzir a resposta', error);
        Alert.alert('Erro', 'Não foi possível reproduzir a resposta do servidor.');
        setAppState('idle');
      }
    };

    ws.current.onerror = (e) => {
      console.error('WebSocket Error:', e.message);
      Alert.alert('Erro de Conexão', 'Não foi possível se conectar ao servidor.');
      setAppState('idle');
    };

    ws.current.onclose = () => {
      console.log('WebSocket connection closed');
    };
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
      case 'processing':
        return 'Processando...';
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
          disabled={appState === 'processing'}
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
  },
});
