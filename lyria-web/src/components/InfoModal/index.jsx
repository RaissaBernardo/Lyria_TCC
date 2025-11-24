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
        Nossa missão é oferecer respostas rápidas, informações confiáveis e suporte inteligente para facilitar sua jornada de conhecimento. A LyrIA se destaca pela integração com nosso robô físico, conectando IA Web ao mundo real. Com aprendizado contínuo e alta personalização, ela evolui constantemente para se adaptar às suas necessidades.
        </p>
        
        <h3>Funcionalidades Principais:</h3>
        <ul>
          <li>Alta precisão</li>
          <li>Assistência criativa</li>
          <li>Interface moderna</li>
          <li>Comandos de voz</li>
          <li>Personalidades</li>
        </ul>
      </div>
    </div>
  );
}

export default InfoModal;