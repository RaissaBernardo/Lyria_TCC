import { FiSend, FiPaperclip, FiMic, FiSquare } from "react-icons/fi";
import { useState, useEffect, useRef } from "react";
import { useToast } from "../../context/ToastContext";

const ChatInput = ({
  handleSend,
  handleStop,
  handleMicClick,
  isBotTyping,
  isListening,
}) => {
  const [text, setText] = useState("");
  const [isAttachmentMenuVisible, setAttachmentMenuVisible] = useState(false);
  const textareaRef = useRef(null);
  const { addToast } = useToast();

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${scrollHeight}px`;
    }
  }, [text]);

  const handleLocalSend = () => {
    handleSend(text);
    setText("");
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleLocalSend();
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
        value={text}
        onChange={(e) => setText(e.target.value)}
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
          onClick={handleLocalSend}
          disabled={!text.trim() || isListening}
          className="send-btn"
        >
          <FiSend />
        </button>
      )}
    </footer>
  );
};

export default ChatInput;
