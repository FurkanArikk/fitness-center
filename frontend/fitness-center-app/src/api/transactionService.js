import apiClient from './apiClient';
import { ENDPOINTS } from './endpoints';

const transactionService = {
  // Transaction methods
  getTransaction: async (id) => {
    try {
      const response = await apiClient.get(`${ENDPOINTS.transactions}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch transaction ${id}:`, error);
      return null;
    }
  },
  
  createTransaction: async (transactionData) => {
    try {
      const response = await apiClient.post(ENDPOINTS.transactions, transactionData);
      return response.data;
    } catch (error) {
      console.error("Failed to create transaction:", error);
      throw error;
    }
  },
  
  updateTransaction: async (id, transactionData) => {
    try {
      console.log(`Updating transaction ${id} with data:`, transactionData); // Debug log
      const response = await apiClient.put(`${ENDPOINTS.transactions}/${id}`, transactionData);
      console.log('Update transaction response:', response.data); // Debug log
      return response.data;
    } catch (error) {
      console.error(`Failed to update transaction ${id}:`, error);
      console.error('Error response:', error.response?.data); // Debug log
      throw error;
    }
  },
  
  deleteTransaction: async (id) => {
    try {
      const response = await apiClient.delete(`${ENDPOINTS.transactions}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to delete transaction ${id}:`, error);
      throw error;
    }
  },
  
  getTransactions: async (params = {}, pageSize = 10) => {
    try {
      // If params is a number (old API call), convert to object format
      if (typeof params === 'number') {
        const page = params;
        params = { page, pageSize };
      }
      
      // Build query string from params object
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value);
        }
      });
      
      const queryString = queryParams.toString();
      const url = queryString ? `${ENDPOINTS.transactions}?${queryString}` : ENDPOINTS.transactions;
      
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
      return { data: [] };
    }
  },
  
  getTransactionsByPayment: async (paymentId, page = 1, pageSize = 10) => {
    try {
      const response = await apiClient.get(`${ENDPOINTS.transactions}/payment/${paymentId}?page=${page}&pageSize=${pageSize}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch transactions for payment ${paymentId}:`, error);
      return { data: [] };
    }
  },
  
  getTransactionsByStatus: async (status, page = 1, pageSize = 10) => {
    try {
      const response = await apiClient.get(`${ENDPOINTS.transactions}/status/${status}?page=${page}&pageSize=${pageSize}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch transactions with status ${status}:`, error);
      return { data: [] };
    }
  },
  
  processPayment: async (processData) => {
    try {
      const response = await apiClient.post(`${ENDPOINTS.transactions}/process`, processData);
      return response.data;
    } catch (error) {
      console.error("Failed to process payment:", error);
      throw error;
    }
  }
};

export default transactionService;
