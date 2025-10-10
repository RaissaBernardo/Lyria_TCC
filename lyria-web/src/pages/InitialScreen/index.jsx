import { useState } from 'react';
import './Styles/styles.css';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoginPrompt from '../../components/LoginPrompt';
import { baseURL } from '../../services/api';
import { FaTimes } from "react-icons/fa";
import { FiGithub, FiInstagram } from "react-icons/fi";
import logoImage from '/img/LogoBranca.png';

function InitialScreen() {
  const [isInfoVisible, setInfoVisible] = useState(false);
  const [isContactModalVisible, setContactModalVisible] = useState(false);
  const [isLoginPromptVisible, setLoginPromptVisible] = useState(false);
  const [isModalClosing, setIsModalClosing] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const contactLinks = [
    { icon: <FiGithub />, label: "LyrIA-Project", href: "https://github.com/RaissaBernardo/Lyria", targetBlank: true },
    { icon: <FiInstagram />, label: "@rah_antonia", href: "https://www.instagram.com/rah_antonia", targetBlank: true },
    { icon: <FiInstagram />, label: "@antonybriito", href: "https://www.instagram.com/antonybriito", targetBlank: true },
    { icon: <FiInstagram />, label: "@jaogabxs", href: "https://www.instagram.com/jaogabxs", targetBlank: true },
    { icon: <FiInstagram />, label: "@gabrielcardos095", href: "https://www.instagram.com/gabrielcardos095", targetBlank: true },
    { icon: <FiInstagram />, label: "@vii_amaro", href: "https://www.instagram.com/vii_amaro", targetBlank: true },
    { icon: <FiInstagram />, label: "@juli_naners", href: "https://www.instagram.com/juli_naners", targetBlank: true },
  ];

  const toggleInfoModal = () => {
    if (isInfoVisible) {
      setIsModalClosing(true);
      setTimeout(() => {
        setInfoVisible(false);
        setIsModalClosing(false);
      }, 500);
    } else {
      setInfoVisible(true);
    }
  };

  const toggleContactModal = () => {
    if (isContactModalVisible) {
      setIsModalClosing(true);
      setTimeout(() => {
        setContactModalVisible(false);
        setIsModalClosing(false);
      }, 500);
    } else {
      setContactModalVisible(true);
    }
  };

  const handleLogout = () => {
    logout();
    setDropdownVisible(false);
  };

  const handleStartClick = () => {
    if (isAuthenticated) {
      navigate('/chat');
    } else {
      setLoginPromptVisible(true);
    }
  };

  const handleContinueAsGuest = () => {
    navigate('/chat');
  };

  return (
    <div className="App">
      {isLoginPromptVisible && (
        <LoginPrompt
          onDismiss={() => setLoginPromptVisible(false)}
          onContinueAsGuest={handleContinueAsGuest}
          showContinueAsGuest={true}
        />
      )}

      <header className="app-header">
        <Link to={'/'} className="logo-link">
          <div className="logo">
            <img src={logoImage} alt="Logo da LyrIA" className="logo-image" />
          </div>
        </Link>

        <nav className="main-nav">
          {isAuthenticated ? (
            <div className="user-profile-section">
              <div
                className="user-indicator"
                onClick={() => setDropdownVisible(!dropdownVisible)}
              >
                {user?.foto_perfil_url ? (
                  <img
                    src={`${baseURL}${user.foto_perfil_url}`}
                    alt="Foto de perfil"
                    className="user-profile-pic"
                  />
                ) : (
                  user?.nome?.charAt(0).toUpperCase()
                )}
              </div>

              {dropdownVisible && (
                <div className="user-dropdown-initial">
                  <Link to="/profile" className="dropdown-link">Ver Perfil</Link>
                  <button onClick={handleLogout}>Sair</button>
                </div>
              )}
            </div>
          ) : (
            <div className="nav-actions">
              <Link to={'/RegistrationAndLogin'} className="nav-button">Entrar</Link>
              <button onClick={toggleContactModal} className="nav-button">Contato</button>
            </div>
          )}
        </nav>
      </header>

      <div className="main-content">
        <div id="frase_efeito"><b>Conheça LyrIA</b></div>
        <span id="espaço"></span>
        <div className="botoes-container">
          <button id="comecar" onClick={handleStartClick}>
            Começar
          </button>
          <button id="sobre" onClick={toggleInfoModal}>
            Saiba Mais
          </button>
        </div>
      </div>

      {isInfoVisible && (
        <div className={`info-modal-backdrop ${isModalClosing ? 'fade-out' : ''}`}>
          <div className={`info-modal-content ${isModalClosing ? 'slide-out' : ''}`}>
            <button className="close-modal-btn" onClick={toggleInfoModal}><FaTimes /></button>
            <h2>Sobre a LyrIA</h2>
            <p>
              LyrIA é uma assistente virtual de última geração, projetada para ser sua companheira em um universo de conhecimento e criatividade.
            </p>
            <p>
              Nossa missão é fornecer respostas rápidas, insights valiosos e ajudar você a explorar novas ideias de forma intuitiva e eficiente. Construída com as mais recentes tecnologias de inteligência artificial, a LyrIA aprende e se adapta às suas necessidades.
            </p>
            <h3>Funcionalidades Principais:</h3>
            <ul>
              <li>Respostas instantâneas e precisas.</li>
              <li>Assistência criativa para seus projetos.</li>
              <li>Interface amigável e personalizável.</li>
              <li>Integração com diversas ferramentas.</li>
            </ul>
          </div>
        </div>
      )}

      {isContactModalVisible && (
        <div className={`info-modal-backdrop ${isModalClosing ? 'fade-out' : ''}`}>
          <div className={`info-modal-content ${isModalClosing ? 'slide-out' : ''}`}>
            <button className="close-modal-btn" onClick={toggleContactModal}><FaTimes /></button>
            <h2>Contato</h2>
            <div className="contact-info">
              <p>Para dúvidas, sugestões ou suporte, entre em contato conosco através dos seguintes canais:</p>
              <div className="contact-links">
                {contactLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    target={link.targetBlank ? "_blank" : undefined}
                    rel={link.targetBlank ? "noopener noreferrer" : ""}
                    className="contact-link-item"
                  >
                    {link.icon}
                    <span>{link.label}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default InitialScreen;