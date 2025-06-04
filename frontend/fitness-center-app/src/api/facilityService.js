import apiClient from "./apiClient";
import { ENDPOINTS } from "./endpoints";

const facilityService = {
  // Facility methods
  getFacilities: async (page = 1, size = 10, status = null) => {
    try {
      let url = `${ENDPOINTS.facilities}?page=${page}&size=${size}`;
      if (status) url += `&status=${status}`;

      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch facilities:", error);
      return { data: [] };
    }
  },

  // Get all facilities across all pages
  getAllFacilities: async () => {
    try {
      let allFacilities = [];
      let currentPage = 1;
      let totalPages = 1;

      do {
        const response = await facilityService.getFacilities(currentPage, 50); // Use larger page size for efficiency
        allFacilities = [...allFacilities, ...(response.data || [])];
        totalPages = response.totalPages || 1;
        currentPage++;
      } while (currentPage <= totalPages);

      console.log(
        `Fetched ${allFacilities.length} total facilities from ${totalPages} pages`
      );
      return allFacilities;
    } catch (error) {
      console.error("Failed to fetch all facilities:", error);
      return [];
    }
  },

  getFacility: async (id) => {
    try {
      const response = await apiClient.get(`${ENDPOINTS.facilities}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch facility ${id}:`, error);
      return null;
    }
  },

  createFacility: async (facilityData) => {
    try {
      const response = await apiClient.post(ENDPOINTS.facilities, facilityData);
      return response.data;
    } catch (error) {
      console.error("Failed to create facility:", error);
      throw error;
    }
  },

  updateFacility: async (id, facilityData) => {
    try {
      const response = await apiClient.put(
        `${ENDPOINTS.facilities}/${id}`,
        facilityData
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to update facility ${id}:`, error);
      throw error;
    }
  },

  deleteFacility: async (id) => {
    try {
      const response = await apiClient.delete(`${ENDPOINTS.facilities}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to delete facility ${id}:`, error);
      throw error;
    }
  },

  getFacilitiesByStatus: async (status) => {
    try {
      const response = await apiClient.get(
        `${ENDPOINTS.facilities}/status/${status}`
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch facilities with status ${status}:`, error);
      return [];
    }
  },

  // Equipment methods
  getEquipment: async (page = 1, size = 10) => {
    try {
      const response = await apiClient.get(
        `${ENDPOINTS.equipment}?page=${page}&size=${size}`
      );
      return response.data;
    } catch (error) {
      console.error("Failed to fetch equipment:", error);
      return { data: [] };
    }
  },

  // Get all equipment across all pages
  getAllEquipment: async () => {
    try {
      let allEquipment = [];
      let currentPage = 1;
      let totalPages = 1;

      do {
        const response = await facilityService.getEquipment(currentPage, 50); // Use larger page size for efficiency
        const equipmentData = response.data || [];
        allEquipment = [...allEquipment, ...equipmentData];
        totalPages = response.totalPages || 1;
        currentPage++;

        console.log(
          `Fetching equipment page ${currentPage - 1}/${totalPages}, got ${
            equipmentData.length
          } items`
        );
      } while (currentPage <= totalPages);

      console.log(
        `Total equipment fetched: ${allEquipment.length} from ${totalPages} pages`
      );
      return allEquipment;
    } catch (error) {
      console.error("Failed to fetch all equipment:", error);
      return [];
    }
  },

  getEquipmentItem: async (id) => {
    try {
      const response = await apiClient.get(`${ENDPOINTS.equipment}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch equipment ${id}:`, error);
      return null;
    }
  },

  createEquipment: async (equipmentData) => {
    try {
      const response = await apiClient.post(ENDPOINTS.equipment, equipmentData);
      return response.data;
    } catch (error) {
      console.error("Failed to create equipment:", error);
      throw error;
    }
  },

  updateEquipment: async (id, equipmentData) => {
    try {
      const response = await apiClient.put(
        `${ENDPOINTS.equipment}/${id}`,
        equipmentData
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to update equipment ${id}:`, error);
      throw error;
    }
  },

  deleteEquipment: async (id) => {
    try {
      const response = await apiClient.delete(`${ENDPOINTS.equipment}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to delete equipment ${id}:`, error);
      throw error;
    }
  },

  getEquipmentByCategory: async (category) => {
    try {
      const response = await apiClient.get(
        `${ENDPOINTS.equipment}/category/${category}`
      );
      return response.data;
    } catch (error) {
      console.error(
        `Failed to fetch equipment with category ${category}:`,
        error
      );
      return [];
    }
  },

  getEquipmentByStatus: async (status) => {
    try {
      const response = await apiClient.get(
        `${ENDPOINTS.equipment}/status/${status}`
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch equipment with status ${status}:`, error);
      return [];
    }
  },

  getEquipmentDueForMaintenance: async (date = null) => {
    try {
      let url = `${ENDPOINTS.equipment}/maintenance`;
      if (date) url += `?date=${date}`;

      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch equipment due for maintenance:", error);
      return [];
    }
  },

  // Attendance methods
  createAttendance: async (attendanceData) => {
    try {
      const response = await apiClient.post(
        ENDPOINTS.attendance,
        attendanceData
      );
      return response.data;
    } catch (error) {
      console.error("Failed to create attendance record:", error);
      throw error;
    }
  },

  getAttendance: async (id) => {
    try {
      const response = await apiClient.get(`${ENDPOINTS.attendance}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch attendance record ${id}:`, error);
      return null;
    }
  },

  updateAttendance: async (id, attendanceData) => {
    try {
      const response = await apiClient.put(
        `${ENDPOINTS.attendance}/${id}`,
        attendanceData
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to update attendance record ${id}:`, error);
      throw error;
    }
  },

  deleteAttendance: async (id) => {
    try {
      const response = await apiClient.delete(`${ENDPOINTS.attendance}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to delete attendance record ${id}:`, error);
      throw error;
    }
  },

  checkOut: async (id) => {
    try {
      const response = await apiClient.post(
        `${ENDPOINTS.attendance}/${id}/checkout`
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to record checkout for attendance ${id}:`, error);
      throw error;
    }
  },

  getAllAttendance: async (page = 1, pageSize = 10) => {
    try {
      const response = await apiClient.get(
        `${ENDPOINTS.attendance}?page=${page}&pageSize=${pageSize}`
      );
      return response.data;
    } catch (error) {
      console.error("Failed to fetch attendance records:", error);
      return { data: [] };
    }
  },

  // Get all attendance across all pages
  getAllAttendanceComplete: async () => {
    try {
      let allAttendance = [];
      let currentPage = 1;
      let totalPages = 1;

      do {
        const response = await facilityService.getAllAttendance(
          currentPage,
          50
        ); // Use larger page size for efficiency
        allAttendance = [...allAttendance, ...(response.data || [])];
        totalPages = response.totalPages || 1;
        currentPage++;
      } while (currentPage <= totalPages);

      console.log(
        `Fetched ${allAttendance.length} total attendance records from ${totalPages} pages`
      );
      return allAttendance;
    } catch (error) {
      console.error("Failed to fetch all attendance records:", error);
      return [];
    }
  },

  getAttendanceByMember: async (memberId) => {
    try {
      const response = await apiClient.get(
        `${ENDPOINTS.attendance}/member/${memberId}`
      );
      return response.data;
    } catch (error) {
      console.error(
        `Failed to fetch attendance for member ${memberId}:`,
        error
      );
      return [];
    }
  },

  getAttendanceByFacility: async (facilityId) => {
    try {
      const response = await apiClient.get(
        `${ENDPOINTS.attendance}/facility/${facilityId}`
      );
      return response.data;
    } catch (error) {
      console.error(
        `Failed to fetch attendance for facility ${facilityId}:`,
        error
      );
      return [];
    }
  },

  getAttendanceByDate: async (date) => {
    try {
      const response = await apiClient.get(
        `${ENDPOINTS.attendance}/date/${date}`
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch attendance for date ${date}:`, error);
      return [];
    }
  },
};

export default facilityService;
