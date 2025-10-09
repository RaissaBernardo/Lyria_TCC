import axios from "axios";

//export const baseURL = import.meta.env.VITE_API_BASE_URL;
export const baseURL = "https://lyria-back.onrender.com";
console.log(baseURL);

if (!baseURL) {
  console.error(
    "ERRO: A variável de ambiente VITE_API_BASE_URL não está definida."
  );
}

const api = axios.create({
  baseURL: baseURL,
  withCredentials: true, // garante envio de cookies
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
