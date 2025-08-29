import { useState } from 'react';
import './Styles/styles.css';
import { Link } from 'react-router-dom';
// import Galaxy from '../../components/Galaxy/Galaxy.jsx'; // <--- REMOVIDO
import { FaTimes } from "react-icons/fa";
import logoImage from '/img/LogoBranca.png';

function InitialScreen() {
  const [isInfoVisible, setInfoVisible] = useState(false);

  const toggleInfoModal = () => {
    setInfoVisible(!isInfoVisible);
  };

  return (
    <div className="App">
      <header className="app-header">
        <Link to={'/'} className="logo-link">
          <div className="logo">
            <img src={logoImage} alt="Logo da LyrIA" className="logo-image" />
          </div>
        </Link>
        <nav>
          <Link to={'/RegistrationAndLogin'}>Entrar</Link>
          <a href="#">Contato</a>
        </nav>
      </header>

      {/* O <Galaxy /> foi removido daqui porque o GalaxyLayout já o fornece */}

      <div className="main-content">
        <div id="frase_efeito">
          <b>Conheça LyrIA</b>
        </div>
        <span id="espaço"></span>
        <div className="container_espaço">
          <Link className="linkSemEstilo" to={'/loading'}>
            <button id="comecar">
              Começar
            </button>
          </Link>
          <button id="sobre" onClick={toggleInfoModal}>
            Saiba Mais
          </button>
        </div>
      </div>

      {isInfoVisible && (
        <div className="info-modal-backdrop">
          <div className="info-modal-content">
            <button className="close-modal-btn" onClick={toggleInfoModal}>
              <FaTimes />
            </button>
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
    </div>
  );
}

export default InitialScreen;