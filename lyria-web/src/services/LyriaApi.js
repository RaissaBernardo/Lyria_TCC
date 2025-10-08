import api from "./api";

// ------------------- Conversa -------------------
export const conversarAnonimo = async (pergunta, persona, signal) => {
  try {
    const response = await api.post("/Lyria/conversar", { pergunta, persona }, { signal });
    return response.data;
  } catch (error) {
    if (error.name !== "AbortError") console.error("Erro ao conversar anonimamente:", error);
    throw error;
  }
};

export const postMessage = async (pergunta, signal) => {
  try {
    const response = await api.post(
      "/Lyria/conversar-logado",
      { pergunta },
      { signal }
    );
    return response.data;
  } catch (error) {
    if (error.name !== "AbortError") console.error("Erro ao conversar logado:", error);
    throw error;
  }
};

// ------------------- Perfil -------------------
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
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    console.error("Erro ao atualizar perfil do usuário:", error);
    throw error;
  }
};

// ------------------- Conversas -------------------
export const deleteConversation = async (conversationId) => {
  try {
    const response = await api.delete(`/Lyria/conversas/${conversationId}`);
    return response.data;
  } catch (error) {
    console.error("Erro ao deletar conversa:", error);
    throw error;
  }
};

export const getConversations = async () => {
  try {
    const response = await api.get("/Lyria/conversas");
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

// ------------------- Persona -------------------
export const putPersona = async (persona) => {
  try {
    const response = await api.put("/Lyria/PersonaEscolhida", { persona });
    return response.data;
  } catch (error) {
    console.error("Erro ao definir persona:", error);
    throw error;
  }
};

export const getPersona = async () => {
  try {
    const response = await api.get("/Lyria/PersonaEscolhida");
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar persona:", error);
    throw error;
  }
};

export const getPersonas = async () => {
  try {
    const response = await api.get("/Lyria/personas");
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar personas:", error);
    throw error;
  }
};

// ------------------- Usuário -------------------
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
    const response = await api.post("/Lyria/usuarios", userData);
    return response.data;
  } catch (error) {
    console.error("Erro ao registrar usuário:", error);
    throw error;
  }
};
