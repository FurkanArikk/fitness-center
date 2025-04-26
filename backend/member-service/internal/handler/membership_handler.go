package handler

import (
	"net/http"
	"strconv"

	"github.com/FurkanArikk/fitness-center/backend/member-service/internal/model"
	"github.com/gin-gonic/gin"
)

// GetMemberships returns all memberships
func (h *MembershipHandler) GetMemberships(c *gin.Context) {
	// Parse query parameters for pagination
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "10"))

	memberships, err := h.service.List(c.Request.Context(), page, pageSize)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, memberships)
}

// GetMembershipByID returns a specific membership
func (h *MembershipHandler) GetMembershipByID(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid membership ID"})
		return
	}

	membership, err := h.service.GetByID(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, membership)
}

// CreateMembership creates a new membership
func (h *MembershipHandler) CreateMembership(c *gin.Context) {
	var membership model.Membership
	if err := c.ShouldBindJSON(&membership); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.service.Create(c.Request.Context(), &membership); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, membership)
}

// UpdateMembership updates an existing membership
func (h *MembershipHandler) UpdateMembership(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid membership ID"})
		return
	}

	var membership model.Membership
	if err := c.ShouldBindJSON(&membership); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	membership.ID = id

	if err := h.service.Update(c.Request.Context(), &membership); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, membership)
}

// DeleteMembership deletes a membership
func (h *MembershipHandler) DeleteMembership(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid membership ID"})
		return
	}

	if err := h.service.Delete(c.Request.Context(), id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Membership deleted successfully"})
}

// ToggleMembershipStatus toggles the active status of a membership
func (h *MembershipHandler) ToggleMembershipStatus(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid membership ID"})
		return
	}

	var request struct {
		IsActive bool `json:"isActive"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.service.UpdateStatus(c.Request.Context(), id, request.IsActive); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Membership status updated successfully"})
}

// GetMembershipBenefits returns all benefits for a membership
func (h *MembershipHandler) GetMembershipBenefits(c *gin.Context) {
	membershipID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid membership ID"})
		return
	}

	// First, verify the membership exists
	_, err = h.service.GetByID(c.Request.Context(), membershipID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Membership not found"})
		return
	}

	// Now, get the benefits using the benefit service
	benefits, err := h.benefitService.List(c.Request.Context(), membershipID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Return empty array when no benefits found
	if len(benefits) == 0 {
		c.JSON(http.StatusOK, gin.H{
			"membershipID": membershipID,
			"benefits":     []gin.H{},
			"message":      "No benefits found for this membership",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"membershipID": membershipID,
		"benefits":     benefits,
	})
}
