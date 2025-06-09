import apiClient from './apiClient';
import { ENDPOINTS } from './endpoints';

// Auth service for managing authentication
class AuthService {
  // Login user
  async login(username, password) {
    try {
      const response = await apiClient.post(ENDPOINTS.auth.login, {
        username,
        password
      });
      
      if (response.data.token) {
        // Store token in localStorage
        localStorage.setItem('auth_token', response.data.token);
        localStorage.setItem('username', username);
        
        // Set default authorization header for future requests
        this.setAuthHeader(response.data.token);
      }
      
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Logout user
  logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('username');
    delete apiClient.defaults.headers.common['Authorization'];
  }

  // Get stored token
  getToken() {
    return localStorage.getItem('auth_token');
  }

  // Get stored username
  getUsername() {
    return localStorage.getItem('username');
  }

  // Check if user is authenticated
  isAuthenticated() {
    const token = this.getToken();
    return !!token;
  }

  // Set authorization header
  setAuthHeader(token) {
    if (token) {
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete apiClient.defaults.headers.common['Authorization'];
    }
  }

  // Initialize auth on app start
  initializeAuth() {
    const token = this.getToken();
    if (token) {
      this.setAuthHeader(token);
    }
  }

  // Update admin password
  async updatePassword(username, currentPassword, newPassword) {
    try {
      const response = await apiClient.put(ENDPOINTS.auth.updatePassword, {
        username,
        current_password: currentPassword,
        new_password: newPassword
      });
      return response.data;
    } catch (error) {
      console.error('Update password error:', error);
      throw error;
    }
  }

  // List all admins
  async listAdmins() {
    try {
      const response = await apiClient.get(ENDPOINTS.auth.listAdmins);
      return response.data;
    } catch (error) {
      console.error('List admins error:', error);
      throw error;
    }
  }

  // Create new admin
  async createAdmin(username, password, email) {
    try {
      const response = await apiClient.post(ENDPOINTS.auth.createAdmin, {
        username,
        password,
        email
      });
      return response.data;
    } catch (error) {
      console.error('Create admin error:', error);
      throw error;
    }
  }

  // Delete admin
  async deleteAdmin(username) {
    try {
      const response = await apiClient.delete(`${ENDPOINTS.auth.deleteAdmin}/${username}`);
      return response.data;
    } catch (error) {
      console.error('Delete admin error:', error);
      throw error;
    }
  }

  // Health check
  async healthCheck() {
    try {
      const response = await apiClient.get(ENDPOINTS.auth.health);
      return response.data;
    } catch (error) {
      console.error('Auth health check error:', error);
      throw error;
    }
  }
}

export default new AuthService();
