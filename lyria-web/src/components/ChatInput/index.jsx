import { FiSend, FiPaperclip, FiMic } from "react-icons/fi";
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

  useEffect(() => {
    if (textareaRef.current) {
      // Reset height to get accurate scrollHeight
      textareaRef.current.style.height = "auto";
      
      const scrollHeight = textareaRef.current.scrollHeight;
      const maxHeight = window.innerWidth <= 768 ? 100 : 120; // Mobile vs Desktop
      
      // Set height with max constraint
      if (scrollHeight > maxHeight) {
        textareaRef.current.style.height = `${maxHeight}px`;
        textareaRef.current.style.overflowY = "auto";
      } else {
        textareaRef.current.style.height = `${scrollHeight}px`;
        textareaRef.current.style.overflowY = "hidden";
      }
    }
  }, [input]);

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  // Previne zoom no iOS quando o teclado aparece
  useEffect(() => {
    const preventZoom = (e) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };

    if (textareaRef.current) {
      textareaRef.current.addEventListener('touchstart', preventZoom, { passive: false });
    }

    return () => {
      if (textareaRef.current) {
        textareaRef.current.removeEventListener('touchstart', preventZoom);
      }
    };
  }, []);

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
        style={{ minHeight: '24px' }} // Altura mínima inline
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
  );
};

export default ChatInput;