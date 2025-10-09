import React, { useState, useEffect } from "react";
import {
  FaEye,
  FaEyeSlash,
  FaChalkboardTeacher,
  FaBriefcase,
  FaUserFriends,
  FaVolumeUp,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { register, getPersonas } from "../../services/LyriaApi";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import "./Styles/styles.css";

import {
  SpeechConfig,
  SpeechSynthesizer,
} from "microsoft-cognitiveservices-speech-sdk";

const speechConfig = SpeechConfig.fromSubscription(
  import.meta.env.VITE_SPEECH_KEY,
  import.meta.env.VITE_SPEECH_REGION
);
speechConfig.speechRecognitionLanguage = "pt-BR";

const availableVoices = [
  { value: "pt-BR-FranciscaNeural", label: "LyrIA" },
  { value: "pt-BR-BrendaNeural", label: "Brenda" },
  { value: "pt-BR-GiovanaNeural", label: "Giovana" },
  { value: "pt-BR-LeticiaNeural", label: "Leticia" },
  { value: "pt-BR-AntonioNeural", label: "Antonio" },
  { value: "pt-BR-DonatoNeural", label: "Leonardo" },
];

const personaDetails = {
  professor: {
    icon: <FaChalkboardTeacher />,
    title: "Professora",
    description:
      "Didática, acessível e objetiva. Ideal para aprender novos conceitos e tirar dúvidas complexas.",
  },
  empresarial: {
    icon: <FaBriefcase />,
    title: "Assistente Corporativa",
    description:
      "Profissional, direta e focada em resultados. Perfeita para o ambiente de trabalho e tarefas objetivas.",
  },
  social: {
    icon: <FaUserFriends />,
    title: "Companheira Social",
    description:
      "Acolhedora, empática e compreensiva. Uma parceira para conversas do dia a dia e suporte emocional.",
  },
};

function LoginRegisterPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState(1); // Gerencia as etapas do cadastro
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

  // State for step 2
  const [personas, setPersonas] = useState({});
  const [selectedPersona, setSelectedPersona] = useState("professor");
  const [selectedVoice, setSelectedVoice] = useState(availableVoices[0].value);

  // Loading state
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Busca as personas quando o formulário de registro é exibido
    if (!isLogin) {
      const fetchPersonas = async () => {
        try {
          const response = await getPersonas();
          setPersonas(response.personas || {});
        } catch (error) {
          addToast("Não foi possível carregar as personas.", "error");
        }
      };
      fetchPersonas();
    }
  }, [isLogin, addToast]);

  const toggleForm = () => {
    setAnimationClass("fade-out");
    setTimeout(() => {
      setIsLogin(!isLogin);
      setStep(1); // Reseta para a etapa 1 ao alternar
      setAnimationClass("fade-in");
    }, 400);
  };

  const handleNextStep = () => {
    // Validação dos campos da primeira etapa
    if (!nome.trim() || !email.trim() || !senha.trim()) {
      addToast("Por favor, preencha todos os campos.", "error");
      return;
    }
    if (senha !== confirmarSenha) {
      addToast("As senhas não coincidem.", "error");
      return;
    }
    // Avança para a próxima etapa
    setAnimationClass("fade-out");
    setTimeout(() => {
      setStep(2);
      setAnimationClass("fade-in");
    }, 400);
  };

  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await login({ email, senha_hash: senha });
      if (response.status === "ok") {
        addToast("Login bem-sucedido! Redirecionando...", "success");
        navigate("/chat");
      } else {
        addToast(response.erro || "Erro ao fazer login.", "error");
      }
    } catch (err) {
      addToast(
        err.response?.data?.erro || "Erro de conexão. Tente novamente.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    const userData = {
      nome,
      email,
      senha_hash: senha,
      persona: selectedPersona,
    };

    setLoading(true);
    try {
      const response = await register(userData);
      if (response.sucesso) {
        // Salva a voz escolhida no localStorage
        localStorage.setItem("lyriaVoice", selectedVoice);
        addToast(
          "Cadastro realizado com sucesso! Faça o login para continuar.",
          "success"
        );
        toggleForm(); // Alterna para a tela de login
      } else {
        addToast(response.erro || "Erro ao registrar.", "error");
      }
    } catch (err) {
      addToast(
        err.response?.data?.erro || "Erro de conexão. Tente novamente.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = (event) => {
    event.preventDefault();
    if (isLogin) {
      handleLogin();
    } else {
      if (step === 1) {
        handleNextStep();
      } else {
        handleRegister();
      }
    }
  };

  const handleTestVoice = () => {
    const synthesizer = new SpeechSynthesizer(speechConfig);
    const voiceName = selectedVoice;
    const testText = `Olá, esta é uma amostra da minha voz. Eu sou ${
      availableVoices.find((v) => v.value === voiceName)?.label
    }.`;

    const ssml = `
        <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="pt-BR">
            <voice name="${voiceName}">
                ${testText}
            </voice>
        </speak>`;

    synthesizer.speakSsmlAsync(
      ssml,
      (result) => {
        if (result) {
          synthesizer.close();
        }
      },
      (error) => {
        console.error("Erro ao sintetizar a voz:", error);
        synthesizer.close();
      }
    );
  };

  const renderRegisterStep1 = () => (
    <>
      <h2 className="form-title">Crie sua Conta</h2>
      <p className="form-subtitle">
        Junte-se a nós e explore o universo LyrIA.
      </p>
      <div className="input-group">
        <input
          type="text"
          placeholder="Nome"
          required
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />
      </div>
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
      <button type="submit" className="submit-btn" disabled={loading}>
        PRÓXIMO
      </button>
    </>
  );

  const renderRegisterStep2 = () => (
    <>
      <h2 className="form-title">Personalize sua LyrIA</h2>
      <p className="form-subtitle">
        Escolha a personalidade e a voz que mais combinam com você.
      </p>

      <div className="selection-group">
        <label>Escolha uma Persona:</label>
        <div className="persona-options">
          {Object.keys(personas).map((key) => (
            <div
              key={key}
              className={`persona-card ${
                selectedPersona === key ? "selected" : ""
              }`}
              onClick={() => setSelectedPersona(key)}
            >
              <div className="persona-icon">{personaDetails[key]?.icon}</div>
              <strong>{personaDetails[key]?.title}</strong>
              <p>{personaDetails[key]?.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="selection-group">
        <label htmlFor="voice-select">Escolha uma Voz:</label>
        <div className="voice-selection-container">
          <select
            id="voice-select"
            className="voice-select-input"
            value={selectedVoice}
            onChange={(e) => setSelectedVoice(e.target.value)}
          >
            {availableVoices.map((voice) => (
              <option key={voice.value} value={voice.value}>
                {voice.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="test-voice-btn"
            onClick={handleTestVoice}
          >
            <FaVolumeUp />
          </button>
        </div>
      </div>

      <div className="button-group">
        <button
          type="button"
          className="secondary-btn"
          onClick={() => setStep(1)}
        >
          VOLTAR
        </button>
        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? "CADASTRANDO..." : "CADASTRAR"}
        </button>
      </div>
    </>
  );

  const renderLogin = () => (
    <>
      <h2 className="form-title">Bem-vindo de Volta</h2>
      <p className="form-subtitle">Entre para continuar sua jornada cósmica.</p>
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
      <a href="#" className="forgot-password">
        Esqueceu sua senha?
      </a>
      <button type="submit" className="submit-btn" disabled={loading}>
        {loading ? "ENTRANDO..." : "ENTRAR"}
      </button>
    </>
  );

  return (
    <div className="auth-body">
      <div
        className={`form-container ${
          isLogin ? "login-active" : "register-active"
        }`}
      >
        <form
          onSubmit={handleAuth}
          className={`form-content ${animationClass}`}
        >
          {isLogin
            ? renderLogin()
            : step === 1
            ? renderRegisterStep1()
            : renderRegisterStep2()}
        </form>
        <p className="toggle-form-text">
          {isLogin ? "Não tem uma conta?" : "Já possui uma conta?"}{" "}
          <span onClick={toggleForm}>
            {isLogin ? "Cadastre-se" : "Faça Login"}
          </span>
        </p>
      </div>
    </div>
  );
}

export default LoginRegisterPage;
