import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../services/api.service';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = () => {
      try {
        const storedToken = localStorage.getItem('admin_token');
        const storedUser = localStorage.getItem('admin_user');

        if (storedToken && storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setToken(storedToken);
          setUser(parsedUser);
          setIsAuthenticated(true);
          
          // Set token in API service
          apiService.setAuthToken(storedToken);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        // Clear corrupted data
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Login function
  const login = async (phone_number, password) => {
    try {
      const response = await apiService.post('/auth/login', {
        phone_number,
        password,
      });

      console.log('Login response:', response);

      if (response.success) {
        // FIXED: Handle the actual API response structure
        // API returns: { success, message, data: { user_id, user_type, profile, token } }
        const { user_id, user_type, profile, token: authToken } = response.data;
        
        // Create user object
        const userData = {
          user_id,
          user_type,
          ...profile
        };
        
        // Store in state
        setUser(userData);
        setToken(authToken);
        setIsAuthenticated(true);

        // Store in localStorage
        localStorage.setItem('admin_token', authToken);
        localStorage.setItem('admin_user', JSON.stringify(userData));

        // Set token in API service
        apiService.setAuthToken(authToken);

        return response;
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    // Clear state
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);

    // Clear localStorage
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');

    // Clear token from API service
    apiService.removeAuthToken();
  };

  // Check if token is expired
  const isTokenExpired = () => {
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp * 1000; // Convert to milliseconds
      return Date.now() >= expiry;
    } catch (error) {
      return true;
    }
  };

  // Refresh session
  const refreshSession = async () => {
    if (isTokenExpired()) {
      logout();
      return false;
    }
    return true;
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    login,
    logout,
    refreshSession,
    isTokenExpired
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;