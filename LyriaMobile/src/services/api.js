import axios from 'axios';

// NOTE: In a real application, this should be an environment variable.
// For Android emulator, the host machine's localhost is accessible via 10.0.2.2
const baseURL = 'http://10.0.2.2:5001';

const api = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
