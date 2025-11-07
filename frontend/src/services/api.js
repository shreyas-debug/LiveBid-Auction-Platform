import axios from 'axios';

// This is backend's URL
const API_URL = 'http://localhost:5134';

const api = axios.create({
  baseURL: API_URL,
});

// This function will handle the POST request to /api/auth/register endpoint
export const registerUser = (userData) => {
  // userData will be an object like { username, email, password }
  return api.post('/api/auth/register', userData);
};

export const loginUser = (loginData) => {
  // loginData will be { username, password }
  // The backend will send back { username, token }
  return api.post('/api/auth/login', loginData);
};

export default api;