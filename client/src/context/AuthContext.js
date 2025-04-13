import React, { createContext, useState, useEffect, useRef } from 'react';
import axios from 'axios';

const AuthContext = createContext();

// Set auth token in global headers
const setAuthToken = token => {
  if (token) {
    axios.defaults.headers.common['x-auth-token'] = token;
  } else {
    delete axios.defaults.headers.common['x-auth-token'];
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const initialLoadDone = useRef(false);

  // Load user from token on initial render
  useEffect(() => {
    // Only run this effect once on mount
    if (initialLoadDone.current) return;
    initialLoadDone.current = true;
    
    let timeoutId = null;

    const loadUserOnStartup = async () => {
      // Start a timeout to make sure loading state resets even if request hangs
      timeoutId = setTimeout(() => {
        setLoading(false);
      }, 5000);

      try {
        if (localStorage.token) {
          setAuthToken(localStorage.token);
          try {
            const res = await axios.get('/api/auth/user');
            setUser(res.data);
            setIsAuthenticated(true);
          } catch (err) {
            localStorage.removeItem('token');
            setAuthToken(null);
            setUser(null);
            setIsAuthenticated(false);
          }
        }
      } finally {
        // Always set loading to false when done
        setLoading(false);
        if (timeoutId) clearTimeout(timeoutId);
      }
    };

    loadUserOnStartup();

    // Cleanup on unmount
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  // Load user data
  const loadUser = async () => {
    if (localStorage.token) {
      setAuthToken(localStorage.token);
    }

    try {
      const res = await axios.get('/api/auth/user');
      setUser(res.data);
      setIsAuthenticated(true);
      setLoading(false);
      return true;
    } catch (err) {
      localStorage.removeItem('token');
      setAuthToken(null);
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
      return false;
    }
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  // Register user
  const register = async (formData) => {
    try {
      setLoading(true);
      const res = await axios.post('/api/auth/register', formData);
      localStorage.setItem('token', res.data.token);
      await loadUser();
      return true;
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.msg || 'Registration failed. Please try again.');
      setTimeout(() => setError(null), 5000);
      return false;
    }
  };

  // Login user
  const login = async (formData) => {
    try {
      setLoading(true);
      const res = await axios.post('/api/auth/login', formData);
      localStorage.setItem('token', res.data.token);
      await loadUser();
      return true;
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.msg || 'Invalid credentials. Please try again.');
      setTimeout(() => setError(null), 5000);
      return false;
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    setAuthToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setLoading(false);
  };

  // Update user
  const updateUser = async (userData) => {
    try {
      const res = await axios.put('/api/auth/update', userData);
      setUser(res.data);
      return true;
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to update user. Please try again.');
      setTimeout(() => setError(null), 5000);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        error,
        register,
        login,
        logout,
        loadUser,
        updateUser,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 