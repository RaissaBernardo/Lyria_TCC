import React, { useState } from 'react';
import { StyleSheet, View, Pressable, Text, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome } from '@expo/vector-icons';
import { Audio } from 'expo-av';

export default function App() {
  const [recording, setRecording] = useState();
  const [sound, setSound] = useState();
  const [appState, setAppState] = useState('idle'); // 'idle' | 'recording' | 'recorded' | 'playing'
  const [audioUri, setAudioUri] = useState(null);

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
   * Para a gravação de áudio e armazena o URI do arquivo.
   */
  async function stopRecording() {
    if (!recording) return;

    setAppState('recorded');
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    setAudioUri(uri);
    setRecording(undefined);
  }

  /**
   * Reproduz o som gravado a partir do URI armazenado.
   */
  async function playSound() {
    if (!audioUri) return;

    try {
      setAppState('playing');
      const { sound } = await Audio.Sound.createAsync({ uri: audioUri });
      setSound(sound);

      // Quando a reprodução terminar, volta ao estado 'recorded'
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setAppState('recorded');
          setSound(undefined); // Limpa o som
        }
      });

      await sound.playAsync();
    } catch (error) {
      console.error("Falha ao reproduzir o som", error);
      setAppState('recorded'); // Volta ao estado anterior em caso de erro
    }
  }

  /**
   * Para a reprodução do som e descarrega o áudio da memória.
   */
  async function stopSound() {
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
      setSound(undefined);
      setAppState('recorded');
    }
  }

  /**
   * Descarta o áudio gravado e redefine o estado do aplicativo para 'idle'.
   */
  function discardRecording() {
    if (sound) {
      sound.unloadAsync();
    }
    setAudioUri(null);
    setAppState('idle');
    setSound(undefined);
    setRecording(undefined);
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
      case 'recorded':
        return 'Gravação concluída';
      case 'playing':
        return 'Reproduzindo...';
      default:
        return 'Pressione para gravar';
    }
  }

  /**
   * Renderiza os controles de reprodução (play/stop, trash) se um áudio foi gravado.
   */
  function renderPlaybackControls() {
    if (appState === 'recorded' || appState === 'playing') {
      return (
        <View style={styles.playbackContainer}>
          <Pressable style={styles.controlButton} onPress={appState === 'playing' ? stopSound : playSound}>
            <FontAwesome name={appState === 'playing' ? "stop" : "play"} size={30} color="#ffffff" />
          </Pressable>
          <Pressable style={styles.controlButton} onPress={discardRecording}>
            <FontAwesome name="trash" size={30} color="#ffffff" />
          </Pressable>
        </View>
      );
    }
    return null;
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
          disabled={appState === 'recorded' || appState === 'playing'}
        >
          <FontAwesome
            name="microphone"
            size={100}
            color={appState === 'recording' ? '#ff4747' : '#ffffff'}
          />
        </Pressable>
      </View>
      <Text style={styles.statusText}>{getStatusText()}</Text>
      {renderPlaybackControls()}
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
  playbackContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '60%',
    marginTop: 20,
  },
  controlButton: {
    padding: 20,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  }
});

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