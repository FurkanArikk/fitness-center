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
  
  // Get staff with pagination
  getStaffPaginated: async (page = 1, pageSize = 10) => {
    try {
      const response = await apiClient.get(`${ENDPOINTS.staff}?page=${page}&pageSize=${pageSize}`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch paginated staff:", error);
      return { data: [], page: 1, pageSize: 10, totalItems: 0, totalPages: 0 };
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
  
  // Get qualifications with pagination
  getQualificationsPaginated: async (page = 1, pageSize = 10) => {
    try {
      const response = await apiClient.get(`${ENDPOINTS.qualifications}?page=${page}&pageSize=${pageSize}`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch paginated qualifications:", error);
      return { data: [], page: 1, pageSize: 10, totalItems: 0, totalPages: 0 };
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
  
  // Get staff qualifications with pagination
  getStaffQualificationsPaginated: async (staffId, page = 1, pageSize = 10) => {
    try {
      const response = await apiClient.get(`${ENDPOINTS.staff}/${staffId}/qualifications?page=${page}&pageSize=${pageSize}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch paginated qualifications for staff ${staffId}:`, error);
      return { data: [], page: 1, pageSize: 10, totalItems: 0, totalPages: 0 };
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
  
  // Get trainers with pagination
  getTrainersPaginated: async (page = 1, pageSize = 10) => {
    try {
      const response = await apiClient.get(`${ENDPOINTS.trainers}?page=${page}&pageSize=${pageSize}`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch paginated trainers:", error);
      return { data: [], page: 1, pageSize: 10, totalItems: 0, totalPages: 0 };
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
  
  // Get trainers by specialization with pagination
  getTrainersBySpecializationPaginated: async (specialization, page = 1, pageSize = 10) => {
    try {
      const response = await apiClient.get(`${ENDPOINTS.trainers}?specialization=${specialization}&page=${page}&pageSize=${pageSize}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch paginated trainers with specialization ${specialization}:`, error);
      return { data: [], page: 1, pageSize: 10, totalItems: 0, totalPages: 0 };
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
  },
  
  // Training sessions methods
  getTrainingSessions: async () => {
    try {
      const response = await apiClient.get(ENDPOINTS.trainingSessions);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch training sessions:", error);
      return [];
    }
  },
  
  // Get training sessions with pagination
  getTrainingSessionsPaginated: async (page = 1, pageSize = 10, filters = {}) => {
    try {
      // Build query string with filters
      let queryParams = `page=${page}&pageSize=${pageSize}`;
      
      // Add optional filters (status, date, trainer_id, member_id)
      if (filters.status) queryParams += `&status=${filters.status}`;
      if (filters.date) queryParams += `&date=${filters.date}`;
      if (filters.trainerId) queryParams += `&trainer_id=${filters.trainerId}`;
      if (filters.memberId) queryParams += `&member_id=${filters.memberId}`;
      
      const response = await apiClient.get(`${ENDPOINTS.trainingSessions}?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch paginated training sessions:", error);
      return { data: [], page: 1, pageSize: 10, totalItems: 0, totalPages: 0 };
    }
  },
  
  getTrainingSession: async (id) => {
    try {
      const response = await apiClient.get(`${ENDPOINTS.trainingSessions}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch training session ${id}:`, error);
      return null;
    }
  },
  
  createTrainingSession: async (sessionData) => {
    try {
      const response = await apiClient.post(ENDPOINTS.trainingSessions, sessionData);
      return response.data;
    } catch (error) {
      console.error("Failed to create training session:", error);
      throw error;
    }
  },
  
  updateTrainingSession: async (id, sessionData) => {
    try {
      const response = await apiClient.put(`${ENDPOINTS.trainingSessions}/${id}`, sessionData);
      return response.data;
    } catch (error) {
      console.error(`Failed to update training session ${id}:`, error);
      throw error;
    }
  },
  
  cancelTrainingSession: async (id) => {
    try {
      const response = await apiClient.put(`${ENDPOINTS.trainingSessions}/${id}/cancel`);
      return response.data;
    } catch (error) {
      console.error(`Failed to cancel training session ${id}:`, error);
      throw error;
    }
  },
  
  // Get training sessions for a specific trainer with pagination
  getTrainerSessionsPaginated: async (trainerId, page = 1, pageSize = 10, filters = {}) => {
    try {
      let queryParams = `trainer_id=${trainerId}&page=${page}&pageSize=${pageSize}`;
      
      // Add optional filters
      if (filters.status) queryParams += `&status=${filters.status}`;
      if (filters.date) queryParams += `&date=${filters.date}`;
      if (filters.dateFrom) queryParams += `&date_from=${filters.dateFrom}`;
      if (filters.dateTo) queryParams += `&date_to=${filters.dateTo}`;
      
      const response = await apiClient.get(`${ENDPOINTS.trainingSessions}?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch paginated training sessions for trainer ${trainerId}:`, error);
      return { data: [], page: 1, pageSize: 10, totalItems: 0, totalPages: 0 };
    }
  },
  
  // Get training sessions for a specific member with pagination
  getMemberSessionsPaginated: async (memberId, page = 1, pageSize = 10, filters = {}) => {
    try {
      let queryParams = `member_id=${memberId}&page=${page}&pageSize=${pageSize}`;
      
      // Add optional filters
      if (filters.status) queryParams += `&status=${filters.status}`;
      if (filters.trainerId) queryParams += `&trainer_id=${filters.trainerId}`;
      if (filters.date) queryParams += `&date=${filters.date}`;
      if (filters.dateFrom) queryParams += `&date_from=${filters.dateFrom}`;
      if (filters.dateTo) queryParams += `&date_to=${filters.dateTo}`;
      
      const response = await apiClient.get(`${ENDPOINTS.trainingSessions}?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch paginated training sessions for member ${memberId}:`, error);
      return { data: [], page: 1, pageSize: 10, totalItems: 0, totalPages: 0 };
    }
  },
  
  // Get training sessions by date range with pagination
  getSessionsByDateRangePaginated: async (dateFrom, dateTo, page = 1, pageSize = 10, filters = {}) => {
    try {
      let queryParams = `date_from=${dateFrom}&date_to=${dateTo}&page=${page}&pageSize=${pageSize}`;
      
      // Add optional filters
      if (filters.status) queryParams += `&status=${filters.status}`;
      if (filters.trainerId) queryParams += `&trainer_id=${filters.trainerId}`;
      if (filters.memberId) queryParams += `&member_id=${filters.memberId}`;
      
      const response = await apiClient.get(`${ENDPOINTS.trainingSessions}?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch paginated training sessions for date range ${dateFrom} to ${dateTo}:`, error);
      return { data: [], page: 1, pageSize: 10, totalItems: 0, totalPages: 0 };
    }
  },
  
  completeTrainingSession: async (id) => {
    try {
      const response = await apiClient.put(`${ENDPOINTS.trainingSessions}/${id}/complete`);
      return response.data;
    } catch (error) {
      console.error(`Failed to complete training session ${id}:`, error);
      throw error;
    }
  }
};

export default staffService;
