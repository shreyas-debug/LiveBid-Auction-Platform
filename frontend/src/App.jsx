import React from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom'; //Import useNavigate
import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import { useAuth } from './context/AuthContext'; //Import useAuth

function App() {
  const { user, logout } = useAuth(); //Get user and logout from context
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login'); // Redirect to login after logout
  };

  return (
    <div className="app">
      <header>
        <h1>LiveBid</h1>
        <nav>
          <Link to="/">Home</Link>
          {user ? (
            // If user IS logged in
            <>
              <span>Welcome, {user.username}!</span>
              <button onClick={handleLogout}>Logout</button>
            </>
          ) : (
            // If user IS NOT logged in
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </nav>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;