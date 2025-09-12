import api from './api';

export const conversarAnonimo = async (pergunta, signal) => {
  try {
    const response = await api.post('/Lyria/conversar', { pergunta }, { signal });
    return response.data;
  } catch (error) {
    if (error.name !== 'AbortError') {
      console.error("Erro ao conversar com a Lyria (anônimo):", error);
    }
    throw error;
  }
};
