import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Helper to parse JWT
  const parseJwt = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  };

  // Helper to find the role claim, no matter the key name
  const getRoleFromDecodedToken = (decoded) => {
    if (!decoded) return null;
    
    // Check standard claim names
    if (decoded.role) return decoded.role;
    if (decoded.Role) return decoded.Role;
    
    // Check the long ASP.NET Identity claim name
    // This is the most likely one
    const identityRole = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
    if (identityRole) return identityRole;

    return null;
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    
    if (token && username) {
      const decoded = parseJwt(token);
      const role = getRoleFromDecodedToken(decoded);
      
      console.log("Auth Init - Decoded Token:", decoded); // DEBUG LOG
      console.log("Auth Init - Extracted Role:", role);   // DEBUG LOG
      
      setUser({ token, username, role });
    }
  }, []);

  const login = (userData) => {
    localStorage.setItem('token', userData.token);
    localStorage.setItem('username', userData.username);
    
    const decoded = parseJwt(userData.token);
    const role = getRoleFromDecodedToken(decoded);

    console.log("Login - Decoded Token:", decoded); // DEBUG LOG
    console.log("Login - Extracted Role:", role);   // DEBUG LOG

    setUser({ ...userData, role });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);