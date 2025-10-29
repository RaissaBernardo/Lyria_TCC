import { FiClock, FiPlus, FiSettings } from "react-icons/fi";
import { FaVolumeUp, FaVolumeMute } from "react-icons/fa";
import { Link } from "react-router-dom";
import logoImage from "../../assets/img/LogoBranca.png";

const ChatHeader = ({
  onHistoryClick,
  isSpeechEnabled,
  onToggleSpeech,
  onNewChatClick,
  onSettingsClick,
}) => {
  return (
    <header className="galaxy-chat-header">
      <div className="header-group-left">
        <button
          className="header-icon-btn"
          onClick={onHistoryClick}
          title="Histórico"
        >
          <FiClock />
        </button>
        <button
          onClick={onSettingsClick}
          className="header-icon-btn"
          title="Configurações"
        >
          <FiSettings />
        </button>
      </div>
      <Link to="/" className="header-title-link">
        <img src={logoImage} alt="LyrIA Logo" className="header-logo" />
      </Link>
      <div className="header-group-right">
        <button
          onClick={onToggleSpeech}
          className="header-icon-btn"
          title={isSpeechEnabled ? "Desativar voz" : "Ativar voz"}
        >
          {isSpeechEnabled ? <FaVolumeUp /> : <FaVolumeMute />}
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
