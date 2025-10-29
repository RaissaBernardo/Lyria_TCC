import { FaTimes } from "react-icons/fa";

function InfoModal({ isVisible, isClosing, onClose }) {
  
  console.log('[InfoModal] Estado do modal:', { isVisible, isClosing });

  if (!isVisible) return null;

  return (
    <div className={`info-modal-backdrop ${isClosing ? 'fade-out' : ''}`}>
      <div className={`info-modal-content ${isClosing ? 'slide-out' : ''}`}>
        <button 
          className="close-modal-btn" 
          onClick={() => {
            console.log('[InfoModal] Botão fechar clicado');
            onClose();
          }}
        >
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
  );
}

export default InfoModal;