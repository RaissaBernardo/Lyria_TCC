import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Styles/styles.css';

function Header() {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const handleScrollTo = (event, targetId) => {
    event.preventDefault();
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/RegistrationAndLogin'); // Redireciona após o logout
  };

  return (
    <header className="main-header">
      <div className="header-container">
        <h1 className="logo">LYRIA</h1>
        <nav className="main-nav">
          <Link to="/">Página Inicial</Link>
          <a href="#nossa-historia" onClick={(e) => handleScrollTo(e, 'nossa-historia')}>
            Sobre
          </a>
          <Link to="/chat">Chat</Link>

          {isAuthenticated ? (
            <div className="user-profile-section">
              <div
                className="user-indicator"
                onClick={() => setDropdownVisible(!dropdownVisible)}
              >
                {/* Pega a primeira letra do nome do usuário para a bolinha */}
                {user?.nome?.charAt(0).toUpperCase()}
              </div>
              {dropdownVisible && (
                <div className="user-dropdown">
                  <button onClick={handleLogout}>Sair</button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/RegistrationAndLogin">Entrar</Link>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;