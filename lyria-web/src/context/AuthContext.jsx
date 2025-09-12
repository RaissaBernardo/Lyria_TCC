import React, { createContext, useState, useContext, useEffect } from 'react';
import { login as apiLogin } from '../services/LyriaApi';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Derivamos o estado de autenticação diretamente do estado do usuário.
  // Isso garante que eles estejam sempre em sincronia.
  const isAuthenticated = !!user;

  useEffect(() => {
    // Verifica se há um usuário salvo no localStorage ao carregar a página
    try {
      const storedUser = localStorage.getItem('lyriaUser');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Falha ao ler o usuário do localStorage", error);
      localStorage.removeItem('lyriaUser');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (credentials) => {
    const response = await apiLogin(credentials);
    if (response.sucesso) {
      setUser(response.usuario);
      localStorage.setItem('lyriaUser', JSON.stringify(response.usuario));
    }
    return response;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('lyriaUser');
  };

  const updateUser = (updatedUserData) => {
    const newUser = { ...user, ...updatedUserData };
    setUser(newUser);
    localStorage.setItem('lyriaUser', JSON.stringify(newUser));
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    updateUser,
  };

  // Não renderiza a aplicação até que a verificação inicial do localStorage seja concluída
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
