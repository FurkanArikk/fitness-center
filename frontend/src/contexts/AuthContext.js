"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { authService } from "@/api";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Define logout as useCallback to avoid dependency issues
  const logout = useCallback(() => {
    authService.logout();
    setIsAuthenticated(false);
    setUsername("");
    router.push("/login");
  }, [router]);

  useEffect(() => {
    // Only initialize once
    if (initialized) return;

    const initAuth = async () => {
      try {
        authService.initializeAuth();
        const authenticated = authService.isAuthenticated();
        const storedUsername = authService.getUsername();

        setIsAuthenticated(authenticated);
        setUsername(storedUsername || "");
        setInitialized(true);
      } catch (error) {
        console.error("Auth initialization error:", error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [initialized, logout]);

  // Handle navigation separately
  useEffect(() => {
    if (!initialized || loading) return;

    if (!isAuthenticated && pathname !== "/login" && pathname !== "/welcome") {
      router.push("/login");
    } else if (isAuthenticated && pathname === "/login") {
      router.push("/dashboard");
    }
  }, [isAuthenticated, pathname, router, initialized, loading]);

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

  const updatePassword = async (currentPassword, newPassword) => {
    try {
      const response = await authService.updatePassword(
        username,
        currentPassword,
        newPassword
      );
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
    updatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
