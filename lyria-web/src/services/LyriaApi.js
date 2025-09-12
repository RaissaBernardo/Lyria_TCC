import api from "./api";

export const conversarAnonimo = async (pergunta, signal) => {
  try {
    const response = await api.post("/Lyria/conversar", { pergunta }, { signal });
    return response.data;
  } catch (error) {
    if (error.name !== 'AbortError') {
      console.error("Erro ao conversar com a Lyria (anônimo):", error);
    }
    throw error;
  }
};

export const getUserProfile = async (userId) => {
  try {
    const response = await api.get(`/Lyria/profile/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar perfil do usuário:", error);
    throw error;
  }
};

export const updateUserProfile = async (userId, formData) => {
  try {
    const response = await api.put(`/Lyria/profile/${userId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error("Erro ao atualizar perfil do usuário:", error);
    throw error;
  }
};

export const deleteConversation = async (conversationId) => {
  try {
    const response = await api.delete(`/Lyria/conversas/${conversationId}`);
    return response.data;
  } catch (error) {
    console.error("Erro ao deletar conversa:", error);
    throw error;
  }
};

export const getConversations = async (username) => {
  try {
    const response = await api.get(`/Lyria/${username}/conversas`);
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar lista de conversas:", error);
    throw error;
  }
};

export const getMessagesForConversation = async (conversationId) => {
  try {
    const response = await api.get(`/Lyria/conversas/${conversationId}/mensagens`);
    return response.data;
  } catch (error) {
    console.error("Erro ao carregar mensagens da conversa:", error);
    throw error;
  }
};

export const postMessage = async (username, conversationId, question, signal) => {
  try {
    const response = await api.post(`/Lyria/${username}/conversar`, {
      pergunta: question,
      conversa_id: conversationId,
    }, { signal });
    return response.data;
  } catch (error) {
    if (error.name !== 'AbortError') {
      console.error("Erro ao enviar mensagem:", error);
    }
    throw error;
  }
};

export const setPersona = async (usuario, persona) => {
  try {
    const response = await api.post(`/Lyria/${usuario}/PersonaEscolhida`, {
      persona,
    });
    return response.data;
  } catch (error) {
    console.error("Erro ao definir persona:", error);
    throw error;
  }
};

export const getPersona = async (usuario) => {
  try {
    const response = await api.get(`/Lyria/${usuario}/PersonaEscolhida`);
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar persona:", error);
    throw error;
  }
};

export const login = async (credentials) => {
  try {
    const response = await api.post("/Lyria/login", credentials);
    return response.data;
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    throw error;
  }
};

export const register = async (userData) => {
  try {
    const response = await api.post("/Lyria/register", userData);
    return response.data;
  } catch (error) {
    console.error("Erro ao registrar usuário:", error);
    throw error;
  }
};
