import { FiClock, FiPlus, FiSettings } from "react-icons/fi";
import { FaVolumeUp, FaVolumeMute } from "react-icons/fa";
import { Link } from "react-router-dom";

const ChatHeader = ({
  onHistoryClick,
  isSpeechEnabled,
  onToggleSpeech,
  onNewChatClick,
  onSettingsClick,
}) => {
  return (
    <header className="galaxy-chat-header">
      <button
        className="header-icon-btn"
        onClick={onHistoryClick}
        title="Histórico"
      >
        <FiClock />
      </button>
      <Link to="/" className="header-title-link">
        <h1>LyrIA</h1>
      </Link>
      <div className="header-voice-controls">
        <button
          onClick={onToggleSpeech}
          className="header-icon-btn"
          title={isSpeechEnabled ? "Desativar voz" : "Ativar voz"}
        >
          {isSpeechEnabled ? <FaVolumeUp /> : <FaVolumeMute />}
        </button>
        <button
          onClick={onSettingsClick}
          className="header-icon-btn"
          title="Configurações"
        >
          <FiSettings />
        </button>
        <button
          className="header-icon-btn"
          onClick={onNewChatClick}
          title="Novo Chat"
        >
          <FiPlus />
        </button>
      </div>
    </header>
  );
};

export default ChatHeader;
