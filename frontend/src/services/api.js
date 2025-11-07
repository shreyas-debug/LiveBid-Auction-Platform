import axios from 'axios';

// This is backend's URL
const API_URL = 'http://localhost:5134';

const api = axios.create({
  baseURL: API_URL,
});

// --- Auth Service ---
// This function will handle the POST request to /api/auth/register endpoint
export const registerUser = (userData) => {
  // userData will be an object like { username, email, password }
  return api.post('/api/auth/register', userData);
};


export default api;