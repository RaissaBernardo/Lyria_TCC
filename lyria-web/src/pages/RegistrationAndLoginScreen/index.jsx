import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { register } from "../../services/LyriaApi";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import "./Styles/styles.css";

function LoginRegisterPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [animationClass, setAnimationClass] = useState("fade-in");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { addToast } = useToast();

  // Form state
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  // Loading state
  const [loading, setLoading] = useState(false);

  const toggleForm = () => {
    setAnimationClass("fade-out");
    setTimeout(() => {
      setIsLogin(!isLogin);
      setAnimationClass("fade-in");
    }, 400); // Deve corresponder à duração da animação de fade-out
  };

  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await login({ email, senha });
      if (response.sucesso) {
        addToast("Login bem-sucedido! Redirecionando...", "success");
        navigate("/");
      } else {
        addToast(response.erro || "Erro ao fazer login.", "error");
      }
    } catch (err) {
      addToast(err.response?.data?.erro || "Erro de conexão. Tente novamente.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (senha !== confirmarSenha) {
      addToast("As senhas não coincidem.", "error");
      return;
    }
    setLoading(true);
    try {
      const response = await register({ nome, email, senha });
      if (response.sucesso) {
        addToast("Cadastro realizado com sucesso! Faça o login para continuar.", "success");
        toggleForm(); // Alterna para a tela de login
      } else {
        addToast(response.erro || "Erro ao registrar.", "error");
      }
    } catch (err) {
      addToast(err.response?.data?.erro || "Erro de conexão. Tente novamente.", "error");
    } finally {
      setLoading(false);
    }
  };


  const handleAuth = (event) => {
    event.preventDefault();
    if (isLogin) {
      handleLogin();
    } else {
      handleRegister();
    }
  };

  return (
    <div className="auth-body">
      <div className={`form-container ${isLogin ? "login-active" : "register-active"}`}>
        <div className={`form-content ${animationClass}`}>
          <h2 className="form-title">{isLogin ? "Bem-vindo de Volta" : "Crie sua Conta"}</h2>
          <p className="form-subtitle">
            {isLogin
              ? "Entre para continuar sua jornada cósmica."
              : "Junte-se a nós e explore o universo LyrIA."}
          </p>

          <form onSubmit={handleAuth}>
            {!isLogin && (
              <div className="input-group">
                <input
                  type="text"
                  placeholder="Nome"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                />
              </div>
            )}
            <div className="input-group">
              <input
                type="email"
                placeholder="Email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="input-group">
              <input
                type={passwordVisible ? "text" : "password"}
                placeholder="Senha"
                required
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
              />
              <span
                className="password-toggle-icon"
                onClick={() => setPasswordVisible(!passwordVisible)}
              >
                {passwordVisible ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
            {!isLogin && (
              <div className="input-group">
                <input
                  type={confirmPasswordVisible ? "text" : "password"}
                  placeholder="Confirmar Senha"
                  required
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                />
                 <span
                className="password-toggle-icon"
                onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
              >
                {confirmPasswordVisible ? <FaEyeSlash /> : <FaEye />}
              </span>
              </div>
            )}

            {isLogin && (
                <a href="#" className="forgot-password">Esqueceu sua senha?</a>
            )}

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "CARREGANDO..." : (isLogin ? "ENTRAR" : "CADASTRAR")}
            </button>
          </form>

          <p className="toggle-form-text">
            {isLogin ? "Não tem uma conta?" : "Já possui uma conta?"}{" "}
            <span onClick={toggleForm}>{isLogin ? "Cadastre-se" : "Faça Login"}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginRegisterPage;