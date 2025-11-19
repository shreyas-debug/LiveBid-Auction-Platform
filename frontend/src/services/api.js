import axios from 'axios';

// Use relative path for production (served by same origin)
// or fallback to localhost for local dev if VITE_API_URL is not set
const API_URL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(
  (config) => {
    // Get the token from localStorage
    const token = localStorage.getItem('token');
    if (token) {
      // If the token exists, add it to the Authorization header
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const registerUser = (userData) => {
  return api.post('/api/auth/register', userData);
};

export const loginUser = (loginData) => {
  return api.post('/api/auth/login', loginData);
};


// Function for POST /api/auctions
export const createAuction = (auctionData) => {
  return api.post('/api/auctions', auctionData);
};

// Function for GET /api/auctions
export const getAuctions = () => {
  return api.get('/api/auctions');
};

export const getAuctionById = (id) => {
  return api.get(`/api/auctions/${id}`);
};

// DELETE /api/auctions/{id}
export const deleteAuction = (id) => {
  return api.delete(`/api/auctions/${id}`);
};

export const getMyBids = () => {
  return api.get('/api/bids/my-bids');
};

export const placeBid = (auctionId, amount) => {
  // The backend expects a BidDto object: { "amount": 200 }
  return api.post(`/api/auctions/${auctionId}/bids`, { amount });
};

export default api;