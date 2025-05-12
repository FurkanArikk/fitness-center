import axios from 'axios';
import { ENDPOINTS, SERVICE_PORTS } from './endpoints';

// Create axios instance
const api = axios.create({
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add response interceptor for error handling
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

const apiService = {
  // Health check methods for each service
  checkServiceHealth: async (service) => {
    try {
      const response = await fetch(`http://localhost:${SERVICE_PORTS[service]}/health`);
      return response.ok;
    } catch (error) {
      console.error(`Health check failed for ${service}:`, error);
      return false;
    }
  },

  // Member service methods
  getMembers: async (page = 1, size = 10) => {
    try {
      const response = await api.get(`${ENDPOINTS.members}?page=${page}&size=${size}`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch members:", error);
      return [];
    }
  },
  
  getMember: async (id) => {
    try {
      const response = await api.get(`${ENDPOINTS.members}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch member ${id}:`, error);
      return null;
    }
  },

  createMember: async (memberData) => {
    try {
      const response = await api.post(ENDPOINTS.members, memberData);
      return response.data;
    } catch (error) {
      console.error("Failed to create member:", error);
      throw error;
    }
  },

  updateMember: async (id, memberData) => {
    try {
      const response = await api.put(`${ENDPOINTS.members}/${id}`, memberData);
      return response.data;
    } catch (error) {
      console.error(`Failed to update member ${id}:`, error);
      throw error;
    }
  },

  deleteMember: async (id) => {
    try {
      await api.delete(`${ENDPOINTS.members}/${id}`);
      return true;
    } catch (error) {
      console.error(`Failed to delete member ${id}:`, error);
      return false;
    }
  },

  // Class service methods
  getClasses: async (active = true) => {
    try {
      const response = await api.get(`${ENDPOINTS.classes}?active=${active}`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch classes:", error);
      return [];
    }
  },
  
  getClass: async (id) => {
    try {
      const response = await api.get(`${ENDPOINTS.classes}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch class ${id}:`, error);
      return null;
    }
  },

  createClass: async (classData) => {
    try {
      const response = await api.post(ENDPOINTS.classes, classData);
      return response.data;
    } catch (error) {
      console.error("Failed to create class:", error);
      throw error;
    }
  },

  // Schedule methods
  getSchedules: async (status = 'active') => {
    try {
      const response = await api.get(`${ENDPOINTS.schedules}?status=${status}`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch schedules:", error);
      return [];
    }
  },
  
  // Staff and trainer methods
  getStaff: async () => {
    try {
      const response = await api.get(ENDPOINTS.staff);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch staff:", error);
      return [];
    }
  },
  
  getTrainers: async () => {
    try {
      const response = await api.get(ENDPOINTS.trainers);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch trainers:", error);
      return [];
    }
  },
  
  // Facility methods
  getFacilities: async (page = 1, size = 10) => {
    try {
      const response = await api.get(`${ENDPOINTS.facilities}?page=${page}&pageSize=${size}`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch facilities:", error);
      return { data: [] };
    }
  },
  
  getEquipment: async (page = 1, size = 10) => {
    try {
      const response = await api.get(`${ENDPOINTS.equipment}?page=${page}&pageSize=${size}`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch equipment:", error);
      return { data: [] };
    }
  },
  
  // Payment methods
  getPayments: async (page = 1, size = 10) => {
    try {
      const response = await api.get(`${ENDPOINTS.payments}?page=${page}&pageSize=${size}`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch payments:", error);
      return { data: [] };
    }
  },
  
  getPaymentStatistics: async () => {
    try {
      const response = await api.get(ENDPOINTS.paymentStats);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch payment statistics:", error);
      return null;
    }
  },
};

export default apiService;