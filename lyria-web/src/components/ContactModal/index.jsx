import { FaTimes } from "react-icons/fa";
import { FiGithub, FiInstagram } from "react-icons/fi";

const contactLinks = [
  { icon: <FiGithub />, label: "LyrIA-Project", href: "https://github.com/RaissaBernardo/Lyria", targetBlank: true },
  { icon: <FiInstagram />, label: "@rah_antonia", href: "https://www.instagram.com/rah_antonia", targetBlank: true },
  { icon: <FiInstagram />, label: "@antonybriito", href: "https://www.instagram.com/antonybriito", targetBlank: true },
  { icon: <FiInstagram />, label: "@jaogabxs", href: "https://www.instagram.com/jaogabxs", targetBlank: true },
  { icon: <FiInstagram />, label: "@gabrielcardos095", href: "https://www.instagram.com/gabrielcardos095", targetBlank: true },
  { icon: <FiInstagram />, label: "@vii_amaro", href: "https://www.instagram.com/vii_amaro", targetBlank: true },
  { icon: <FiInstagram />, label: "@juli_naners", href: "https://www.instagram.com/juli_naners", targetBlank: true },
];

function ContactModal({ isVisible, isClosing, onClose }) {
  
  console.log('[ContactModal] Estado do modal:', { isVisible, isClosing });

  if (!isVisible) return null;

  const handleLinkClick = (label) => {
    console.log('[ContactModal] Link clicado:', label);
  };

  return (
    <div className={`info-modal-backdrop ${isClosing ? 'fade-out' : ''}`}>
      <div className={`info-modal-content ${isClosing ? 'slide-out' : ''}`}>
        <button 
          className="close-modal-btn" 
          onClick={() => {
            console.log('[ContactModal] Botão fechar clicado');
            onClose();
          }}
        >
          <FaTimes />
        </button>
        
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
                onClick={() => handleLinkClick(link.label)}
              >
                {link.icon}
                <span>{link.label}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactModal;