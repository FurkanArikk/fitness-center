package handler

import (
	"errors"
	"net/http"
	"strconv"

	"github.com/FurkanArikk/fitness-center/backend/member-service/internal/model"
	"github.com/FurkanArikk/fitness-center/backend/member-service/internal/service"
	"github.com/gin-gonic/gin"
)

// GetMemberMemberships returns all memberships for a member
func (h *MemberMembershipHandler) GetMemberMemberships(c *gin.Context) {
	memberID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid member ID"})
		return
	}

	memberships, err := h.service.ListByMemberID(c.Request.Context(), memberID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, memberships)
}

// GetActiveMembership returns the active membership for a member
func (h *MemberMembershipHandler) GetActiveMembership(c *gin.Context) {
	memberID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid member ID"})
		return
	}

	membership, err := h.service.GetActiveMembership(c.Request.Context(), memberID)
	if err != nil {
		// Check if it's a "not found" error and return a more user-friendly response
		if errors.Is(err, service.ErrMemberMembershipNotFound) || err.Error() == "active membership not found: sql: no rows in result set" {
			c.JSON(http.StatusOK, gin.H{
				"message": "No active membership found for this member",
				"active":  false,
			})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"active":     true,
		"membership": membership,
	})
}

// GetMemberMembershipByID returns a specific member-membership relationship
func (h *MemberMembershipHandler) GetMemberMembershipByID(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid member-membership ID"})
		return
	}

	memberMembership, err := h.service.GetByID(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, memberMembership)
}

// CreateMemberMembership creates a new member-membership relationship
func (h *MemberMembershipHandler) CreateMemberMembership(c *gin.Context) {
	var memberMembership model.MemberMembership
	if err := c.ShouldBindJSON(&memberMembership); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.service.Create(c.Request.Context(), &memberMembership); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, memberMembership)
}

// UpdateMemberMembership updates an existing member-membership relationship
func (h *MemberMembershipHandler) UpdateMemberMembership(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid member-membership ID"})
		return
	}

	var memberMembership model.MemberMembership
	if err := c.ShouldBindJSON(&memberMembership); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	memberMembership.ID = id

	if err := h.service.Update(c.Request.Context(), &memberMembership); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, memberMembership)
}

// DeleteMemberMembership deletes a member-membership relationship
func (h *MemberMembershipHandler) DeleteMemberMembership(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid member-membership ID"})
		return
	}

	if err := h.service.Delete(c.Request.Context(), id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Member-membership relationship deleted successfully"})
}
