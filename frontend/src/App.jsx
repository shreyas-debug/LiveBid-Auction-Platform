import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import AuctionDetailPage from './pages/AuctionDetailPage';
import Layout from './components/Layout'; // Import Layout

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auctions/:id" element={<AuctionDetailPage />} />
      </Routes>
    </Layout>
  );
}

export default App;