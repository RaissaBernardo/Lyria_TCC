import { useState, useEffect, useRef } from "react";
import "./Styles/styles.css";
import {
  FiSend,
  FiPlus,
  FiPaperclip,
  FiMic,
  FiUser,
  FiCopy,
  FiCheck,
  FiClock,
  FiX,
  FiTrash2,
} from "react-icons/fi";
import { FaVolumeUp, FaVolumeMute } from "react-icons/fa";
import { RiRobot2Line } from "react-icons/ri";
import { Link } from "react-router-dom";
import AnimatedBotMessage from "../../components/AnimatedBotMessage";
import LoginPrompt from "../../components/LoginPrompt";
import ConfirmationModal from "../../components/ConfirmationModal";
import { useAuth } from "../../context/AuthContext";
import {
  conversarAnonimo,
  getConversations,
  getMessagesForConversation,
  postMessage,
  deleteConversation,
  getPersonas, 
  setPersona,
} from "../../services/LyriaApi";
import { useToast } from "../../context/ToastContext";

import {
  SpeechConfig,
  AudioConfig,
  SpeechRecognizer,
  SpeechSynthesizer,
  ResultReason,
} from "microsoft-cognitiveservices-speech-sdk";

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

const HistoryPanel = ({
  isVisible,
  onClose,
  conversations,
  loadChat,
  deleteChat,
}) => {
  return (
    <aside className={`history-panel ${isVisible ? "visible" : ""}`}>
      <div className="history-header">
        <h2>Histórico de Conversas</h2>
        <button onClick={onClose} className="header-icon-btn">
          <FiX />
        </button>
      </div>
      <div className="history-list">
        {conversations.length > 0 ? (
          conversations.map((chat) => (
            <div key={chat.id} className="history-item-container">
              <div className="history-item" onClick={() => loadChat(chat.id)}>
                {chat.titulo || "Conversa sem título"}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteChat(chat.id);
                }}
                className="delete-history-btn"
              >
                <FiTrash2 />
              </button>
            </div>
          ))
        ) : (
          <p className="no-history-text">Nenhuma conversa ainda.</p>
        )}
      </div>
    </aside>
  );
};

const PromptSuggestions = ({ onSuggestionClick }) => (
  <div className="suggestions-container">
    <div className="lyria-icon-large">
      <RiRobot2Line />
    </div>
    <h2>Como posso ajudar hoje?</h2>
    <div className="suggestions-grid">
      <div
        className="suggestion-card"
        onClick={() => onSuggestionClick("Quem é você?")}
      >
        <p>
          <strong>Quem é você?</strong>
        </p>
        <span>Descubra a identidade da LyrIA</span>
      </div>
      <div
        className="suggestion-card"
        onClick={() => onSuggestionClick("Qual a melhor turma do SENAI?")}
      >
        <p>
          <strong>Qual a melhor turma?</strong>
        </p>
        <span>Uma pergunta capciosa...</span>
      </div>
      <div
        className="suggestion-card"
        onClick={() =>
          onSuggestionClick("Me dê uma ideia para um projeto React")
        }
      >
        <p>
          <strong>Ideia de projeto</strong>
        </p>
        <span>Para inspirar sua criatividade</span>
      </div>
      <div
        className="suggestion-card"
        onClick={() => onSuggestionClick("Como você funciona?")}
      >
        <p>
          <strong>Como você funciona?</strong>
        </p>
        <span>Explore os bastidores da IA</span>
      </div>
    </div>
  </div>
);

function ChatContent() {
  const { user, isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [isHistoryVisible, setHistoryVisible] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const requestCancellationRef = useRef({ cancel: () => {} });

  const [conversations, setConversations] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);

  const [isListening, setIsListening] = useState(false);
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState(availableVoices[0].value);
  const [isAttachmentMenuVisible, setAttachmentMenuVisible] = useState(false);
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
        setPersonas(response.personas);
      } catch (error) {
        console.error("Erro ao buscar personas:", error);
      }
    };
    fetchPersonas();
  }, []);

  const fetchConversations = async () => {
    if (isAuthenticated && user) {
      try {
        const response = await getConversations(user.nome);
        setConversations(response.conversas || []);
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
    speechConfig.speechSynthesisVoiceName = selectedVoice;
  }, [selectedVoice]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${scrollHeight}px`;
    }
  }, [input]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isBotTyping]);

  const handleCopyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
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
    const trimmedInput = (
      typeof textToSend === "string" ? textToSend : input
    ).trim();
    if (!trimmedInput || isBotTyping || isListening) return;

    if (requestCancellationRef.current) {
      requestCancellationRef.current.cancel();
    }

    const userMessage = {
      id: crypto.randomUUID(),
      sender: "user",
      text: trimmedInput,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsBotTyping(true);

    const sentFromChatId = currentChatId;

    try {
      let response;
      const controller = new AbortController();
      requestCancellationRef.current = { cancel: () => controller.abort() };

      if (isAuthenticated && user) {
        await setPersona(user.nome, selectedPersona);
        response = await postMessage(user.nome, sentFromChatId, trimmedInput, controller.signal);

        if (currentChatId !== sentFromChatId) {
          console.log("Request was for a different chat. Ignoring response.");
          return; // Ignore the response
        }

        if (response.new_conversa_id && !sentFromChatId) {
          setCurrentChatId(response.new_conversa_id);
          fetchConversations();
        }
      } else {
        response = await conversarAnonimo(trimmedInput, selectedPersona, controller.signal);
      }

      if (controller.signal.aborted) {
        console.log("Request aborted, not setting bot message.");
        return;
      }

      const botMessage = {
        id: crypto.randomUUID(),
        sender: "bot",
        text: response.resposta,
        animate: true,
      };
      setMessages((prev) => [...prev, botMessage]);
      speakResponse(response.resposta);
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Fetch aborted');
      } else {
        const errorMessage = {
          id: crypto.randomUUID(),
          sender: "bot",
          text: "Desculpe, ocorreu um erro.",
        };
        setMessages((prev) => [...prev, errorMessage]);
        speakResponse(errorMessage.text);
      }
    } finally {
      if (currentChatId === sentFromChatId) {
        setIsBotTyping(false);
      }
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
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
                const recognizedText = result.text;
                handleSend(recognizedText);
            } else {
                setInput("Não consegui entender. Tente novamente.");
                setTimeout(() => setInput(""), 2000);
            }
            recognizer.close();
            setIsListening(false);
        },
        (error) => {
            setInput("Erro ao acessar o microfone.");
            recognizer.close();
            setIsListening(false);
            setTimeout(() => setInput(""), 2000);
        }
    );
  };

  const startNewChat = () => {
    if (requestCancellationRef.current) {
      requestCancellationRef.current.cancel();
    }
    setIsBotTyping(false);
    setChatBodyAnimationClass("fade-out");
    setTimeout(() => {
      setCurrentChatId(null);
      setMessages([]);
      setChatBodyAnimationClass("fade-in");
    }, 500); // Duração da animação de fade-out
  };

  const loadChat = async (id) => {
    if (requestCancellationRef.current) {
      requestCancellationRef.current.cancel();
    }
    setIsBotTyping(false);
    try {
      const response = await getMessagesForConversation(id);
      setCurrentChatId(id);
      // Adiciona a propriedade 'animate: false' para mensagens carregadas
      const historicalMessages = response.mensagens.map((msg) => ({
        ...msg,
        animate: false,
      }));
      setMessages(historicalMessages || []);
      setHistoryVisible(false);
    } catch (error) {
      console.error("Erro ao carregar conversa", error);
    }
  };

  const deleteChat = (id) => {
    setChatToDelete(id);
    setDeleteModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (!chatToDelete) return;
    try {
      await deleteConversation(chatToDelete);
      addToast("Conversa deletada com sucesso.", "success");
      fetchConversations(); // Atualiza a lista
      if (currentChatId === chatToDelete) {
        setCurrentChatId(null);
        setMessages([]);
      }
    } catch (error) {
      addToast("Erro ao deletar conversa.", "error");
      console.error("Erro ao deletar conversa", error);
    } finally {
      setDeleteModalVisible(false);
      setChatToDelete(null);
    }
  };

  const toggleSpeech = () => setIsSpeechEnabled((prev) => !prev);
  const handleVoiceChange = (event) => setSelectedVoice(event.target.value);
  const handlePersonaChange = (event) => setSelectedPersona(event.target.value);

  const stripMarkdown = (text) => {
    return text
      // Remove code blocks
      .replace(/```[\s\S]*?```/g, ' ')
      // Remove inline code
      .replace(/`/g, '')
      // Remove bold and italics
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      // Remove headings
      .replace(/#{1,6}\s/g, '')
      // Remove links, keeping the text
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
      // Remove images
      .replace(/!\[[^\]]*\]\([^\)]+\)/g, ' ')
      .trim();
  };

  const handleHistoryClick = () => {
    if (!isAuthenticated) {
      setLoginPromptVisible(true);
    } else {
      setHistoryVisible((prev) => !prev);
    }
  };

  const handleNewChatClick = () => {
    if (!isAuthenticated) {
      setLoginPromptVisible(true);
    } else {
      startNewChat();
    }
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
      <HistoryPanel
        isVisible={isHistoryVisible}
        onClose={() => setHistoryVisible(false)}
        conversations={conversations}
        loadChat={loadChat}
        deleteChat={deleteChat}
      />
      <main
        className={`galaxy-chat-area ${isHistoryVisible ? "history-open" : ""}`}
      >
        <header className="galaxy-chat-header">
          <button
            className="header-icon-btn"
            onClick={handleHistoryClick}
            title="Histórico"
          >
            <FiClock />
          </button>
          <Link to="/" className="header-title-link">
            <h1>LyrIA</h1>
          </Link>
          <div className="header-voice-controls">
            <select
              value={selectedPersona}
              onChange={handlePersonaChange}
              className="voice-select"
              title="Selecionar persona"
            >
              {Object.keys(personas).map((key) => (
                <option key={key} value={key}>
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </option>
              ))}
            </select>
            <select
              value={selectedVoice}
              onChange={handleVoiceChange}
              className="voice-select"
              title="Selecionar voz"
            >
              {availableVoices.map((voice) => (
                <option key={voice.value} value={voice.value}>
                  {voice.label}
                </option>
              ))}
            </select>
            <button
              onClick={toggleSpeech}
              className="header-icon-btn"
              title={isSpeechEnabled ? "Desativar voz" : "Ativar voz"}
            >
              {isSpeechEnabled ? <FaVolumeUp /> : <FaVolumeMute />}
            </button>
            <button
              className="header-icon-btn"
              onClick={handleNewChatClick}
              title="Novo Chat"
            >
              <FiPlus />
            </button>
          </div>
        </header>

        <div className={`galaxy-chat-body ${chatBodyAnimationClass}`}>
          {messages.length === 0 ? (
            <PromptSuggestions onSuggestionClick={handleSend} />
          ) : (
            messages.map((msg, index) => (
              <div
                key={msg.id || index}
                className={`message-wrapper ${msg.sender}`}
              >
                <div className="avatar-icon">
                  {msg.sender === "bot" ? <RiRobot2Line /> : <FiUser />}
                </div>
                <div className="message-content">
                  <span className="sender-name">
                    {msg.sender === "bot" ? "LyrIA" : "Você"}
                  </span>
                  <AnimatedBotMessage
                    fullText={msg.text}
                    animate={msg.animate}
                  />
                  {msg.sender === "bot" && (
                    <button
                      className="copy-btn"
                      onClick={() =>
                        handleCopyToClipboard(msg.text, msg.id || index)
                      }
                    >
                      {copiedId === (msg.id || index) ? (
                        <FiCheck />
                      ) : (
                        <FiCopy />
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
          {isBotTyping && (
            <div className="message-wrapper bot">
              <div className="avatar-icon">
                <RiRobot2Line />
              </div>
              <div className="message-content">
                <span className="sender-name">LyrIA</span>
                <div className="typing-indicator">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <footer className="galaxy-chat-input-container">
          <div className="attachment-container">
            {isAttachmentMenuVisible && (
              <div className="attachment-menu">
                <button className="attachment-option" onClick={() => { addToast('Funcionalidade ainda não implementada.', 'info'); setAttachmentMenuVisible(false); }}>
                  <span>Anexar Arquivo</span>
                </button>
                <button className="attachment-option" onClick={() => { addToast('Funcionalidade ainda não implementada.', 'info'); setAttachmentMenuVisible(false); }}>
                  <span>Usar a Câmera</span>
                </button>
                <button className="attachment-option" onClick={() => { addToast('Funcionalidade ainda não implementada.', 'info'); setAttachmentMenuVisible(false); }}>
                  <span>Enviar Foto/Vídeo da Galeria</span>
                </button>
              </div>
            )}
            <FiPaperclip
              className="input-icon"
              onClick={() => setAttachmentMenuVisible(!isAttachmentMenuVisible)}
            />
          </div>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite sua mensagem para LyrIA..."
            rows="1"
            disabled={isBotTyping || isListening}
          />
          <FiMic
            className={`input-icon mic-icon ${isListening ? "listening" : ""}`}
            onClick={handleMicClick}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isBotTyping || isListening}
            className="send-btn"
          >
            <FiSend />
          </button>
        </footer>
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