import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiLogIn } from 'react-icons/fi';
import './styles.css';

const LoginPrompt = ({ onDismiss, onContinueAsGuest, showContinueAsGuest }) => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/RegistrationAndLogin');
  };

  // Se onContinueAsGuest não for fornecido, ele simplesmente dispensa o modal.
  const handleGuestContinue = onContinueAsGuest || onDismiss;

  return (
    <div className="login-prompt-overlay">
      <div className="login-prompt-content">
        <h3>Recurso Exclusivo para Usuários</h3>
        <p>
          Para salvar seu histórico de conversas e ter uma experiência completa,
          faça o login.
        </p>
        <button onClick={handleLogin} className="login-btn">
          <FiLogIn />
          Fazer Login ou Cadastrar
        </button>
        {showContinueAsGuest && (
          <button onClick={handleGuestContinue} className="guest-btn">
            Continuar sem login
          </button>
        )}
        <button onClick={onDismiss} className="dismiss-btn">
          Agora não
        </button>
      </div>
    </div>
  );
};

export default LoginPrompt;
