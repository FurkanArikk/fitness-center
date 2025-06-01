"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authService } from '@/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Initialize auth on app start
    const initAuth = () => {
      try {
        authService.initializeAuth();
        const authenticated = authService.isAuthenticated();
        const storedUsername = authService.getUsername();
        
        setIsAuthenticated(authenticated);
        setUsername(storedUsername || '');

        // Redirect to login if not authenticated and not already on login page
        if (!authenticated && pathname !== '/login' && pathname !== '/welcome') {
          router.push('/login');
        }
        // Redirect to dashboard if authenticated and on login page
        else if (authenticated && pathname === '/login') {
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [pathname, router]);

  const login = async (usernameInput, password) => {
    try {
      const response = await authService.login(usernameInput, password);
      setIsAuthenticated(true);
      setUsername(usernameInput);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setUsername('');
    router.push('/login');
  };

  const updatePassword = async (currentPassword, newPassword) => {
    try {
      const response = await authService.updatePassword(username, currentPassword, newPassword);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const value = {
    isAuthenticated,
    username,
    loading,
    login,
    logout,
    updatePassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
