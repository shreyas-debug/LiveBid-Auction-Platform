import axios from 'axios';

const API_URL = 'http://localhost:5134'; 

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

export const placeBid = (auctionId, amount) => {
  // The backend expects a BidDto object: { "amount": 200 }
  return api.post(`/api/auctions/${auctionId}/bids`, { amount });
};

export default api;