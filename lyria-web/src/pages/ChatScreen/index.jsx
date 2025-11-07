import { useState, useEffect, useRef, useCallback } from "react";
import "./Styles/styles.css";
import {
  conversarAnonimo,
  getConversations,
  postMessage,
  deleteConversation,
  getPersonas,
  putPersona,
  getPersona,
  createConversation, 
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
import HistoryPanel from "../../components/HistoryPanel";
import ChatHeader from "../../components/ChatHeader";
import MessageList from "../../components/MessageList";
import ChatInput from "../../components/ChatInput";
import PromptSuggestions from "../../components/PromptSuggestions";
import SettingsModal from "../../components/SettingsModal";
import ConfirmationModal from "../../components/ConfirmationModal";

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
  const recognizerRef = useRef(null);
  const chatBodyRef = useRef(null);
  const [conversations, setConversations] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState(availableVoices[0].value);
  const [chatBodyAnimationClass, setChatBodyAnimationClass] = useState("fade-in");
  const [isLoginPromptVisible, setLoginPromptVisible] = useState(false);
  const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);
  const [personas, setPersonas] = useState({});
  const [selectedPersona, setSelectedPersona] = useState("professor");
  const [isSettingsModalVisible, setSettingsModalVisible] = useState(false);
  const [isPageVisible, setIsPageVisible] = useState(true);

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
    const handleVisibilityChange = () => {
      setIsPageVisible(document.visibilityState === "visible");
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    const loadUserPersona = async () => {
      if (isAuthenticated && user && Object.keys(personas).length > 0) {
        try {
          const personaResponse = await getPersona();
          const personaValue = personaResponse?.persona_escolhida || personaResponse;
          if (personaValue && personas[personaValue]) setSelectedPersona(personaValue);
        } catch (error) {
          console.error("Erro ao buscar persona do usuário:", error);
        }
      }
    };
    loadUserPersona();
  }, [isAuthenticated, user, personas]);

  const fetchConversations = useCallback(async () => {
    if (!isAuthenticated || !user) return setConversations([]);    
    try {
      const response = await getConversations();
      const conversationsWithIds = (response.conversas || []).map((convo) => ({
        ...convo,
        id: convo.conversa_id,
        titulo: (convo.mensagens[0].pergunta || "Nova conversa").substring(0, 40) + "...",
      }));
      
      console.log("📚 Conversas carregadas:", conversationsWithIds.length);
      setConversations(conversationsWithIds);
      
      if (response.conversa_ativa && !currentChatId && messages.length === 0) {
        console.log("📌 Conversa ativa detectada:", response.conversa_ativa);
        setCurrentChatId(response.conversa_ativa);
        
        const conversaAtiva = conversationsWithIds.find(c => c.id === response.conversa_ativa);
        if (conversaAtiva) {
          const historicalMessages = [
            { id: crypto.randomUUID(), sender: "user", text: conversaAtiva.mensagens[0].pergunta, animate: false },
            { id: crypto.randomUUID(), sender: "bot", text: conversaAtiva.mensagens[0].resposta, animate: false },
          ];
          setMessages(historicalMessages);
        }
      }
    } catch (error) {
      console.error("❌ Erro ao buscar conversas:", error);
    }
  }, [isAuthenticated, user, currentChatId, messages.length]);

  useEffect(() => {
    fetchConversations();
  }, [isAuthenticated, user, fetchConversations]);

  useEffect(() => {
    const savedVoice = localStorage.getItem("lyriaVoice");
    if (savedVoice) setSelectedVoice(savedVoice);
  }, []);

  useEffect(() => {
    speechConfig.speechSynthesisVoiceName = selectedVoice;
  }, [selectedVoice]);

  useEffect(() => {
    const chatBody = chatBodyRef.current;
    if (!chatBody) return;

    const scrollToBottom = () => {
      chatBody.scrollTop = chatBody.scrollHeight;
    };

    scrollToBottom();

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          scrollToBottom();
        }
      }
    });

    observer.observe(chatBody, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
    };
  }, [messages]);

  const stripMarkdown = (text = "") => {
    return text
      .replace(/```[\s\S]*?```/g, " ")
      .replace(/`/g, "").replace(/\*\*/g, "").replace(/\*/g, "")
      .replace(/#{1,6}\s/g, "").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/!\[[^\]]*\]\([^)]+\)/g, " ").trim();
  };

  const speakResponse = (text) => {
    if (!isSpeechEnabled || !isPageVisible) return;

    if (messages.length === 1 && text.toLowerCase().includes("olá")) {
      return;
    }

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
      
      let response;
    
      if (isAuthenticated && user) {
        let conversaId = currentChatId;
        
        if (!conversaId) {
          console.log("🆕 Criando nova conversa antes de enviar mensagem...");
          try {
            const newConversation = await createConversation();
            conversaId = newConversation.conversa_id;
            setCurrentChatId(conversaId);
            console.log("✅ Nova conversa criada:", conversaId);
          } catch (error) {
            console.error("❌ Erro ao criar conversa:", error);
            throw new Error("Não foi possível criar uma nova conversa");
          }
        }
        
        response = await postMessage(trimmedInput, conversaId, controller.signal);
        
        if (response.conversa_id && response.conversa_id !== conversaId) {
          setCurrentChatId(response.conversa_id);
        }
        
        fetchConversations();
        
      } else {
        response = await conversarAnonimo(trimmedInput, selectedPersona, controller.signal);
      }
      
      if (controller.signal.aborted) return;
      
      const botMessage = { 
        id: crypto.randomUUID(), 
        sender: "bot", 
        text: response.resposta, 
        animate: true 
      };
      setMessages((prev) => [...prev, botMessage]);
      speakResponse(response.resposta);
      
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("❌ Erro em handleSend:", error);
        const errorMessage = { 
          id: crypto.randomUUID(), 
          sender: "bot", 
          text: "Desculpe, ocorreu um erro ao processar sua mensagem." 
        };
        setMessages((prev) => [...prev, errorMessage]);
        speakResponse(errorMessage.text);
      }
    } finally {
      setIsBotTyping(false);
    }
  };

  const handleMicClick = () => {
    if (!isPageVisible) return;
    if (isListening) {
      if (recognizerRef.current) {
        recognizerRef.current.stopContinuousRecognitionAsync(
          () => {
            console.log("Reconhecimento parado com sucesso.");
            setIsListening(false);
            if (input.trim() && input !== "Ouvindo... pode falar.") {
              handleSend(input);
            }
          },
          (err) => {
            console.error("Erro ao parar o reconhecimento:", err);
            setIsListening(false);
          }
        );
      }
      return;
    }

    const audioConfig = AudioConfig.fromDefaultMicrophoneInput();
    const recognizer = new SpeechRecognizer(speechConfig, audioConfig);
    recognizerRef.current = recognizer;

    setIsListening(true);
    setInput("Ouvindo... pode falar.");

    recognizer.recognizing = (s, e) => {
      setInput(e.result.text);
    };

    recognizer.recognized = (s, e) => {
      if (e.result.reason === ResultReason.RecognizedSpeech) {
        handleSend(e.result.text);
        setInput("");
      } else if (e.result.reason === ResultReason.NoMatch) {
        setInput("Não consegui entender. Tente novamente.");
        setTimeout(() => setInput(""), 2000);
      }
    };

    recognizer.canceled = (s, e) => {
      console.log(`CANCELED: Reason=${e.reason}`);
      setIsListening(false);
      recognizer.stopContinuousRecognitionAsync();
    };

    recognizer.sessionStopped = (s, e) => {
      console.log("\n    Session stopped event.");
      setIsListening(false);
      recognizer.stopContinuousRecognitionAsync();
    };

    recognizer.startContinuousRecognitionAsync(
      () => {
        console.log("Reconhecimento iniciado.");
      },
      (err) => {
        console.error(`Error starting recognition: ${err}`);
        setInput("Erro ao acessar o microfone.");
        setIsListening(false);
        recognizer.close();
      }
    );
  };

  const startNewChat = async () => {
    requestCancellationRef.current?.cancel();
    setIsBotTyping(false);
    setChatBodyAnimationClass("fade-out");
    
    setTimeout(async () => {
      if (isAuthenticated) {
        try {
          const response = await createConversation();
          setCurrentChatId(response.conversa_id);
          console.log("✅ Nova conversa criada com ID:", response.conversa_id);
          
          await fetchConversations();
        } catch (error) {
          console.error("❌ Erro ao criar nova conversa:", error);
          addToast("Erro ao criar nova conversa", "error");
          setCurrentChatId(null);
        }
      } else {
        setCurrentChatId(null);
      }
      
      setMessages([]);
      setChatBodyAnimationClass("fade-in");
    }, 500);
  };

  const loadChat = (id) => {
    console.log(`loadChat id = ${id}`)
    if (id === currentChatId) return setHistoryVisible(false);
    
    const conversation = conversations.find((c) => c.id === id);
    if (!conversation) return console.error("❌ Conversa não encontrada:", id);
    
    const historicalMessages = [
      { id: crypto.randomUUID(), sender: "user", text: conversation.mensagens[0].pergunta, animate: false },
      { id: crypto.randomUUID(), sender: "bot", text: conversation.mensagens[0].resposta, animate: false },
    ];
    
    setCurrentChatId(id);
    setMessages(historicalMessages);
    setChatBodyAnimationClass("fade-in");
    setHistoryVisible(false);
  };

  const deleteChat = async (id) => {
    console.log(`🗑️ Tentando deletar conversa com ID: ${id}`);
    
    try {
      const response = await deleteConversation(id);

      if (response.sucesso) {
        console.log(`✅ Conversa ${id} deletada com sucesso`);
        
        setConversations((prev) => prev.filter((convo) => convo.id !== id));
        addToast('Conversa deletada com sucesso!', 'success');

        if (currentChatId === id) {
          console.log(`📌 Conversa deletada era a ativa, iniciando nova...`);
          startNewChat();
        }
      } else {
        console.error(`❌ Falha ao deletar: ${response.erro}`);
        addToast(response.erro || 'Falha ao excluir conversa', 'error');
      }
    } catch (error) {
      console.error(`❌ Erro ao deletar conversa:`, error);
      addToast(error.message || 'Ocorreu um erro ao excluir a conversa', 'error');
    }
  };

  const handleHistoryClick = () => {
    if (!isAuthenticated) setLoginPromptVisible(true);
    else setHistoryVisible((p) => !p);
  };

  const handleNewChatClick = () => {
    if (!isAuthenticated) setLoginPromptVisible(true);
    else startNewChat();
  };

  const handleSettingsClick = () => {
    if (!isAuthenticated) {
      setLoginPromptVisible(true);
    } else {
      setSettingsModalVisible(true);
    }
  };

  const handleVoiceChange = (e) => {
    const newVoice = e.target.value;
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
      } catch {
        addToast("Erro ao atualizar a persona.", "error");
      }
    }
  };

  const handleConfirmDelete = () => {
    setDeleteModalVisible(false);
  };

  return (
    <>
      {isLoginPromptVisible && (
        <LoginPrompt 
          onDismiss={() => setLoginPromptVisible(false)} 
          showContinueAsGuest={false} 
        />
      )}
      
      <ConfirmationModal
        isOpen={isDeleteModalVisible}
        onClose={() => setDeleteModalVisible(false)}
        onConfirm={handleConfirmDelete}
        title="Confirmar Exclusão"
        message="Você tem certeza que deseja apagar esta conversa? Esta ação não pode ser desfeita."
      />
      
      <SettingsModal
        isOpen={isSettingsModalVisible}
        onClose={() => setSettingsModalVisible(false)}
        personas={personas}
        selectedPersona={selectedPersona}
        onPersonaChange={handlePersonaChange}
        availableVoices={availableVoices}
        selectedVoice={selectedVoice}
        onVoiceChange={handleVoiceChange}
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
          isSpeechEnabled={isSpeechEnabled}
          onToggleSpeech={() => setIsSpeechEnabled((p) => !p)}
          onNewChatClick={handleNewChatClick}
          onSettingsClick={handleSettingsClick}
        />
        
        <div ref={chatBodyRef} className={`galaxy-chat-body ${chatBodyAnimationClass}`}>
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