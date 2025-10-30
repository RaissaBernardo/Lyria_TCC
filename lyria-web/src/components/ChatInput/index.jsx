import { FiSend, FiPaperclip, FiMic, FiSquare } from "react-icons/fi";
import { useState, useEffect, useRef } from "react";
import { useToast } from "../../context/ToastContext";

const ChatInput = ({
  input,
  setInput,
  handleSend,
  handleStop,
  handleMicClick,
  isBotTyping,
  isListening,
}) => {
  const [isAttachmentMenuVisible, setAttachmentMenuVisible] = useState(false);
  const textareaRef = useRef(null);
  const { addToast } = useToast();

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${scrollHeight}px`;
    }
  }, [input]);

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
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
        onChange={setInput}
        onKeyDown={handleKeyDown}
        placeholder="Digite sua mensagem para LyrIA..."
        rows="1"
      />
      <FiMic
        className={`input-icon mic-icon ${isListening ? "listening" : ""}`}
        onClick={handleMicClick}
      />
      {isBotTyping ? (
        <button onClick={handleStop} className="send-btn stop-btn">
          <FiSquare />
        </button>
      ) : (
        <button
          onClick={() => handleSend()}
          disabled={!input.trim() || isListening}
          className="send-btn"
        >
          <FiSend />
        </button>
      )}
    </footer>
  );
};

export default ChatInput;
