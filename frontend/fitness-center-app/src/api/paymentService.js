import apiClient from './apiClient';
import { ENDPOINTS } from './endpoints';

const paymentService = {
  // Payment methods
  getPayment: async (id) => {
    try {
      const response = await apiClient.get(`${ENDPOINTS.payments}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch payment ${id}:`, error);
      return null;
    }
  },
  
  createPayment: async (paymentData) => {
    try {
      const response = await apiClient.post(ENDPOINTS.payments, paymentData);
      return response.data;
    } catch (error) {
      console.error("Failed to create payment:", error);
      throw error;
    }
  },
  
  updatePayment: async (id, paymentData) => {
    try {
      console.log(`Updating payment ${id} with data:`, paymentData); // Debug log
      const response = await apiClient.put(`${ENDPOINTS.payments}/${id}`, paymentData);
      console.log('Update payment response:', response.data); // Debug log
      return response.data;
    } catch (error) {
      console.error(`Failed to update payment ${id}:`, error);
      console.error('Error response:', error.response?.data); // Debug log
      throw error;
    }
  },
  
  deletePayment: async (id) => {
    try {
      const response = await apiClient.delete(`${ENDPOINTS.payments}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to delete payment ${id}:`, error);
      throw error;
    }
  },
  
  getPayments: async (params = {}, pageSize = 10) => {
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
      const url = queryString ? `${ENDPOINTS.payments}?${queryString}` : ENDPOINTS.payments;
      
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch payments:", error);
      return { data: [] };
    }
  },
  
  getPaymentsByMember: async (memberId, page = 1, pageSize = 10) => {
    try {
      const response = await apiClient.get(`${ENDPOINTS.payments}/member/${memberId}?page=${page}&pageSize=${pageSize}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch payments for member ${memberId}:`, error);
      return { data: [] };
    }
  },
  
  getPaymentsByStatus: async (status, page = 1, pageSize = 10) => {
    try {
      const response = await apiClient.get(`${ENDPOINTS.payments}/status/${status}?page=${page}&pageSize=${pageSize}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch payments with status ${status}:`, error);
      return { data: [] };
    }
  },
  
  getPaymentsByMethod: async (method, page = 1, pageSize = 10) => {
    try {
      const response = await apiClient.get(`${ENDPOINTS.payments}/method/${method}?page=${page}&pageSize=${pageSize}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch payments with method ${method}:`, error);
      return { data: [] };
    }
  },
  
  getPaymentsByType: async (typeId, page = 1, pageSize = 10) => {
    try {
      const response = await apiClient.get(`${ENDPOINTS.payments}/type/${typeId}?page=${page}&pageSize=${pageSize}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch payments with type ${typeId}:`, error);
      return { data: [] };
    }
  },
  
  getPaymentStatistics: async (filters = {}) => {
    try {
      const { memberId, typeId, startDate, endDate } = filters;
      let url = ENDPOINTS.paymentStats;
      const params = [];
      
      if (memberId) params.push(`memberId=${memberId}`);
      if (typeId) params.push(`typeId=${typeId}`);
      if (startDate) params.push(`startDate=${startDate}`);
      if (endDate) params.push(`endDate=${endDate}`);
      
      if (params.length > 0) {
        url += `?${params.join('&')}`;
      }
      
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch payment statistics:", error);
      return null;
    }
  },
  
  // Payment Type methods
  getAllPaymentTypes: async () => {
    try {
      const response = await apiClient.get(ENDPOINTS.paymentTypes);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch all payment types:", error);
      return { data: [] };
    }
  },

  getPaymentType: async (id) => {
    try {
      const response = await apiClient.get(`${ENDPOINTS.paymentTypes}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch payment type ${id}:`, error);
      return null;
    }
  },
  
  createPaymentType: async (paymentTypeData) => {
    try {
      const response = await apiClient.post(ENDPOINTS.paymentTypes, paymentTypeData);
      return response.data;
    } catch (error) {
      console.error("Failed to create payment type:", error);
      throw error;
    }
  },
  
  updatePaymentType: async (id, paymentTypeData) => {
    try {
      const response = await apiClient.put(`${ENDPOINTS.paymentTypes}/${id}`, paymentTypeData);
      return response.data;
    } catch (error) {
      console.error(`Failed to update payment type ${id}:`, error);
      throw error;
    }
  },
  
  deletePaymentType: async (id) => {
    try {
      const response = await apiClient.delete(`${ENDPOINTS.paymentTypes}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to delete payment type ${id}:`, error);
      throw error;
    }
  },

  // Export methods
  exportPayments: async (exportSettings) => {
    try {
      const params = new URLSearchParams();
      
      // Add format
      params.append('format', exportSettings.format);
      
      // Add date range
      if (exportSettings.dateRange !== 'custom') {
        params.append('dateRange', exportSettings.dateRange);
      } else {
        if (exportSettings.startDate) params.append('startDate', exportSettings.startDate);
        if (exportSettings.endDate) params.append('endDate', exportSettings.endDate);
      }
      
      // Add status filter
      if (exportSettings.filterByStatus !== 'all') {
        params.append('status', exportSettings.filterByStatus);
      }
      
      // Add included fields
      const includeFields = Object.keys(exportSettings.includeFields).filter(
        key => exportSettings.includeFields[key]
      );
      if (includeFields.length > 0) {
        params.append('fields', includeFields.join(','));
      }
      
      const response = await apiClient.get(`${ENDPOINTS.payments}/export?${params.toString()}`, {
        responseType: 'blob'
      });
      
      // Create download link
      const blob = new Blob([response.data], { 
        type: exportSettings.format === 'excel' 
          ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          : 'text/csv'
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const now = new Date();
      const timestamp = now.toISOString().split('T')[0];
      const extension = exportSettings.format === 'excel' ? 'xlsx' : 'csv';
      link.download = `odemeler_${timestamp}.${extension}`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (error) {
      console.error("Failed to export payments:", error);
      throw error;
    }
  }
};

export default paymentService;
