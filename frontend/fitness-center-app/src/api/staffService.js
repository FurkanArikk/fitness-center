import apiClient from './apiClient';
import { ENDPOINTS } from './endpoints';

const staffService = {
  // Staff methods
  getStaff: async () => {
    try {
      const response = await apiClient.get(ENDPOINTS.staff);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch staff:", error);
      return [];
    }
  },
  
  getStaffMember: async (id) => {
    try {
      const response = await apiClient.get(`${ENDPOINTS.staff}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch staff member ${id}:`, error);
      return null;
    }
  },
  
  createStaffMember: async (staffData) => {
    try {
      const response = await apiClient.post(ENDPOINTS.staff, staffData);
      return response.data;
    } catch (error) {
      console.error("Failed to create staff member:", error);
      throw error;
    }
  },
  
  updateStaffMember: async (id, staffData) => {
    try {
      const response = await apiClient.put(`${ENDPOINTS.staff}/${id}`, staffData);
      return response.data;
    } catch (error) {
      console.error(`Failed to update staff member ${id}:`, error);
      throw error;
    }
  },
  
  deleteStaffMember: async (id) => {
    try {
      await apiClient.delete(`${ENDPOINTS.staff}/${id}`);
      return true;
    } catch (error) {
      console.error(`Failed to delete staff member ${id}:`, error);
      return false;
    }
  },
  
  // Qualification methods
  getQualifications: async () => {
    try {
      const response = await apiClient.get(`${ENDPOINTS.qualifications}`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch qualifications:", error);
      return [];
    }
  },
  
  getQualification: async (id) => {
    try {
      const response = await apiClient.get(`${ENDPOINTS.qualifications}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch qualification ${id}:`, error);
      return null;
    }
  },
  
  getStaffQualifications: async (staffId) => {
    try {
      const response = await apiClient.get(`${ENDPOINTS.staff}/${staffId}/qualifications`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch qualifications for staff ${staffId}:`, error);
      return [];
    }
  },
  
  createQualification: async (qualificationData) => {
    try {
      const response = await apiClient.post(ENDPOINTS.qualifications, qualificationData);
      return response.data;
    } catch (error) {
      console.error("Failed to create qualification:", error);
      throw error;
    }
  },
  
  updateQualification: async (id, qualificationData) => {
    try {
      const response = await apiClient.put(`${ENDPOINTS.qualifications}/${id}`, qualificationData);
      return response.data;
    } catch (error) {
      console.error(`Failed to update qualification ${id}:`, error);
      throw error;
    }
  },
  
  deleteQualification: async (id) => {
    try {
      await apiClient.delete(`${ENDPOINTS.qualifications}/${id}`);
      return true;
    } catch (error) {
      console.error(`Failed to delete qualification ${id}:`, error);
      return false;
    }
  },
  
  // Trainer methods
  getTrainers: async () => {
    try {
      const response = await apiClient.get(ENDPOINTS.trainers);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch trainers:", error);
      return [];
    }
  },
  
  getTrainer: async (id) => {
    try {
      const response = await apiClient.get(`${ENDPOINTS.trainers}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch trainer ${id}:`, error);
      return null;
    }
  },
  
  getStaffTrainerProfile: async (staffId) => {
    try {
      const response = await apiClient.get(`${ENDPOINTS.staff}/${staffId}/trainer`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch trainer profile for staff ${staffId}:`, error);
      return null;
    }
  },
  
  getTrainersBySpecialization: async (specialization) => {
    try {
      const response = await apiClient.get(`${ENDPOINTS.trainers}/specialization/${specialization}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch trainers with specialization ${specialization}:`, error);
      return [];
    }
  },
  
  getTopRatedTrainers: async (limit = 5) => {
    try {
      const response = await apiClient.get(`${ENDPOINTS.trainers}/top/${limit}`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch top rated trainers:", error);
      return [];
    }
  },
  
  createTrainer: async (trainerData) => {
    try {
      const response = await apiClient.post(ENDPOINTS.trainers, trainerData);
      return response.data;
    } catch (error) {
      console.error("Failed to create trainer:", error);
      throw error;
    }
  }
};

export default staffService;
