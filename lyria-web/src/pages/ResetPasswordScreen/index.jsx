import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiEye, FiEyeSlash, FiLock } from 'react-icons/fi';
import { useToast } from '../../context/ToastContext';
import { redefinirSenha } from '../../services/LyriaApi';
import PasswordStrength from '../../components/PasswordStrength';
import { validatePassword } from '../RegistrationAndLoginScreen/validations';
import './styles.css';

function ResetPasswordScreen() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [token, setToken] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tokenValido, setTokenValido] = useState(true);

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (!tokenFromUrl) {
      addToast('Token de redefinição não encontrado.', 'error');
      setTokenValido(false);
      setTimeout(() => navigate('/RegistrationAndLogin'), 3000);
    } else {
      setToken(tokenFromUrl);
    }
  }, [searchParams, navigate, addToast]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validações
    if (!novaSenha || !confirmarSenha) {
      addToast('Por favor, preencha todos os campos.', 'error');
      return;
    }

    const passwordErrors = validatePassword(novaSenha);
    if (passwordErrors.length > 0) {
      addToast('A senha não atende aos requisitos de segurança.', 'error');
      return;
    }

    if (novaSenha !== confirmarSenha) {
      addToast('As senhas não coincidem.', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await redefinirSenha({
        token,
        nova_senha: novaSenha,
      });

      if (response.status === 'ok') {
        addToast('Senha redefinida com sucesso! Redirecionando para login...', 'success');
        setTimeout(() => navigate('/RegistrationAndLogin'), 2000);
      } else {
        addToast(response.erro || 'Erro ao redefinir senha.', 'error');
      }
    } catch (error) {
      console.error('Erro ao redefinir senha:', error);
      addToast(
        error.response?.data?.erro || 'Erro de conexão. Tente novamente.',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  if (!tokenValido) {
    return (
      <div className="reset-password-container">
        <div className="reset-password-form">
          <FiLock className="icon-large" />
          <h2>Link Inválido</h2>
          <p>O link de redefinição de senha é inválido ou expirou.</p>
          <p>Você será redirecionado para a página de login...</p>
        </div>
      </div>
    );
  }

  const passwordErrors = validatePassword(novaSenha);
  const isPasswordStrong = passwordErrors.length === 0;

  return (
    <div className="reset-password-container">
      <div className="reset-password-form">
        <FiLock className="icon-large" />
        <h2>Redefinir Senha</h2>
        <p>Digite sua nova senha abaixo.</p>

        <form onSubmit={handleSubmit}>
          <div className="input-group" style={{ position: 'relative' }}>
            <input
              type={passwordVisible ? 'text' : 'password'}
              placeholder="Nova Senha"
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              onFocus={() => setIsPasswordFocused(true)}
              onBlur={() => setIsPasswordFocused(false)}
              required
            />
            {isPasswordFocused && !isPasswordStrong && (
              <PasswordStrength password={novaSenha} />
            )}
            <span
              className="password-toggle-icon"
              onClick={() => setPasswordVisible(!passwordVisible)}
            >
              {passwordVisible ? <FiEyeSlash /> : <FiEye />}
            </span>
          </div>

          <div className="input-group">
            <input
              type={confirmPasswordVisible ? 'text' : 'password'}
              placeholder="Confirmar Nova Senha"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              required
            />
            <span
              className="password-toggle-icon"
              onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
            >
              {confirmPasswordVisible ? <FiEyeSlash /> : <FiEye />}
            </span>
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'REDEFININDO...' : 'REDEFINIR SENHA'}
          </button>
        </form>

        <p className="back-to-login">
          Lembrou sua senha?{' '}
          <span onClick={() => navigate('/RegistrationAndLogin')}>
            Fazer Login
          </span>
        </p>
      </div>
    </div>
  );
}

export default ResetPasswordScreen; 