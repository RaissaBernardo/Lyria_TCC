import { FaTimes, FaGithub, FaLinkedin } from "react-icons/fa";
import { useState } from "react";
import './styles.css';

const teamMembers = [
  {
    id: 1,
    name: "Antony Brito",
    role: "Desenvolvedor Full-Stack",
    area: "Design de Interface & Desenvolvedor Front-End",
    image: "https://avatars.githubusercontent.com/u/159206119?v=4", 
    github: "https://github.com/antonybrito",
    linkedin: "https://linkedin.com/in/britoantony"
  },
  {
    id: 2,
    name: "Gabriel Cardoso",
    role: "Desenvolvedor Full-Stack",
    area: "DevOps",
    image: "https://avatars.githubusercontent.com/u/159193822?v=4",
    github: "https://github.com/GabrielCardoso76",
    linkedin: "https://www.linkedin.com/in/gabriel-cardoso-torres-b76a59328/"
  },
  {
    id: 3,
    name: "João Gabriel",
    role: "Desenvolvedor Full-Stack",
    area: "Design de Interface & Desenvolvedor Front-End",
    image: "https://avatars.githubusercontent.com/u/185539213?v=4",
    github: "https://github.com/JoaoBiel11",
    linkedin: "https://www.linkedin.com/in/joão-gabriel-673803392?utm_source=share_via&utm_content=profile&utm_medium=member_ios"
  },
  {
    id: 4,
    name: "Juliana Nishimura",
    role: "Desenvolvedora Full-Stack",
    area: "Desenvolvedora Back-End & AI Engineer",
    image: "https://avatars.githubusercontent.com/u/165977851?v=4",
    github: "https://github.com/JulianaNishimura",
    linkedin: "https://www.linkedin.com/in/juliana-yumi-nishimura-50197b341/"
  },
  {
    id: 5,
    name: "Raíssa Bernardo",
    role: "Desenvolvedora Full-Stack",
    area: "Tech Leade & Embedded Engineer",
    image: "https://avatars.githubusercontent.com/u/195800622?v=4",
    github: "https://github.com/RaissaBernardo",
    linkedin: "https://www.linkedin.com/in/raissa-antonia-bernardo-6b4493168/"
  },
  {
    id: 6,
    name: "Vitoria Amaro",
    role: "Desenvolvedora Full-Stack",
    area: "Desenvolvedora Front-End",
    image: "https://avatars.githubusercontent.com/u/195800833?v=4",
    github: "https://github.com/Vitorinha435",
    linkedin: "https://linkedin.com/in/Vitorinha435"
  }
];

function ContactModal({ isVisible, isClosing, onClose }) {
  const [hoveredCard, setHoveredCard] = useState(null);

  console.log('[ContactModal] Estado do modal:', { isVisible, isClosing });

  if (!isVisible) return null;

  return (
    <div 
      className={`contact-modal-backdrop ${isClosing ? 'fade-out' : ''}`}
      onClick={onClose}
    >
      <div 
        className={`contact-modal-wrapper ${isClosing ? 'slide-out' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          className="contact-close-btn" 
          onClick={() => {
            console.log('[ContactModal] Botão fechar clicado');
            onClose();
          }}
        >
          <FaTimes />
        </button>

        <div className="contact-header">
          <h2>Nossa Equipe</h2>
          <p>Conheça as pessoas por trás da LyrIA</p>
        </div>

        <div className="team-grid">
          {teamMembers.map((member) => (
            <div
              key={member.id}
              className={`team-card ${hoveredCard === member.id ? 'hovered' : ''}`}
              onMouseEnter={() => setHoveredCard(member.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className="team-card-content">
                <div className="member-photo-wrapper">
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="member-photo"
                  />
                </div>

                <div className="member-info">
                  <h3 className="member-name">{member.name}</h3>
                  <p className="member-role">{member.role}</p>
                  <p className="member-area">{member.area}</p>
                </div>

                <div className="member-links">
                  <a
                    href={member.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-link"
                    onClick={() => console.log('[ContactModal] GitHub clicado:', member.name)}
                  >
                    <FaGithub />
                  </a>
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-link"
                    onClick={() => console.log('[ContactModal] LinkedIn clicado:', member.name)}
                  >
                    <FaLinkedin />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ContactModal;