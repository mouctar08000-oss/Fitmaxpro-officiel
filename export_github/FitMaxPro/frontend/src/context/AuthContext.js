import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    // Check for OAuth redirect
    if (window.location.hash?.includes('session_id=')) {
      setLoading(false);
      return;
    }

    // First, try to load cached user from localStorage for instant UI
    const cachedUser = localStorage.getItem('user_data');
    if (cachedUser) {
      try {
        const userData = JSON.parse(cachedUser);
        setUser(userData);
      } catch (e) {
        localStorage.removeItem('user_data');
      }
    }

    try {
      // Try with cookie first, then with localStorage token
      const token = localStorage.getItem('session_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await axios.get(`${API}/auth/me`, {
        withCredentials: true,
        headers
      });
      
      // Update user with fresh data from server
      setUser(response.data);
      // Update cached user data
      localStorage.setItem('user_data', JSON.stringify(response.data));
    } catch (error) {
      // Only clear if we get an auth error, not network error
      if (error.response?.status === 401 || error.response?.status === 403) {
        setUser(null);
        localStorage.removeItem('session_token');
        localStorage.removeItem('user_data');
      }
      // If network error but we have cached user, keep them logged in
      // The cached user data will be used
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const logout = async () => {
    try {
      const token = localStorage.getItem('session_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      await axios.post(`${API}/auth/logout`, {}, { 
        withCredentials: true,
        headers
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local storage on logout
      setUser(null);
      localStorage.removeItem('session_token');
      localStorage.removeItem('user_data');
    }
  };

  // Function to update user and persist
  const updateUser = (userData) => {
    setUser(userData);
    if (userData) {
      localStorage.setItem('user_data', JSON.stringify(userData));
    }
  };

  const value = {
    user,
    setUser: updateUser,
    loading,
    logout,
    checkAuth
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
