import { useState } from 'react';
import { FiX } from 'react-icons/fi';
import { useToast } from '../../context/ToastContext';
import { esqueciMinhaSenha } from '../../services/LyriaApi';
import './Styles/styles.css';

const ForgotPasswordModal = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  if (!isOpen) {
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      addToast("Por favor, digite seu e-mail.", "error");
      return;
    }
    setLoading(true);
    try {
      const response = await esqueciMinhaSenha({ email });
      if (response.status === 'ok') {
        addToast("Se um usuário com este e-mail existir, um link de redefinição de senha será enviado.", "success");
        onClose();
      } else {
        addToast(response.erro || "Ocorreu um erro. Tente novamente.", "error");
      }
    } catch (err) {
      addToast(err.response?.data?.erro || "Erro de conexão. Tente novamente.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="forgot-password-modal-overlay" onClick={handleOverlayClick}>
      <div className="forgot-password-modal-content">
        <button className="forgot-password-modal-close-btn" onClick={onClose}>
          <FiX />
        </button>
        <h2>Redefinir Senha</h2>
        <p>Digite seu e-mail abaixo e enviaremos um link para você redefinir sua senha.</p>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              type="email"
              placeholder="Seu e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'ENVIANDO...' : 'ENVIAR'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
