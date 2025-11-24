import { FiX, FiUser, FiSettings, FiCamera } from "react-icons/fi";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
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
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState("preferences"); // 'preferences' or 'profile'

  // Estados para formulário de perfil
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [fotoPreview, setFotoPreview] = useState(null);
  const [mensagem, setMensagem] = useState({ tipo: "", texto: "" });
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen && user) {
      setNome(user.nome || "");
      setEmail(user.email || "");
      setFotoPreview(user.foto_perfil ? `${import.meta.env.VITE_API_BASE_URL}${user.foto_perfil}` : null);
      setMensagem({ tipo: "", texto: "" });
      setActiveTab("preferences");
      setSenhaAtual("");
      setNovaSenha("");
      setConfirmarSenha("");
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("foto", file);

      setLoading(true);
      try {
        const response = await api.post("/Lyria/usuarios/foto", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        const novaUrl = `${import.meta.env.VITE_API_BASE_URL}${response.data.url}`;
        setFotoPreview(novaUrl);

        // Atualiza contexto
        if (user) {
          updateUser({ ...user, foto_perfil: response.data.url });
        }

        setMensagem({ tipo: "sucesso", texto: "Foto atualizada com sucesso!" });
      } catch (error) {
        setMensagem({ tipo: "erro", texto: error.response?.data?.erro || "Erro ao atualizar foto." });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensagem({ tipo: "", texto: "" });

    try {
      await api.put("/Lyria/usuarios/perfil", { nome, email });
      if (user) {
        updateUser({ ...user, nome, email });
      }
      setMensagem({ tipo: "sucesso", texto: "Perfil atualizado com sucesso!" });
    } catch (error) {
      setMensagem({ tipo: "erro", texto: error.response?.data?.erro || "Erro ao atualizar perfil." });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (novaSenha !== confirmarSenha) {
      setMensagem({ tipo: "erro", texto: "As senhas não coincidem." });
      return;
    }

    setLoading(true);
    setMensagem({ tipo: "", texto: "" });

    try {
      await api.put("/Lyria/usuarios/senha-logado", { senha_atual: senhaAtual, nova_senha: novaSenha });
      setMensagem({ tipo: "sucesso", texto: "Senha atualizada com sucesso!" });
      setSenhaAtual("");
      setNovaSenha("");
      setConfirmarSenha("");
    } catch (error) {
      setMensagem({ tipo: "erro", texto: error.response?.data?.erro || "Erro ao atualizar senha." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings-modal-overlay" onClick={handleOverlayClick}>
      <div className="settings-modal-content">
        <button className="settings-modal-close-btn" onClick={onClose}>
          <FiX />
        </button>

        <div className="settings-modal-tabs">
          <button
            className={`tab-btn ${activeTab === 'preferences' ? 'active' : ''}`}
            onClick={() => setActiveTab('preferences')}
          >
            <FiSettings /> Preferências
          </button>
          <button
            className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <FiUser /> Perfil
          </button>
        </div>

        <div className="settings-modal-body">
          {mensagem.texto && (
            <div className={`message-box ${mensagem.tipo}`}>
              {mensagem.texto}
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="tab-content fade-in">
              <h2>Configurações da IA</h2>
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
          )}

          {activeTab === 'profile' && (
            <div className="tab-content fade-in">
              <h2>Editar Perfil</h2>

              <div className="profile-photo-section">
                <div
                  className="profile-photo-container"
                  onClick={() => fileInputRef.current.click()}
                  style={{ backgroundImage: fotoPreview ? `url(${fotoPreview})` : 'none' }}
                >
                  {!fotoPreview && <FiUser className="default-avatar-icon" />}
                  <div className="photo-overlay">
                    <FiCamera />
                  </div>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  style={{ display: 'none' }}
                />
                <button type="button" className="text-btn" onClick={() => fileInputRef.current.click()}>
                  Alterar foto
                </button>
              </div>

              <form onSubmit={handleUpdateProfile} className="profile-form">
                <div className="form-group">
                  <label>Nome</label>
                  <input
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>E-mail</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="save-btn" disabled={loading}>
                  {loading ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </form>

              <hr className="divider" />

              <h3>Alterar Senha</h3>
              <form onSubmit={handleUpdatePassword} className="profile-form">
                <div className="form-group">
                  <label>Senha Atual</label>
                  <input
                    type="password"
                    value={senhaAtual}
                    onChange={(e) => setSenhaAtual(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Nova Senha</label>
                  <input
                    type="password"
                    value={novaSenha}
                    onChange={(e) => setNovaSenha(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Confirmar Nova Senha</label>
                  <input
                    type="password"
                    value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="save-btn secondary" disabled={loading}>
                  {loading ? 'Atualizando...' : 'Atualizar Senha'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
