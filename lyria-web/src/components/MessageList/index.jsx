import { FiUser, FiCopy, FiCheck, FiPlay } from "react-icons/fi";
import { RiRobot2Line } from "react-icons/ri";
import AnimatedBotMessage from "../AnimatedBotMessage";
import { useState, useEffect, useRef } from "react";

const MessageList = ({
  messages,
  isBotTyping,
  user,
  onAudioPlay,
  audioPlaybackState,
}) => {
  const [copiedId, setCopiedId] = useState(null);
  const messagesEndRef = useRef(null);

  const handleCopyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isBotTyping]);

  return (
    <>
      {messages.map((msg, index) => (
        <div key={msg.id || index} className={`message-wrapper ${msg.sender}`}>
          <div className="avatar-icon">
            {msg.sender === "bot" ? (
              <RiRobot2Line />
            ) : user?.nome ? (
              user.nome.charAt(0).toUpperCase()
            ) : (
              <FiUser />
            )}
          </div>
          <div className="message-content">
            <span className="sender-name">
              {msg.sender === "bot" ? "LyrIA" : "Você"}
            </span>
            <AnimatedBotMessage fullText={msg.text} animate={msg.animate} />
            {msg.sender === "bot" && (
              <div className="message-actions">
                <button
                  className="action-btn"
                  onClick={() => onAudioPlay(msg.id, msg.text)}
                  aria-label="Reproduzir áudio"
                  disabled={audioPlaybackState.isPlaying}
                >
                  <FiPlay />
                </button>
                <button
                  className="action-btn"
                  onClick={() =>
                    handleCopyToClipboard(msg.text, msg.id || index)
                  }
                  aria-label="Copiar mensagem"
                >
                  {copiedId === (msg.id || index) ? <FiCheck /> : <FiCopy />}
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
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
    </>
  );
};

export default MessageList;
