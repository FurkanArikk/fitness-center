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
      const url = active !== null ? `${ENDPOINTS.memberships}?isActive=${active}` : ENDPOINTS.memberships;
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
      const apiData = {
        membershipName: membershipData.name,
        description: membershipData.description,
        duration: membershipData.durationMonths,
        price: membershipData.price,
        isActive: membershipData.active
      };
      
      const response = await apiClient.post(ENDPOINTS.memberships, apiData);
      return response.data;
    } catch (error) {
      console.error("Failed to create membership:", error);
      throw error;
    }
  },
  
  updateMembership: async (id, membershipData) => {
    try {
      const apiData = {
        membershipName: membershipData.name,
        description: membershipData.description,
        duration: membershipData.durationMonths,
        price: membershipData.price,
        isActive: membershipData.active
      };
      
      const response = await apiClient.put(`${ENDPOINTS.memberships}/${id}`, apiData);
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
      return response.data.benefits || [];
    } catch (error) {
      console.error(`Failed to fetch benefits for membership ${membershipId}:`, error);
      return [];
    }
  },
  
  // Member specific operations
  getMemberMemberships: async (memberId) => {
    return retryOperation(async () => {
      try {
        console.log(`[Member Service] Fetching memberships for member ${memberId}`);
        const response = await apiClient.get(`${ENDPOINTS.members}/${memberId}/memberships`);
        console.log(`[Member Service] Retrieved ${response.data.length || 0} memberships for member ${memberId}`);
        return response.data;
      } catch (error) {
        console.error(`Failed to fetch memberships for member ${memberId}:`, error);
        if (error.response && error.response.status === 500) {
          console.warn(`Server error when fetching memberships for member ${memberId}, returning empty array`);
          return []; // 500 hatası durumunda boş dizi döndür
        }
        throw error;
      }
    });
  },
  
  getMemberActiveMembership: async (memberId) => {
    return retryOperation(async () => {
      try {
        const response = await apiClient.get(`${ENDPOINTS.members}/${memberId}/active-membership`);
        return response.data;
      } catch (error) {
        console.error(`Failed to fetch active membership for member ${memberId}:`, error);
        if (error.response && error.response.status === 500) {
          console.warn(`Server error when fetching active membership for member ${memberId}, returning null`);
          return null; // 500 hatası durumunda null döndür
        }
        throw error;
      }
    });
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

  // Membership assignment operations
  assignMembershipToMember: async (membershipData) => {
    try {
      // API'nin beklediği formata dönüştür
      const apiData = {
        memberId: membershipData.memberId,
        membershipId: membershipData.membershipId,
        startDate: membershipData.startDate + "T00:00:00Z",
        endDate: membershipData.endDate + "T00:00:00Z",
        paymentStatus: membershipData.paymentMethod === "cash" ? "paid" : "pending",
        contractSigned: true
      };
      
      console.log("[Member Membership] Sending data:", apiData);
      
      const response = await apiClient.post(`${ENDPOINTS.memberMemberships}`, apiData);
      return response.data;
    } catch (error) {
      console.error(`Failed to assign membership to member:`, error);
      throw error;
    }
  },
  
  getMemberMembershipById: async (id) => {
    try {
      const response = await apiClient.get(`${ENDPOINTS.memberMemberships}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch member-membership ${id}:`, error);
      return null;
    }
  },
  
  updateMemberMembership: async (id, data) => {
    try {
      const apiData = {
        member_id: data.memberId,
        membership_id: data.membershipId,
        start_date: data.startDate + "T00:00:00Z",
        end_date: data.endDate + "T00:00:00Z",
        payment_status: data.paymentStatus,
        contract_signed: data.contractSigned
      };
      
      const response = await apiClient.put(`${ENDPOINTS.memberMemberships}/${id}`, apiData);
      return response.data;
    } catch (error) {
      console.error(`Failed to update member-membership ${id}:`, error);
      throw error;
    }
  },
  
  deleteMemberMembership: async (id) => {
    try {
      await apiClient.delete(`${ENDPOINTS.memberMemberships}/${id}`);
      return true;
    } catch (error) {
      console.error(`Failed to delete member-membership ${id}:`, error);
      return false;
    }
  },
};

// Yeniden deneme fonksiyonu
const retryOperation = async (operation, maxRetries = 2, delay = 1000) => {
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      console.warn(`Operation failed (attempt ${attempt + 1}/${maxRetries + 1}):`, error);
      
      if (attempt < maxRetries) {
        // Yeniden denemeden önce bekle, her seferinde bekleme süresini artır
        await new Promise(resolve => setTimeout(resolve, delay * (attempt + 1)));
      }
    }
  }
  
  throw lastError;
};

export default memberService;
