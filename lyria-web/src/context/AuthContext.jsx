import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { login as apiLogin } from '../services/LyriaApi';
import api from '../services/api'; // Importe a instância do axios

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Verifica se há sessão ativa no backend ao iniciar
  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log('🔍 Verificando sessão no backend...');
        const response = await api.get('/Lyria/check-session');
        
        if (response.data.autenticado) {
          console.log('✅ Sessão ativa encontrada:', response.data);
          
          // Recupera dados do localStorage ou usa os da sessão
          const storedUser = localStorage.getItem('lyriaUser');
          const userData = storedUser ? JSON.parse(storedUser) : {
            nome: response.data.usuario,
            email: response.data.email,
          };
          
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          console.log('❌ Nenhuma sessão ativa no backend');
          // Limpa dados locais se não há sessão no backend
          localStorage.removeItem('lyriaUser');
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('❌ Erro ao verificar sessão:', error);
        // Se der erro, limpa tudo
        localStorage.removeItem('lyriaUser');
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = async (credentials) => {
    try {
      console.log('🔐 Iniciando login...');
      const response = await apiLogin(credentials);
      
      if (response.status === 'ok') {
        // Aguarda um pouco para garantir que o cookie foi salvo
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Verifica se a sessão foi realmente criada
        console.log('🔍 Verificando se sessão foi criada...');
        const sessionCheck = await api.get('/Lyria/check-session');
        console.log('📋 Resposta da verificação:', sessionCheck.data);
        
        if (!sessionCheck.data.autenticado) {
          console.error('❌ Sessão não foi criada no backend!');
          throw new Error('Falha ao criar sessão. Tente novamente.');
        }
        
        const userData = {
          nome: response.usuario,
          email: credentials.email,
          persona: response.persona
        };
        
        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem('lyriaUser', JSON.stringify(userData));
        
        console.log('✅ Login completo e sessão verificada:', userData);
        return response;
      }
      
      return response;
    } catch (error) {
      console.error('❌ Erro no login:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log('🚪 Fazendo logout...');
      await api.post('/Lyria/logout');
      console.log('✅ Logout no backend concluído');
    } catch (error) {
      console.error('❌ Erro ao fazer logout no backend:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('lyriaUser');
      localStorage.removeItem('lyriaPersona');
      localStorage.removeItem('lyriaVoice');
      console.log('✅ Dados locais limpos');
    }
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('lyriaUser', JSON.stringify(userData));
  };

  const contextValue = useMemo(() => ({
    user,
    isAuthenticated,
    login,
    logout,
    updateUser,
    loading,
  }), [user, isAuthenticated, loading]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};