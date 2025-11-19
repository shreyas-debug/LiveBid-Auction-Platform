import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import AuctionDetailPage from './pages/AuctionDetailPage';
import Layout from './components/Layout';
import UserProfilePage from './pages/UserProfilePage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import RequireAdmin from './components/RequireAdmin';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auctions/:id" element={<AuctionDetailPage />} />
        <Route path="/profile" element={<UserProfilePage />} />
        <Route path="/admin" element={<RequireAdmin><AdminDashboardPage /></RequireAdmin>}/>
      </Routes>
    </Layout>
  );
}

export default App;