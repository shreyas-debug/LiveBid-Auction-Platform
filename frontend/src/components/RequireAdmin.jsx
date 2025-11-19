import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function RequireAdmin({ children }) {
  const { user } = useAuth();

  // If not logged in, go to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If logged in but NOT an admin, go home
  // Note: 'role' might be an array if the user has multiple roles, or a string if just one.
  // We handle both cases.
  const isAdmin = Array.isArray(user.role) 
    ? user.role.includes("Admin") 
    : user.role === "Admin";

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  // If admin, render the page
  return children;
}

export default RequireAdmin;