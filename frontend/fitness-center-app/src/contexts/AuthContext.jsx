"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
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
  const [initialized, setInitialized] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Initialize auth only once
  useEffect(() => {
    if (initialized) return;
    
    const initAuth = () => {
      try {
        authService.initializeAuth();
        const authenticated = authService.isAuthenticated();
        const storedUsername = authService.getUsername();
        
        setIsAuthenticated(authenticated);
        setUsername(storedUsername || '');
      } catch (error) {
        console.error('Auth initialization error:', error);
        setIsAuthenticated(false);
        setUsername('');
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    };

    initAuth();
  }, [initialized]);

  // Handle routing based on auth state
  useEffect(() => {
    if (loading || !initialized) return;

    const publicPaths = ['/login', '/welcome'];
    const isPublicPath = publicPaths.includes(pathname);

    // Avoid routing loops by checking current state
    if (!isAuthenticated && !isPublicPath && pathname !== '/login') {
      router.replace('/login');
    } else if (isAuthenticated && pathname === '/login') {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, loading, initialized, pathname, router]);

  const login = useCallback(async (usernameInput, password) => {
    try {
      const response = await authService.login(usernameInput, password);
      setIsAuthenticated(true);
      setUsername(usernameInput);
      // Routing will be handled by the useEffect above
      return response;
    } catch (error) {
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setIsAuthenticated(false);
    setUsername('');
    router.replace('/login');
  }, [router]);

  const updatePassword = useCallback(async (currentPassword, newPassword) => {
    try {
      const response = await authService.updatePassword(username, currentPassword, newPassword);
      return response;
    } catch (error) {
      throw error;
    }
  }, [username]);

  const value = useMemo(() => ({
    isAuthenticated,
    username,
    loading,
    login,
    logout,
    updatePassword
  }), [isAuthenticated, username, loading, login, logout, updatePassword]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
