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
        Lyria é uma Assistente de Inteligência Artificial Personalizada, redefinindo o conceito de suporte inteligente e adaptável. É  uma plataforma que se molda às suas necessidades, seja no âmbito pessoal, acadêmico ou profissional.
        </p>
        <p>
        Nossa missão é otimizar a sua jornada de conhecimento, assegurando a entrega de respostas  rápidas, informações fundamentadas e auxiliando você a explorar novas ideias de forma intuitiva e eficiente. O projeto se diferencia ao oferecer suporte complementar através do nosso robô físico, estabelecendo uma presença integrada e única de Inteligência Artificial Web e Sistema Físico. A LyrIA é totalmente customizável, com aprendizado contínuo que a torna exponencialmente mais eficiente e perfeitamente alinhada às suas demandas exclusivas.
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