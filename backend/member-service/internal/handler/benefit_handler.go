package handler

import (
	"net/http"
	"strconv"

	"github.com/FurkanArikk/fitness-center/backend/member-service/internal/model"
	"github.com/gin-gonic/gin"
)

// GetBenefits returns all benefits
func (h *BenefitHandler) GetBenefits(c *gin.Context) {
	// Check if we need to filter by membership ID
	membershipIDStr := c.Query("membershipId")

	var benefits []*model.MembershipBenefit
	var err error

	if membershipIDStr != "" {
		membershipID, err := strconv.ParseInt(membershipIDStr, 10, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid membership ID"})
			return
		}
		benefits, err = h.service.List(c.Request.Context(), membershipID)
	} else {
		benefits, err = h.service.ListAll(c.Request.Context())
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, benefits)
}

// GetBenefitByID returns a specific benefit
func (h *BenefitHandler) GetBenefitByID(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid benefit ID"})
		return
	}

	benefit, err := h.service.GetByID(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, benefit)
}

// CreateBenefit creates a new benefit
func (h *BenefitHandler) CreateBenefit(c *gin.Context) {
	var benefit model.MembershipBenefit
	if err := c.ShouldBindJSON(&benefit); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.service.Create(c.Request.Context(), &benefit); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, benefit)
}

// UpdateBenefit updates an existing benefit
func (h *BenefitHandler) UpdateBenefit(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid benefit ID"})
		return
	}

	var benefit model.MembershipBenefit
	if err := c.ShouldBindJSON(&benefit); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	benefit.ID = id

	if err := h.service.Update(c.Request.Context(), &benefit); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, benefit)
}

// DeleteBenefit deletes a benefit
func (h *BenefitHandler) DeleteBenefit(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid benefit ID"})
		return
	}

	if err := h.service.Delete(c.Request.Context(), id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Benefit deleted successfully"})
}
