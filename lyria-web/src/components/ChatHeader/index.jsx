import { FiClock, FiPlus } from "react-icons/fi";
import { FaVolumeUp, FaVolumeMute } from "react-icons/fa";
import { Link } from "react-router-dom";

const ChatHeader = ({
  onHistoryClick,
  personas,
  selectedPersona,
  onPersonaChange,
  availableVoices,
  selectedVoice,
  onVoiceChange,
  isSpeechEnabled,
  onToggleSpeech,
  onNewChatClick,
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
        {Object.keys(personas).length > 0 && (
          <select
            value={selectedPersona}
            onChange={onPersonaChange}
            className="voice-select"
            title="Selecionar persona"
          >
            {Object.keys(personas).map((key) => (
              <option key={key} value={key}>
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </option>
            ))}
          </select>
        )}
        <select
          value={selectedVoice}
          onChange={onVoiceChange}
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
