import { FiX } from "react-icons/fi";
import "./Styles/styles.css";

const SettingsModal = ({
  isOpen,
  onClose,
  personas,
  selectedPersona,
  onPersonaChange,
  availableVoices,
  selectedVoice,
  onVoiceChange,
  isConversationStarted,
}) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="settings-modal-overlay" onClick={handleOverlayClick}>
      <div className="settings-modal-content">
        <button className="settings-modal-close-btn" onClick={onClose}>
          <FiX />
        </button>
        <h2>Configurações</h2>
        <div className="settings-modal-body">
          {Object.keys(personas).length > 0 && (
            <div className="settings-group">
              <label htmlFor="persona-select">Persona:</label>
              <select
                id="persona-select"
                value={selectedPersona}
                onChange={onPersonaChange}
                className="settings-select"
                disabled={isConversationStarted}
              >
                {Object.keys(personas).map((key) => (
                  <option key={key} value={key}>
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </option>
                ))}
              </select>
              {isConversationStarted && (
                <small className="persona-lock-message">
                  Inicie uma nova conversa para trocar de persona.
                </small>
              )}
            </div>
          )}
          <div className="settings-group">
            <label htmlFor="voice-select">Voz:</label>
            <select
              id="voice-select"
              value={selectedVoice}
              onChange={onVoiceChange}
              className="settings-select"
            >
              {availableVoices.map((voice) => (
                <option key={voice.value} value={voice.value}>
                  {voice.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;