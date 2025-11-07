import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../services/api'; // Import API function

function RegisterPage() {
  // 'useState' holds the data for our form
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState(null); // To show error messages
  const navigate = useNavigate(); // To redirect the user after success

  // This function runs every time the user types in an input
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // This function runs when the form is submitted
  const handleSubmit = async (e) => {
    e.preventDefault(); // Stop the browser from doing a full-page refresh
    setError(null); // Clear old errors

    try {
      // Call our API function
      await registerUser(formData);

      // If it works, redirect to the login page
      alert('Registration successful! Please log in.');
      navigate('/login');

    } catch (err) {
      // If the backend returns an error
      console.error(err);
      setError('Registration failed. Please try again.');
    }
  };

  return (
    <div>
      <h2>Create an Account</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Username</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        {/* Show an error message if one exists */}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit">Register</button>
      </form>
    </div>
  );
}

export default RegisterPage;