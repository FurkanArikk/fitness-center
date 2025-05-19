import apiClient from './apiClient';
import { ENDPOINTS } from './endpoints';

const memberService = {
  // Member methods
  getMembers: async (page = 1, pageSize = 10) => {
    try {
      const url = `${ENDPOINTS.members}?page=${page}&pageSize=${pageSize}`;
      console.log('[Members Service] Request:', url);
      
      // Make API request
      const response = await apiClient.get(url);
      console.log('[Members Service] Response received:', response.status);
      
      // Return data directly from API
      return response.data;
    } catch (error) {
      console.error("[Members Service] Error:", error.message);
      // Throw error with message
      throw new Error(`Could not fetch member data: ${error.message}`);
    }
  },
  
  getAllMembers: async () => {
    try {
      console.log('[Members Service] Fetching all members');
      const response = await apiClient.get(ENDPOINTS.members);
      console.log('[Members Service] All members received:', response.status);
      return response.data;
    } catch (error) {
      console.error("[Members Service] Error fetching all members:", error.message);
      throw new Error(`Failed to fetch all members: ${error.message}`);
    }
  },
  
  getMember: async (id) => {
    try {
      const response = await apiClient.get(`${ENDPOINTS.members}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch member ${id}:`, error);
      return null;
    }
  },

  createMember: async (memberData) => {
    try {
      const response = await apiClient.post(ENDPOINTS.members, memberData);
      return response.data;
    } catch (error) {
      console.error("Failed to create member:", error);
      throw error;
    }
  },

  updateMember: async (id, memberData) => {
    try {
      const response = await apiClient.put(`${ENDPOINTS.members}/${id}`, memberData);
      return response.data;
    } catch (error) {
      console.error(`Failed to update member ${id}:`, error);
      throw error;
    }
  },

  deleteMember: async (id) => {
    try {
      await apiClient.delete(`${ENDPOINTS.members}/${id}`);
      return true;
    } catch (error) {
      console.error(`Failed to delete member ${id}:`, error);
      return false;
    }
  },
  
  // Membership methods
  getMemberships: async (active = null) => {
    try {
      const url = active !== null ? `${ENDPOINTS.memberships}?active=${active}` : ENDPOINTS.memberships;
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch memberships:", error);
      return [];
    }
  },
  
  getMembership: async (id) => {
    try {
      const response = await apiClient.get(`${ENDPOINTS.memberships}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch membership ${id}:`, error);
      return null;
    }
  },
  
  createMembership: async (membershipData) => {
    try {
      const response = await apiClient.post(ENDPOINTS.memberships, membershipData);
      return response.data;
    } catch (error) {
      console.error("Failed to create membership:", error);
      throw error;
    }
  },
  
  updateMembership: async (id, membershipData) => {
    try {
      const response = await apiClient.put(`${ENDPOINTS.memberships}/${id}`, membershipData);
      return response.data;
    } catch (error) {
      console.error(`Failed to update membership ${id}:`, error);
      throw error;
    }
  },
  
  deleteMembership: async (id) => {
    try {
      await apiClient.delete(`${ENDPOINTS.memberships}/${id}`);
      return true;
    } catch (error) {
      console.error(`Failed to delete membership ${id}:`, error);
      return false;
    }
  },
  
  updateMembershipStatus: async (id, statusData) => {
    try {
      await apiClient.put(`${ENDPOINTS.memberships}/${id}/status`, statusData);
      return true;
    } catch (error) {
      console.error(`Failed to update membership status ${id}:`, error);
      return false;
    }
  },
  
  getMembershipBenefits: async (membershipId) => {
    try {
      const response = await apiClient.get(`${ENDPOINTS.memberships}/${membershipId}/benefits`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch benefits for membership ${membershipId}:`, error);
      return [];
    }
  },
  
  // Member specific operations
  getMemberMemberships: async (memberId) => {
    try {
      const response = await apiClient.get(`${ENDPOINTS.members}/${memberId}/memberships`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch memberships for member ${memberId}:`, error);
      return [];
    }
  },
  
  getMemberActiveMembership: async (memberId) => {
    try {
      const response = await apiClient.get(`${ENDPOINTS.members}/${memberId}/active-membership`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch active membership for member ${memberId}:`, error);
      return null;
    }
  },
  
  getMemberAssessments: async (memberId) => {
    try {
      const response = await apiClient.get(`${ENDPOINTS.members}/${memberId}/assessments`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch assessments for member ${memberId}:`, error);
      return [];
    }
  },
  
  // Benefit operations
  getBenefit: async (id) => {
    try {
      const response = await apiClient.get(`${ENDPOINTS.benefits}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch benefit ${id}:`, error);
      return null;
    }
  },
};

export default memberService;
