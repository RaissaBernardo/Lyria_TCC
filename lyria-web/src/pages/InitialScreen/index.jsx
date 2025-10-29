import { useState, useEffect } from 'react';
import './Styles/styles.css';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useModal } from '../../hooks/useModal';
import LoginPrompt from '../../components/LoginPrompt';
import Header from '../../components/Header';
import HeroSection from '../../components/HeroSection';
import InfoModal from '../../components/InfoModal';
import ContactModal from '../../components/ContactModal';

function InitialScreen() {
  // Hooks de modais
  const infoModal = useModal('InfoModal');
  const contactModal = useModal('ContactModal');
  
  // Estados locais
  const [isLoginPromptVisible, setLoginPromptVisible] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);

  // Contexto e navegação
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  // ==================== LIFECYCLE LOGS ====================
  
  useEffect(() => {
    console.log('╔════════════════════════════════════════╗');
    console.log('║   [InitialScreen] COMPONENTE MONTADO   ║');
    console.log('╚════════════════════════════════════════╝');
    console.log('[InitialScreen] Estado inicial:', {
      isAuthenticated,
      userName: user?.nome,
      userEmail: user?.email,
      hasProfilePicture: !!user?.foto_perfil_url
    });

    return () => {
      console.log('[InitialScreen] 🔴 Componente desmontado');
    };
  }, []);

  useEffect(() => {
    console.log('[InitialScreen] 🔐 Mudança de autenticação:', {
      isAuthenticated,
      user: user?.nome || 'Não autenticado',
      timestamp: new Date().toISOString()
    });
  }, [isAuthenticated, user]);

  useEffect(() => {
    console.log('[InitialScreen] 📊 Estados dos componentes:', {
      infoModal: infoModal.isVisible,
      contactModal: contactModal.isVisible,
      loginPrompt: isLoginPromptVisible,
      userDropdown: dropdownVisible
    });
  }, [
    infoModal.isVisible, 
    contactModal.isVisible, 
    isLoginPromptVisible, 
    dropdownVisible
  ]);

  // ==================== HANDLERS ====================

  /**
   * Realiza logout do usuário
   */
  const handleLogout = () => {
    console.log('[InitialScreen] 🚪 Iniciando processo de logout');
    console.log('[InitialScreen] Usuário atual:', user?.nome);
    
    try {
      logout();
      setDropdownVisible(false);
      console.log('[InitialScreen] ✅ Logout concluído com sucesso');
    } catch (error) {
      console.error('[InitialScreen] ❌ Erro ao fazer logout:', error);
    }
  };

  /**
   * Inicia a aplicação - verifica autenticação
   */
  const handleStartClick = () => {
    console.log('═══════════════════════════════════════');
    console.log('[InitialScreen] 🚀 BOTÃO COMEÇAR CLICADO');
    console.log('═══════════════════════════════════════');
    console.log('[InitialScreen] Status de autenticação:', isAuthenticated);
    
    if (isAuthenticated) {
      console.log('[InitialScreen] ➡️  Redirecionando para /chat (usuário autenticado)');
      console.log('[InitialScreen] Usuário:', user?.nome);
      navigate('/chat');
    } else {
      console.log('[InitialScreen] 🔒 Exibindo prompt de login (usuário não autenticado)');
      setLoginPromptVisible(true);
    }
  };

  /**
   * Continua como visitante sem autenticação
   */
  const handleContinueAsGuest = () => {
    console.log('[InitialScreen] 👤 Continuando como visitante');
    console.log('[InitialScreen] Navegando para /chat sem autenticação');
    setLoginPromptVisible(false);
    navigate('/chat');
  };

  /**
   * Fecha o prompt de login
   */
  const handleDismissLoginPrompt = () => {
    console.log('[InitialScreen] ❌ Fechando prompt de login');
    setLoginPromptVisible(false);
  };

  // ==================== RENDER ====================

  console.log('[InitialScreen] 🎨 Renderizando componente principal...');

  return (
    <div className="App">
      {/* Prompt de Login */}
      {isLoginPromptVisible && (
        <>
          {console.log('[InitialScreen] Renderizando LoginPrompt')}
          <LoginPrompt
            onDismiss={handleDismissLoginPrompt}
            onContinueAsGuest={handleContinueAsGuest}
            showContinueAsGuest={true}
          />
        </>
      )}

      {/* Cabeçalho */}
      <Header
        isAuthenticated={isAuthenticated}
        user={user}
        dropdownVisible={dropdownVisible}
        setDropdownVisible={setDropdownVisible}
        handleLogout={handleLogout}
        toggleContactModal={contactModal.toggle}
      />

      {/* Seção Principal (Hero) */}
      <HeroSection
        onStartClick={handleStartClick}
        onLearnMoreClick={infoModal.toggle}
      />

      {/* Modal de Informações */}
      <InfoModal
        isVisible={infoModal.isVisible}
        isClosing={infoModal.isClosing}
        onClose={infoModal.toggle}
      />

      {/* Modal de Contato */}
      <ContactModal
        isVisible={contactModal.isVisible}
        isClosing={contactModal.isClosing}
        onClose={contactModal.toggle}
      />
    </div>
  );
}

export default InitialScreen;