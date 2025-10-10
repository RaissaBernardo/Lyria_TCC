/* eslint-disable no-irregular-whitespace */
import { useState, useEffect, useRef } from "react";
import "./Styles/styles.css";
import {
  conversarAnonimo,
  getConversations,
  getMessagesForConversation,
  postMessage,
  deleteConversation,
  getPersonas,
  putPersona,
  getPersona,
} from "../../services/LyriaApi";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import {
  SpeechConfig,
  AudioConfig,
  SpeechRecognizer,
  SpeechSynthesizer,
  ResultReason,
} from "microsoft-cognitiveservices-speech-sdk";

import LoginPrompt from "../../components/LoginPrompt";
import ConfirmationModal from "../../components/ConfirmationModal";
import HistoryPanel from "../../components/HistoryPanel";
import ChatHeader from "../../components/ChatHeader";
import MessageList from "../../components/MessageList";
import ChatInput from "../../components/ChatInput";
import PromptSuggestions from "../../components/PromptSuggestions";

const speechConfig = SpeechConfig.fromSubscription(
  import.meta.env.VITE_SPEECH_KEY,
  import.meta.env.VITE_SPEECH_REGION
);
speechConfig.speechRecognitionLanguage = "pt-BR";

const availableVoices = [
  { value: "pt-BR-FranciscaNeural", label: "LyrIA" },
  { value: "pt-BR-BrendaNeural", label: "Brenda" },
  { value: "pt-BR-GiovanaNeural", label: "Giovana" },
  { value: "pt-BR-LeticiaNeural", label: "Leticia" },
  { value: "pt-BR-AntonioNeural", label: "Antonio" },
  { value: "pt-BR-DonatoNeural", label: "Leonardo" },
];

function ChatContent() {
  const { user, isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [isHistoryVisible, setHistoryVisible] = useState(false);
  const requestCancellationRef = useRef({ cancel: () => {} });
  const [conversations, setConversations] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(true);
  const [selectedVoice, setSelectedVoice] = useState(availableVoices[0].value);
  const [chatBodyAnimationClass, setChatBodyAnimationClass] = useState("fade-in");
  const [isLoginPromptVisible, setLoginPromptVisible] = useState(false);
  const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);
  const [chatToDelete, setChatToDelete] = useState(null);
  const [personas, setPersonas] = useState({});
  const [selectedPersona, setSelectedPersona] = useState("professor");

  useEffect(() => {
    const fetchPersonas = async () => {
      try {
        const response = await getPersonas();
        setPersonas(response.personas || {});
      } catch (error) {
        console.error("Erro ao buscar personas:", error);
      }
    };
    fetchPersonas();
  }, []);

  useEffect(() => {
    const loadUserPersona = async () => {
      if (isAuthenticated && user && Object.keys(personas).length > 0) {
        try {
          const personaResponse = await getPersona();
          const personaValue = personaResponse?.persona_escolhida || personaResponse;
          if (personaValue && personas[personaValue]) {
            setSelectedPersona(personaValue);
          }
        } catch (error) {
          console.error("Erro ao buscar persona do usuário:", error);
        }
      }
    };
    loadUserPersona();
  }, [isAuthenticated, user, personas]);

  const fetchConversations = async () => {
    if (isAuthenticated && user) {
      try {
        const response = await getConversations();
        
        // ===== LÓGICA PRINCIPAL PARA GERAR IDs E TÍTULOS =====
        const conversationsWithIds = (response.conversas || []).map((convo, index) => ({
          ...convo,
          id: index, // Usa o índice do array como ID único temporário
          titulo: (convo.pergunta || "Nova conversa").substring(0, 40) + "..." // Cria um título a partir da pergunta
        }));
        // =======================================================

        console.log("DEBUG: Conversas com IDs gerados pelo frontend:", conversationsWithIds);
        setConversations(conversationsWithIds);
      } catch (error) {
        console.error("Erro ao buscar conversas:", error);
      }
    } else {
      setConversations([]);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [isAuthenticated, user]);

  useEffect(() => {
    const savedVoice = localStorage.getItem("lyriaVoice");
    if (savedVoice) setSelectedVoice(savedVoice);
  }, []);

  useEffect(() => {
    speechConfig.speechSynthesisVoiceName = selectedVoice;
  }, [selectedVoice]);

  const stripMarkdown = (text = "") => {
    return text
      .replace(/```[\s\S]*?```/g, " ")
      .replace(/`/g, "").replace(/\*\*/g, "").replace(/\*/g, "")
      .replace(/#{1,6}\s/g, "").replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1")
      .replace(/!\[[^\]]*\]\([^\)]+\)/g, " ").trim();
  };

  const speakResponse = (text) => {
    if (!isSpeechEnabled) return;
    const plainText = stripMarkdown(text);
    const synthesizer = new SpeechSynthesizer(speechConfig);
    synthesizer.speakTextAsync(
      plainText,
      () => synthesizer.close(),
      (error) => {
        console.error("Erro na síntese de voz:", error);
        synthesizer.close();
      }
    );
  };

  const handleSend = async (textToSend) => {
    const trimmedInput = (typeof textToSend === "string" ? textToSend : input).trim();
    if (!trimmedInput || isBotTyping || isListening) return;

    requestCancellationRef.current?.cancel();

    const userMessage = { id: crypto.randomUUID(), sender: "user", text: trimmedInput };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsBotTyping(true);

    try {
      const controller = new AbortController();
      requestCancellationRef.current = { cancel: () => controller.abort() };

      const response = isAuthenticated && user
        ? await postMessage(trimmedInput, null, controller.signal) // Sempre envia null para o backend baseado em sessão criar/continuar a conversa
        : await conversarAnonimo(trimmedInput, selectedPersona, controller.signal);

      if (controller.signal.aborted) return;
    
      if (isAuthenticated) {
        fetchConversations(); // Recarrega o histórico para refletir a nova mensagem
      }

      const botMessage = { id: crypto.randomUUID(), sender: "bot", text: response.resposta, animate: true };
      setMessages((prev) => [...prev, botMessage]);
      speakResponse(response.resposta);
    } catch (error) {
      if (error.name !== "AbortError") {
        const errorMessage = { id: crypto.randomUUID(), sender: "bot", text: "Desculpe, ocorreu um erro." };
        setMessages((prev) => [...prev, errorMessage]);
        speakResponse(errorMessage.text);
      }
    } finally {
      setIsBotTyping(false);
    }
  };

  const handleMicClick = () => {
    if (isListening) return;
    const audioConfig = AudioConfig.fromDefaultMicrophoneInput();
    const recognizer = new SpeechRecognizer(speechConfig, audioConfig);
    setIsListening(true);
    setInput("Ouvindo... pode falar.");
    recognizer.recognizeOnceAsync(
      (result) => {
        if (result.reason === ResultReason.RecognizedSpeech) {
          handleSend(result.text);
        } else {
          setInput("Não consegui entender. Tente novamente.");
          setTimeout(() => setInput(""), 2000);
        }
        recognizer.close();
        setIsListening(false);
      },
      () => {
        setInput("Erro ao acessar o microfone.");
        recognizer.close();
        setIsListening(false);
        setTimeout(() => setInput(""), 2000);
      }
    );
  };

  const startNewChat = () => {
    requestCancellationRef.current?.cancel();
    setIsBotTyping(false);
    setChatBodyAnimationClass("fade-out");
    setTimeout(() => {
      setCurrentChatId(null);
      setMessages([]);
      setChatBodyAnimationClass("fade-in");
    }, 500);
  };

  const loadChat = async (id) => {
    if (id === currentChatId) return setHistoryVisible(false);

    const conversationToLoad = conversations.find(c => c.id === id);
    if (!conversationToLoad) {
        console.error("Não foi possível encontrar a conversa com o ID (índice):", id);
        return;
    }

    const historicalMessages = [
      { id: crypto.randomUUID(), sender: 'user', text: conversationToLoad.pergunta, animate: false },
      { id: crypto.randomUUID(), sender: 'bot', text: conversationToLoad.resposta, animate: false },
    ];
    
    setCurrentChatId(id);
    setMessages(historicalMessages);
    setChatBodyAnimationClass("fade-in");
    setHistoryVisible(false);
  };

  const deleteChat = (id) => {
    addToast("Função indisponível. Requer ajuste no backend.", "warning");
    console.warn(`Tentativa de deletar conversa com ID (índice) ${id}. A API atual não suporta esta ação.`);
  };

  const handleConfirmDelete = async () => {
    // A lógica de confirmação está desativada até que a API seja ajustada.
  };

  const handleHistoryClick = () => {
    if (!isAuthenticated) setLoginPromptVisible(true);
    else setHistoryVisible((prev) => !prev);
  };

  const handleNewChatClick = () => {
    if (!isAuthenticated) setLoginPromptVisible(true);
    else startNewChat();
  };

  const handleVoiceChange = (event) => {
    const newVoice = event.target.value;
    setSelectedVoice(newVoice);
    localStorage.setItem("lyriaVoice", newVoice);
    addToast("Voz atualizada!", "success");
  };

  const handlePersonaChange = async (event) => {
    const newPersona = event.target.value;
    setSelectedPersona(newPersona);
    if (isAuthenticated) {
      try {
        await putPersona(newPersona);
        addToast("Persona atualizada com sucesso!", "success");
      } catch (error) {
        addToast("Erro ao atualizar a persona.", "error");
      }
    }
  };

  return (
    <>
      {isLoginPromptVisible && <LoginPrompt onDismiss={() => setLoginPromptVisible(false)} showContinueAsGuest={false} />}
      <ConfirmationModal
        isOpen={isDeleteModalVisible}
        onClose={() => setDeleteModalVisible(false)}
        onConfirm={handleConfirmDelete}
        title="Confirmar Exclusão"
        message="Você tem certeza que deseja apagar esta conversa? Esta ação não pode ser desfeita."
      />
      <HistoryPanel
        isVisible={isHistoryVisible}
        onClose={() => setHistoryVisible(false)}
        conversations={conversations}
        loadChat={loadChat}
        deleteChat={deleteChat}
      />
      <main className={`galaxy-chat-area ${isHistoryVisible ? "history-open" : ""}`}>
        <ChatHeader
          onHistoryClick={handleHistoryClick}
          personas={personas}
          selectedPersona={selectedPersona}
          onPersonaChange={handlePersonaChange}
          availableVoices={availableVoices}
          selectedVoice={selectedVoice}
          onVoiceChange={handleVoiceChange}
          isSpeechEnabled={isSpeechEnabled}
          onToggleSpeech={() => setIsSpeechEnabled((p) => !p)}
          onNewChatClick={handleNewChatClick}
        />
        <div className={`galaxy-chat-body ${chatBodyAnimationClass}`}>
          {messages.length === 0 ? (
            <PromptSuggestions onSuggestionClick={handleSend} />
          ) : (
            <MessageList messages={messages} isBotTyping={isBotTyping} />
          )}
        </div>
        <ChatInput
          input={input}
          setInput={setInput}
          handleSend={handleSend}
          handleMicClick={handleMicClick}
          isBotTyping={isBotTyping}
          isListening={isListening}
        />
      </main>
    </>
  );
}

function Chatbot() {
  return (
    <div className="galaxy-chat-container">
      <ChatContent />
    </div>
  );
}

export default Chatbot;