import axios from "axios";

export const baseURL = import.meta.env.VITE_API_BASE_URL;

if (!baseURL) {
  console.error(
    "ERRO: A variável de ambiente VITE_API_BASE_URL não está definida."
  );
}

const api = axios.create({
  baseURL: baseURL,

  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
