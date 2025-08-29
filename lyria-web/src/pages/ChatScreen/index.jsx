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
import { conversarAnonimo } from "../../services/LyriaApi";

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

const HistoryPanel = ({ isVisible, onClose, history, loadChat, deleteChat }) => {
  const sortedHistory = Object.entries(history).sort(([, a], [, b]) => (b.lastUpdated || b.createdAt) - (a.lastUpdated || a.createdAt));

  return (
    <aside className={`history-panel ${isVisible ? "visible" : ""}`}>
      <div className="history-header">
        <h2>Histórico de Conversas</h2>
        <button onClick={onClose} className="header-icon-btn">
          <FiX />
        </button>
      </div>
      <div className="history-list">
        {sortedHistory.length > 0 ? (
          sortedHistory.map(([id, chat]) => (
            <div key={id} className="history-item-container">
              <div className="history-item" onClick={() => loadChat(id)}>
                {chat.title}
              </div>
              <button onClick={(e) => { e.stopPropagation(); deleteChat(id); }} className="delete-history-btn">
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
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isBotTyping, setIsBotTyping] = useState(false);
    const [copiedId, setCopiedId] = useState(null);
    const [isHistoryVisible, setHistoryVisible] = useState(false);
    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);
    
    const [history, setHistory] = useState({});
    const [currentChatId, setCurrentChatId] = useState(null);
    
    const [isListening, setIsListening] = useState(false);
    const [isSpeechEnabled, setIsSpeechEnabled] = useState(true);
    const [selectedVoice, setSelectedVoice] = useState(availableVoices[0].value);
    
    useEffect(() => {
        const savedHistory = JSON.parse(localStorage.getItem("lyria-chat-history")) || {};
        setHistory(savedHistory);
    
        const lastChatId = localStorage.getItem("lyria-last-chat-id");
        if (lastChatId && savedHistory[lastChatId]) {
            setCurrentChatId(lastChatId);
            setMessages(savedHistory[lastChatId].messages);
        } else {
            setCurrentChatId(null);
            setMessages([]);
        }
    }, []);

    useEffect(() => {
        if (currentChatId && history[currentChatId]) {
            const updatedHistory = {
                ...history,
                [currentChatId]: {
                    ...history[currentChatId],
                    messages: messages,
                    lastUpdated: Date.now(),
                },
            };
            setHistory(updatedHistory);
            localStorage.setItem("lyria-chat-history", JSON.stringify(updatedHistory));
            localStorage.setItem("lyria-last-chat-id", currentChatId);
        }
    }, [messages]);


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
        const synthesizer = new SpeechSynthesizer(speechConfig);
        synthesizer.speakTextAsync(
            text,
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

        let chatId = currentChatId;
        
        if (!chatId) {
            const newId = `chat-${crypto.randomUUID()}`;
            const newTitle = trimmedInput.substring(0, 30) + (trimmedInput.length > 30 ? "..." : "");
            const newChat = {
                title: newTitle,
                messages: [],
                createdAt: Date.now()
            };

            const updatedHistory = { ...history, [newId]: newChat };
            setHistory(updatedHistory);
            
            chatId = newId;
            setCurrentChatId(newId);
        }
    
        const userMessage = {
            id: crypto.randomUUID(),
            sender: "user",
            text: trimmedInput,
        };
        
        setMessages((prev) => [...prev, userMessage]);
    
        setInput("");
        setIsBotTyping(true);
    
        try {
            const response = await conversarAnonimo(trimmedInput);
            const botMessage = {
                id: crypto.randomUUID(),
                sender: "bot",
                text: response.resposta,
            };
            setMessages((prev) => [...prev, botMessage]);
            speakResponse(response.resposta);
        } catch (error) {
            const errorMessage = {
                id: crypto.randomUUID(),
                sender: "bot",
                text: "Desculpe, ocorreu um erro ao me comunicar com meus servidores. Tente novamente mais tarde.",
            };
            setMessages((prev) => [...prev, errorMessage]);
            speakResponse(errorMessage.text);
        } finally {
            setIsBotTyping(false);
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
      setCurrentChatId(null);
      setMessages([]);
      localStorage.removeItem("lyria-last-chat-id");
    };

    const loadChat = (id) => {
        if (history[id]) {
            setCurrentChatId(id);
            setMessages(history[id].messages);
            localStorage.setItem("lyria-last-chat-id", id);
            setHistoryVisible(false);
        }
    };
    
    const deleteChat = (idToDelete) => {
        const updatedHistory = { ...history };
        delete updatedHistory[idToDelete];
        
        setHistory(updatedHistory);
        localStorage.setItem("lyria-chat-history", JSON.stringify(updatedHistory));
        
        if (currentChatId === idToDelete) {
           startNewChat();
        }
    };

    const toggleSpeech = () => setIsSpeechEnabled((prev) => !prev);
    const handleVoiceChange = (event) => setSelectedVoice(event.target.value);

    return (
        <>
            <HistoryPanel
                isVisible={isHistoryVisible}
                onClose={() => setHistoryVisible(false)}
                history={history}
                loadChat={loadChat}
                deleteChat={deleteChat}
            />
            <main
                className={`galaxy-chat-area ${isHistoryVisible ? "history-open" : ""}`}
            >
                <header className="galaxy-chat-header">
                    <button
                        className="header-icon-btn"
                        onClick={() => setHistoryVisible(true)}
                    >
                        <FiClock />
                    </button>

                    <Link to="/" className="header-title-link">
                        <h1>LyrIA</h1>
                    </Link>

                    <div className="header-voice-controls">
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
                            onClick={startNewChat}
                            title="Novo Chat"
                        >
                            <FiPlus />
                        </button>
                    </div>
                </header>

                <div className="galaxy-chat-body">
                    {messages.length === 0 ? (
                        <PromptSuggestions onSuggestionClick={handleSend} />
                    ) : (
                        messages.map((msg) => (
                            <div key={msg.id} className={`message-wrapper ${msg.sender}`}>
                                <div className="avatar-icon">
                                    {msg.sender === "bot" ? <RiRobot2Line /> : <FiUser />}
                                </div>
                                <div className="message-content">
                                    <span className="sender-name">
                                        {msg.sender === "bot" ? "LyrIA" : "Você"}
                                    </span>
                                    <AnimatedBotMessage fullText={msg.text} />
                                    {msg.sender === "bot" && (
                                        <button
                                            className="copy-btn"
                                            onClick={() => handleCopyToClipboard(msg.text, msg.id)}
                                        >
                                            {copiedId === msg.id ? <FiCheck /> : <FiCopy />}
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
                    <FiPaperclip className="input-icon" />
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