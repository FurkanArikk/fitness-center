import apiClient from './apiClient';
import { ENDPOINTS } from './endpoints';

// Veri dönüştürme fonksiyonları
const convertSnakeToCamel = (obj) => {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(convertSnakeToCamel);
  if (typeof obj !== 'object') return obj;
  
  const converted = {};
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    converted[camelKey] = convertSnakeToCamel(value);
  }
  return converted;
};

const convertCamelToSnake = (obj) => {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(convertCamelToSnake);
  if (typeof obj !== 'object') return obj;
  
  const converted = {};
  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    converted[snakeKey] = convertCamelToSnake(value);
  }
  return converted;
};

// Retry function
const retryOperation = async (operation, maxRetries = 2, delay = 1000) => {
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      console.warn(`Operation failed (attempt ${attempt + 1}/${maxRetries + 1}):`, error);
      
      if (attempt < maxRetries) {
        // Wait before retrying, increasing the delay each time
        await new Promise(resolve => setTimeout(resolve, delay * (attempt + 1)));
      }
    }
  }
  
  throw lastError;
};

const memberService = {
  // Member methods
  getMembers: async (page = 1, pageSize = 10) => {
    try {
      const url = `${ENDPOINTS.members}?page=${page}&pageSize=${pageSize}`;
      console.log('[Members Service] Request:', url);
      
      // Make API request
      const response = await apiClient.get(url);
      console.log('[Members Service] Response received:', response.status);
      console.log('[Members Service] Response data:', response.data);
      
      // Convert response data from snake_case to camelCase
      const convertedData = convertSnakeToCamel(response.data);
      console.log('[Members Service] Converted data:', convertedData);
      return convertedData;
    } catch (error) {
      console.error("[Members Service] Error:", error.message);
      console.error("[Members Service] Full error:", error);
      // Throw error with message
      throw new Error(`Could not fetch member data: ${error.message}`);
    }
  },
  
  getAllMembers: async () => {
    try {
      console.log('[Members Service] Fetching all members');
      const response = await apiClient.get(ENDPOINTS.members);
      console.log('[Members Service] All members received:', response.status);
      
      // Convert response data from snake_case to camelCase
      const convertedData = convertSnakeToCamel(response.data);
      return convertedData;
    } catch (error) {
      console.error("[Members Service] Error fetching all members:", error.message);
      throw new Error(`Failed to fetch all members: ${error.message}`);
    }
  },
  
  getMember: async (id) => {
    try {
      const response = await apiClient.get(`${ENDPOINTS.members}/${id}`);
      // Convert response data from snake_case to camelCase
      const convertedData = convertSnakeToCamel(response.data);
      return convertedData;
    } catch (error) {
      console.error(`Failed to fetch member ${id}:`, error);
      return null;
    }
  },

  // Member operations with automated field conversion
  createMember: async (memberData) => {
    try {
      // Convert to snake_case format for API
      const apiData = convertCamelToSnake(memberData);
      
      console.log('[Member Service] Creating member with data:', apiData);
      const response = await apiClient.post(ENDPOINTS.members, apiData);
      
      // Convert response back to camelCase
      const convertedResponse = convertSnakeToCamel(response.data);
      return convertedResponse;
    } catch (error) {
      console.error("Failed to create member:", error);
      throw error;
    }
  },

  updateMember: async (id, memberData) => {
    try {
      // Convert to snake_case format for API
      const apiData = convertCamelToSnake(memberData);
      
      console.log(`[Member Service] Updating member ${id} with data:`, apiData);
      const response = await apiClient.put(`${ENDPOINTS.members}/${id}`, apiData);
      
      // Convert response back to camelCase
      const convertedResponse = convertSnakeToCamel(response.data);
      return convertedResponse;
    } catch (error) {
      console.error(`Failed to update member ${id}:`, error);
      throw error;
    }
  },

  deleteMember: async (id) => {
    try {
      console.log(`[Member Service] Starting deletion process for member ${id}`);
      
      // First, get all member-membership relationships for this member
      let memberMemberships = [];
      try {
        memberMemberships = await memberService.getMemberMemberships(id);
        console.log(`[Member Service] Found ${memberMemberships.length} membership relationships for member ${id}`);
      } catch (membershipError) {
        console.warn(`[Member Service] Could not fetch memberships for member ${id}:`, membershipError);
        // Continue with deletion even if we can't fetch memberships
      }

      // Delete all member-membership relationships first
      const membershipDeletionResults = [];
      for (const membership of memberMemberships) {
        try {
          const membershipId = membership.id || membership.memberMembershipId;
          if (membershipId) {
            console.log(`[Member Service] Deleting member-membership ${membershipId}`);
            const deleteResult = await memberService.deleteMemberMembership(membershipId);
            membershipDeletionResults.push(deleteResult);
          }
        } catch (membershipDeleteError) {
          console.error(`[Member Service] Failed to delete membership relationship:`, membershipDeleteError);
          membershipDeletionResults.push(false);
        }
      }

      // Log membership deletion results
      const successfulDeletions = membershipDeletionResults.filter(result => result === true).length;
      console.log(`[Member Service] Deleted ${successfulDeletions}/${memberMemberships.length} membership relationships`);

      // Now delete the member
      const response = await apiClient.delete(`${ENDPOINTS.members}/${id}`);
      console.log(`[Member Service] Member ${id} deleted successfully:`, response.data);
      
      return { 
        success: true, 
        message: `Member and ${successfulDeletions} associated membership(s) deleted successfully`,
        deletedMemberships: successfulDeletions
      };
    } catch (error) {
      console.error(`Failed to delete member ${id}:`, error);
      
      if (error.response?.status === 404) {
        return { 
          success: false, 
          error: "Member not found" 
        };
      }
      
      return { 
        success: false, 
        error: error.response?.data?.error || "Failed to delete member" 
      };
    }
  },
  
  // Membership methods
  getMemberships: async (active = null) => {
    return retryOperation(async () => {
      try {
        const url = active !== null ? `${ENDPOINTS.memberships}?active=${active}` : ENDPOINTS.memberships;
        console.log('[Memberships Service] Request:', url);
        
        const response = await apiClient.get(url);
        console.log('[Memberships Service] Response received:', response.status);
        console.log('[Memberships Service] Response data:', response.data);
        
        // Convert response from snake_case to camelCase
        const convertedData = convertSnakeToCamel(response.data);
        console.log('[Memberships Service] Converted data:', convertedData);
        return convertedData;
      } catch (error) {
        console.error("Failed to fetch memberships:", error.message);
        console.error("Memberships detailed error:", {
          status: error.response?.status,
          data: error.response?.data,
          url: error.config?.url
        });
        throw error; // Re-throw to allow retry mechanism to work
      }
    }, 3, 1500); // 3 retries with 1.5 second delay
  },
  
  getMembership: async (id) => {
    try {
      const response = await apiClient.get(`${ENDPOINTS.memberships}/${id}`);
      
      // Convert response from snake_case to camelCase
      const convertedData = convertSnakeToCamel(response.data);
      return convertedData;
    } catch (error) {
      console.error(`Failed to fetch membership ${id}:`, error);
      return null;
    }
  },
  
  createMembership: async (membershipData) => {
    try {
      // Convert to snake_case format for API
      const apiData = convertCamelToSnake(membershipData);
      
      console.log('[Membership Service] Creating membership with data:', apiData);
      const response = await apiClient.post(ENDPOINTS.memberships, apiData);
      
      // Convert response back to camelCase
      const convertedResponse = convertSnakeToCamel(response.data);
      return convertedResponse;
    } catch (error) {
      console.error("Failed to create membership:", error);
      throw error;
    }
  },
  
  updateMembership: async (id, membershipData) => {
    try {
      if (!id) {
        console.error('Invalid membership ID for update');
        throw new Error('Invalid membership ID');
      }
      
      // Convert to snake_case format for API
      const apiData = convertCamelToSnake(membershipData);
      
      console.log(`[Membership Service] Updating membership ${id} with data:`, apiData);
      const response = await apiClient.put(`${ENDPOINTS.memberships}/${id}`, apiData);
      
      // Convert response back to camelCase
      const convertedResponse = convertSnakeToCamel(response.data);
      return convertedResponse;
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
      // Backend expects is_active field
      const apiData = {
        is_active: statusData.isActive !== undefined ? statusData.isActive : statusData.is_active
      };
      await apiClient.put(`${ENDPOINTS.memberships}/${id}/status`, apiData);
      return true;
    } catch (error) {
      console.error(`Failed to update membership status ${id}:`, error);
      return false;
    }
  },
  
  getMembershipBenefits: async (membershipId) => {
    try {
      const response = await apiClient.get(`${ENDPOINTS.memberships}/${membershipId}/benefits`);
      
      // Backend returns { membership_id: X, benefits: [...] } or directly [...]
      let benefits = [];
      if (response.data) {
        // If it returns an object with benefits array
        if (response.data.benefits && Array.isArray(response.data.benefits)) {
          benefits = response.data.benefits;
        }
        // If it directly returns an array
        else if (Array.isArray(response.data)) {
          benefits = response.data;
        }
      }
      
      // Convert response from snake_case to camelCase
      const convertedBenefits = convertSnakeToCamel(benefits);
      
      console.log(`[Membership Service] Got ${convertedBenefits.length} benefits for membership ${membershipId}`);
      return convertedBenefits;
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
        
        // Convert response from snake_case to camelCase
        const convertedData = convertSnakeToCamel(response.data);
        return convertedData;
      } catch (error) {
        console.error(`Failed to fetch memberships for member ${memberId}:`, error);
        if (error.response && error.response.status === 500) {
          console.warn(`Server error when fetching memberships for member ${memberId}, returning empty array`);
          return []; // Return empty array in case of 500 error
        }
        throw error;
      }
    });
  },
  
  getMemberActiveMembership: async (memberId) => {
    return retryOperation(async () => {
      try {
        const response = await apiClient.get(`${ENDPOINTS.members}/${memberId}/active-membership`);
        
        // Convert response from snake_case to camelCase
        const convertedData = convertSnakeToCamel(response.data);
        return convertedData;
      } catch (error) {
        console.error(`Failed to fetch active membership for member ${memberId}:`, error);
        if (error.response && error.response.status === 500) {
          console.warn(`Server error when fetching active membership for member ${memberId}, returning null`);
          return null; // Return null in case of 500 error
        }
        throw error;
      }
    });
  },
  
  getMemberAssessments: async (memberId) => {
    try {
      const response = await apiClient.get(`${ENDPOINTS.members}/${memberId}/assessments`);
      
      // Convert response from snake_case to camelCase
      const convertedData = convertSnakeToCamel(response.data);
      return convertedData;
    } catch (error) {
      console.error(`Failed to fetch assessments for member ${memberId}:`, error);
      return [];
    }
  },
  
  // Benefit operations
  getBenefits: async () => {
    return retryOperation(async () => {
      try {
        console.log('[Benefits Service] Fetching all benefits');
        const response = await apiClient.get(ENDPOINTS.benefits);
        console.log('[Benefits Service] Response received:', response.status);
        console.log('[Benefits Service] Response data:', response.data);
        
        // Convert response from snake_case to camelCase
        const convertedData = convertSnakeToCamel(response.data);
        console.log('[Benefits Service] Converted data:', convertedData);
        return convertedData;
      } catch (error) {
        console.error("Failed to fetch benefits:", error.message);
        console.error("Benefits detailed error:", {
          status: error.response?.status,
          data: error.response?.data,
          url: error.config?.url
        });
        throw error; // Re-throw to allow retry mechanism to work
      }
    }, 3, 1500); // 3 retries with 1.5 second delay
  },
  
  getBenefit: async (id) => {
    try {
      const response = await apiClient.get(`${ENDPOINTS.benefits}/${id}`);
      
      // Convert response from snake_case to camelCase
      const convertedData = convertSnakeToCamel(response.data);
      return convertedData;
    } catch (error) {
      console.error(`Failed to fetch benefit ${id}:`, error);
      return null;
    }
  },
  
  createBenefit: async (benefitData) => {
    try {
      // Convert to snake_case format for API
      const apiData = convertCamelToSnake(benefitData);
      
      console.log('[Benefit Service] Creating benefit with data:', apiData);
      const response = await apiClient.post(ENDPOINTS.benefits, apiData);
      
      // Convert response back to camelCase
      const convertedResponse = convertSnakeToCamel(response.data);
      return convertedResponse;
    } catch (error) {
      console.error('Failed to create benefit:', error);
      throw error;
    }
  },
  
  updateBenefit: async (id, benefitData) => {
    try {
      // Convert to snake_case format for API
      const apiData = convertCamelToSnake(benefitData);
      
      console.log(`[Benefit Service] Updating benefit ${id} with data:`, apiData);
      const response = await apiClient.put(`${ENDPOINTS.benefits}/${id}`, apiData);
      
      // Convert response back to camelCase
      const convertedResponse = convertSnakeToCamel(response.data);
      return convertedResponse;
    } catch (error) {
      console.error(`Failed to update benefit ${id}:`, error);
      throw error;
    }
  },
  
  deleteBenefit: async (id) => {
    try {
      await apiClient.delete(`${ENDPOINTS.benefits}/${id}`);
      return true;
    } catch (error) {
      console.error(`Failed to delete benefit ${id}:`, error);
      return false;
    }
  },
  
  // Function to delete a membership type and its associated benefits
  deleteMembershipWithBenefits: async (membershipId) => {
    try {
      console.log(`[Membership Service] Deleting membership ${membershipId} with its benefits`);
      
      // First get all benefits of this membership type
      const benefits = await memberService.getMembershipBenefits(membershipId);
      console.log(`[Membership Service] Found ${benefits.length} benefits to delete for membership ${membershipId}`);
      
      // Delete all benefits
      const benefitDeleteResults = await Promise.all(
        benefits.map(async (benefit) => {
          const benefitId = benefit.id || benefit.benefit_id;
          if (!benefitId) {
            console.warn(`[Membership Service] Benefit without ID found, skipping:`, benefit);
            return false;
          }
          
          console.log(`[Membership Service] Deleting benefit ${benefitId}`);
          return await memberService.deleteBenefit(benefitId);
        })
      );
      
      // Check if all benefits were successfully deleted
      const allBenefitsDeleted = benefitDeleteResults.every(result => result === true);
      if (!allBenefitsDeleted) {
        console.warn('[Membership Service] Some benefits could not be deleted');
      }
      
      // Now delete the membership type
      console.log(`[Membership Service] Now deleting membership ${membershipId}`);
      await apiClient.delete(`${ENDPOINTS.memberships}/${membershipId}`);
      
      return { 
        success: true,
        message: `Membership and ${benefits.length} benefits deleted successfully`
      };
      
    } catch (error) {
      console.error(`[Membership Service] Failed to delete membership ${membershipId} with benefits:`, error);
      
      return { 
        success: false,
        error: `Error deleting membership: ${error.message || 'Unknown error'}` 
      };
    }
  },
  
  // Assessment operations
  getAssessments: async (memberId) => {
    try {
      const response = await apiClient.get(`${ENDPOINTS.members}/${memberId}/assessments`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch assessments for member ${memberId}:`, error);
      return [];
    }
  },
  
  getAssessment: async (id) => {
    try {
      const response = await apiClient.get(`${ENDPOINTS.assessments}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch assessment ${id}:`, error);
      return null;
    }
  },
   createAssessment: async (assessmentData) => {
    try {
      // Convert to snake_case format for API
      const apiData = convertCamelToSnake(assessmentData);
      
      console.log('[Assessment Service] Creating assessment with data:', apiData);
      const response = await apiClient.post(ENDPOINTS.assessments, apiData);
      
      // Convert response back to camelCase
      const convertedResponse = convertSnakeToCamel(response.data);
      return convertedResponse;
    } catch (error) {
      console.error('Failed to create assessment:', error);
      throw error;
    }
  },

  updateAssessment: async (id, assessmentData) => {
    try {
      if (!id) {
        console.error('Invalid assessment ID for update');
        throw new Error('Invalid assessment ID');
      }
      
      // Convert to snake_case format for API
      const apiData = convertCamelToSnake(assessmentData);
      
      console.log(`[Assessment Service] Updating assessment ${id} with data:`, apiData);
      const response = await apiClient.put(`${ENDPOINTS.assessments}/${id}`, apiData);
      
      // Convert response back to camelCase
      const convertedResponse = convertSnakeToCamel(response.data);
      return convertedResponse;
    } catch (error) {
      console.error(`Failed to update assessment ${id}:`, error);
      throw error;
    }
  },
  
  deleteAssessment: async (id) => {
    try {
      await apiClient.delete(`${ENDPOINTS.assessments}/${id}`);
      return true;
    } catch (error) {
      console.error(`Failed to delete assessment ${id}:`, error);
      return false;
    }
  },  // Membership assignment operations
  assignMembershipToMember: async (membershipData) => {
    try {
      // Convert to snake_case format for API
      const apiData = convertCamelToSnake(membershipData);
      
      console.log("[Member Membership] Sending data:", apiData);
      
      const response = await apiClient.post(`${ENDPOINTS.memberMemberships}`, apiData);
      
      // Convert response back to camelCase
      const convertedResponse = convertSnakeToCamel(response.data);
      return convertedResponse;
    } catch (error) {
      console.error(`Failed to assign membership to member:`, error);
      throw error;
    }
  },

  getMemberMembershipById: async (id) => {
    try {
      const response = await apiClient.get(`${ENDPOINTS.memberMemberships}/${id}`);
      
      // Convert response from snake_case to camelCase
      const convertedData = convertSnakeToCamel(response.data);
      return convertedData;
    } catch (error) {
      console.error(`Failed to fetch member-membership ${id}:`, error);
      return null;
    }
  },

  updateMemberMembership: async (id, data) => {
    try {
      // Convert to snake_case format for API
      const apiData = convertCamelToSnake(data);
      
      console.log(`[Member Membership] Updating member-membership ${id} with data:`, apiData);
      const response = await apiClient.put(`${ENDPOINTS.memberMemberships}/${id}`, apiData);
      
      // Convert response back to camelCase
      const convertedResponse = convertSnakeToCamel(response.data);
      return convertedResponse;
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

export default memberService;
