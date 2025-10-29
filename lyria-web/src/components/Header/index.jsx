import { Link } from 'react-router-dom';
import { useRef } from 'react';
import { baseURL } from '../../services/api';
import logoImage from '../../assets/img/LogoBranca.png';
import useClickOutside from '../../hooks/useClickOutside';

function Header({ 
  isAuthenticated, 
  user, 
  dropdownVisible, 
  setDropdownVisible, 
  handleLogout,
  toggleContactModal 
}) {
  
  console.log('[Header] Renderizando componente', {
    isAuthenticated,
    userName: user?.nome,
    dropdownVisible
  });

  const handleUserClick = () => {
    console.log('[Header] Toggle dropdown clicado');
    setDropdownVisible(!dropdownVisible);
  };

  const handleLogoutClick = () => {
    console.log('[Header] Logout clicado');
    handleLogout();
  };

  const dropdownRef = useRef(null);
  useClickOutside(dropdownRef, () => setDropdownVisible(false));

  return (
    <header className="app-header">
      <Link to={'/'} className="logo-link">
        <div className="logo">
          <img src={logoImage} alt="Logo da LyrIA" className="logo-image" />
        </div>
      </Link>

      <nav className="main-nav">
        <div className="nav-actions">
          {isAuthenticated ? (
            <div className="user-profile-section" ref={dropdownRef}>
              <div
                className="user-indicator"
                onClick={handleUserClick}
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
                  <button onClick={handleLogoutClick}>Sair</button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to={'/RegistrationAndLogin'}
              className="nav-button"
              onClick={() => console.log('[Header] Navegando para login')}
            >
              Entrar
            </Link>
          )}
          <button
            onClick={() => {
              console.log('[Header] Abrindo modal de contato');
              toggleContactModal();
            }}
            className="nav-button"
          >
            Contato
          </button>
        </div>
      </nav>
    </header>
  );
}

export default Header;