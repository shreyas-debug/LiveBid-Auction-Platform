import React, { createContext, useState, useContext } from 'react';

//Create the context
const AuthContext = createContext(null);

// Create the "Provider" component
// This component will wrap our entire app and "provide" auth data
export const AuthProvider = ({ children }) => {
  //Use 'useState' to store the user's data
  // We check localStorage to see if the user is already logged in
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    return token && username ? { token, username } : null;
  });

  //Create a 'login' function
  const login = (userData) => {
    // userData will be { token, username }
    localStorage.setItem('token', userData.token);
    localStorage.setItem('username', userData.username);
    setUser(userData);
  };

  //Create a 'logout' function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setUser(null);
  };

  //Pass the user data and functions to the app
  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

//Create a custom "hook" to easily access the context
export const useAuth = () => {
  return useContext(AuthContext);
};