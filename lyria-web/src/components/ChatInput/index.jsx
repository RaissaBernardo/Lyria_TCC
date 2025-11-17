import { FiSend, FiMic } from "react-icons/fi";
import { useState, useEffect, useRef } from "react";
import { useToast } from "../../context/ToastContext";

const ChatInput = ({
  input,
  setInput,
  handleSend,
  handleMicClick,
  isBotTyping,
  isListening,
}) => {
  const [isAttachmentMenuVisible, setAttachmentMenuVisible] = useState(false);
  const textareaRef = useRef(null);
  const { addToast } = useToast();

  // Ajusta altura do textarea dinamicamente
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Reset para calcular altura correta
    textarea.style.height = "auto";
    
    // Calcula nova altura (limitada a 120px em mobile, 150px em desktop)
    const isMobile = window.innerWidth <= 768;
    const maxHeight = isMobile ? 120 : 150;
    const scrollHeight = textarea.scrollHeight;
    const newHeight = Math.min(scrollHeight, maxHeight);
    
    textarea.style.height = `${newHeight}px`;
  }, [input]);

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendClick();
    }
  };

  const handleSendClick = () => {
    if (!input.trim() || isBotTyping || isListening) return;
    
    handleSend();
    
    // CRÍTICO: Reset da altura após enviar
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.height = "24px"; // Altura mínima
      }
    }, 0);
  };

  return (
    <footer className="galaxy-chat-input-container">
      <div className="attachment-container">
        {isAttachmentMenuVisible && (
          <div className="attachment-menu">
            <button
              className="attachment-option"
              onClick={() => {
                addToast("Funcionalidade ainda não implementada.", "info");
                setAttachmentMenuVisible(false);
              }}
            >
              <span>Anexar Arquivo</span>
            </button>
            <button
              className="attachment-option"
              onClick={() => {
                addToast("Funcionalidade ainda não implementada.", "info");
                setAttachmentMenuVisible(false);
              }}
            >
              <span>Usar a Câmera</span>
            </button>
            <button
              className="attachment-option"
              onClick={() => {
                addToast("Funcionalidade ainda não implementada.", "info");
                setAttachmentMenuVisible(false);
              }}
            >
              <span>Enviar Foto/Vídeo da Galeria</span>
            </button>
          </div>
        )}
      </div>
      <textarea
        ref={textareaRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Digite sua mensagem para LyrIA..."
        rows="1"
        disabled={isBotTyping || isListening}
        style={{ minHeight: '24px' }} // Garante altura mínima inline
      />
      <FiMic
        className={`input-icon mic-icon ${isListening ? "listening" : ""}`}
        onClick={handleMicClick}
      />
      <button
        onClick={handleSendClick}
        disabled={!input.trim() || isBotTyping || isListening}
        className="send-btn"
      >
        <FiSend />
      </button>
    </footer>
  );
};

export default ChatInput;