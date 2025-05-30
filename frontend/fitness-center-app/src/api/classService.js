import apiClient from './apiClient';
import { ENDPOINTS } from './endpoints';

const classService = {
  // Class methods
  getClasses: async (active = true, page = 1, pageSize = 10) => {
    try {
      const params = new URLSearchParams();
      if (active !== undefined) params.append('active', active);
      params.append('page', page);
      params.append('pageSize', pageSize);
      
      const response = await apiClient.get(`${ENDPOINTS.classes}?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch classes:", error);
      return { data: [], page: 1, pageSize: 10, totalItems: 0, totalPages: 0 };
    }
  },
  
  getClass: async (id) => {
    try {
      const response = await apiClient.get(`${ENDPOINTS.classes}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch class ${id}:`, error);
      return null;
    }
  },

  createClass: async (classData) => {
    try {
      const response = await apiClient.post(ENDPOINTS.classes, classData);
      return response.data;
    } catch (error) {
      console.error("Failed to create class:", error);
      throw error;
    }
  },
  
  updateClass: async (id, classData) => {
    try {
      const response = await apiClient.put(`${ENDPOINTS.classes}/${id}`, classData);
      return response.data;
    } catch (error) {
      console.error(`Failed to update class ${id}:`, error);
      throw error;
    }
  },
  
  deleteClass: async (id) => {
    try {
      const response = await apiClient.delete(`${ENDPOINTS.classes}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to delete class ${id}:`, error);
      throw error;
    }
  },

  // Schedule methods
  getSchedules: async (status = 'active', page = 1, pageSize = 10) => {
    try {
      const params = new URLSearchParams();
      if (status !== undefined) params.append('status', status);
      params.append('page', page);
      params.append('pageSize', pageSize);
      
      const response = await apiClient.get(`${ENDPOINTS.schedules}?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch schedules:", error);
      return { data: [], page: 1, pageSize: 10, totalItems: 0, totalPages: 0 };
    }
  },
  
  getSchedule: async (id) => {
    try {
      const response = await apiClient.get(`${ENDPOINTS.schedules}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch schedule ${id}:`, error);
      return null;
    }
  },
  
  getSchedulesForClass: async (classId) => {
    try {
      const response = await apiClient.get(`${ENDPOINTS.schedules}/class/${classId}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch schedules for class ${classId}:`, error);
      return [];
    }
  },
  
  createSchedule: async (scheduleData) => {
    try {
      const response = await apiClient.post(ENDPOINTS.schedules, scheduleData);
      return response.data;
    } catch (error) {
      console.error("Failed to create schedule:", error);
      throw error;
    }
  },
  
  updateSchedule: async (id, scheduleData) => {
    try {
      const response = await apiClient.put(`${ENDPOINTS.schedules}/${id}`, scheduleData);
      return response.data;
    } catch (error) {
      console.error(`Failed to update schedule ${id}:`, error);
      throw error;
    }
  },
  
  deleteSchedule: async (id) => {
    try {
      const response = await apiClient.delete(`${ENDPOINTS.schedules}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to delete schedule ${id}:`, error);
      throw error;
    }
  },
  
  // Booking methods
  getBookings: async (status = null, date = null, page = 1, pageSize = 10) => {
    try {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (date) params.append('date', date);
      params.append('page', page);
      params.append('pageSize', pageSize);
      
      const response = await apiClient.get(`${ENDPOINTS.bookings}?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
      return { data: [], page: 1, pageSize: 10, totalItems: 0, totalPages: 0 };
    }
  },
  
  getBooking: async (id) => {
    try {
      const response = await apiClient.get(`${ENDPOINTS.bookings}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch booking ${id}:`, error);
      return null;
    }
  },
  
  getMemberBookings: async (memberId) => {
    try {
      const response = await apiClient.get(`${ENDPOINTS.bookings}/member/${memberId}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch bookings for member ${memberId}:`, error);
      return [];
    }
  },
  
  createBooking: async (bookingData) => {
    try {
      const response = await apiClient.post(ENDPOINTS.bookings, bookingData);
      return response.data;
    } catch (error) {
      console.error("Failed to create booking:", error);
      throw error;
    }
  },

  updateBookingStatus: async (id, status) => {
    try {
      const response = await apiClient.put(`${ENDPOINTS.bookings}/${id}/status`, {
        attendance_status: status
      });
      return response.data;
    } catch (error) {
      console.error(`Failed to update booking ${id} status:`, error);
      throw error;
    }
  },

  addBookingFeedback: async (id, rating, comment) => {
    try {
      const response = await apiClient.post(`${ENDPOINTS.bookings}/${id}/feedback`, {
        rating,
        comment
      });
      return response.data;
    } catch (error) {
      console.error(`Failed to add feedback to booking ${id}:`, error);
      throw error;
    }
  },

  cancelBooking: async (id) => {
    try {
      const response = await apiClient.delete(`${ENDPOINTS.bookings}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to cancel booking ${id}:`, error);
      throw error;
    }
  }
};

export default classService;
