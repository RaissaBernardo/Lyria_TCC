import api from "./api";

// ------------------- Conversa -------------------
export const conversarAnonimo = async (pergunta, persona, signal) => {
  console.log("API: Chamando conversarAnonimo", { pergunta, persona });
  try {
    const response = await api.post("/Lyria/conversar", { pergunta, persona }, { signal });
    console.log("API: Sucesso em conversarAnonimo", response.data);
    return response.data;
  } catch (error) {
    if (error.name !== "AbortError") console.error("API: Erro em conversarAnonimo:", error);
    throw error;
  }
};

export const postMessage = async (pergunta, conversa_id, signal) => {
  console.log("API: Chamando postMessage", { pergunta, conversa_id });
  try {
    const response = await api.post(
      "/Lyria/conversar-logado",
      { pergunta, conversa_id },
      { signal }
    );
    console.log("API: Sucesso em postMessage", response.data);
    return response.data;
  } catch (error) {
    if (error.name !== "AbortError") console.error("API: Erro em postMessage:", error);
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
  console.log("API: Tentando deletar conversa com ID:", conversationId);
  try {
    const response = await api.delete(`/Lyria/conversas/${conversationId}`);
    console.log("API: Sucesso ao deletar conversa", response.data);
    return response.data;
  } catch (error) {
    console.error("API: Erro ao deletar conversa:", error);
    throw error;
  }
};

export const getConversations = async () => {
  console.log("API: Buscando lista de conversas...");
  try {
    const response = await api.get("/Lyria/conversas");
    console.log("API: Conversas recebidas:", response.data);
    return response.data;
  } catch (error) {
    console.error("API: Erro ao buscar lista de conversas:", error);
    throw error;
  }
};

export const getMessagesForConversation = async (conversationId) => {
  console.log("API: Buscando mensagens para a conversa ID:", conversationId);
  try {
    const response = await api.get(`/Lyria/conversas/${conversationId}/mensagens`);
    console.log("API: Mensagens recebidas:", response.data);
    return response.data;
  } catch (error) {
    console.error("API: Erro ao carregar mensagens da conversa:", error);
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
