// src/components/Header/index.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import './Styles/styles.css';

function Header() {
  // NOVO: Função para controlar a rolagem
  const handleScrollTo = (event, targetId) => {
    // 1. Previne o comportamento padrão do link (que é só mudar a URL)
    event.preventDefault();

    // 2. Encontra o elemento na página pelo ID que definimos
    const targetElement = document.getElementById(targetId);

    // 3. Se o elemento existir, rola a tela até ele
    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: 'smooth', // Define a animação de rolagem suave
        block: 'start'      // Alinha o topo do elemento com o topo da tela
      });
    }
  };

  return (
    <header className="main-header">
      <div className="header-container">
        <h1 className="logo">LYRIA</h1>
        <nav className="main-nav">
          <Link to="/">Página Inicial</Link>
          
          {/* MUDANÇA: Adicionamos um evento onClick para chamar nossa função */}
          <a 
            href="#nossa-historia" 
            onClick={(e) => handleScrollTo(e, 'nossa-historia')}
          >
            Sobre
          </a>
          
          <Link to="/chat">Chat</Link>
          <Link to="/RegistrationAndLogin">Entrar</Link>
        </nav>
      </div>
    </header>
  );
}

export default Header;