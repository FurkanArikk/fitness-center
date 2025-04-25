package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// GetBenefits returns all benefits
func (h *BenefitHandler) GetBenefits(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Get all benefits endpoint"})
}

// GetBenefitByID returns a specific benefit
func (h *BenefitHandler) GetBenefitByID(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Get benefit by ID endpoint"})
}

// CreateBenefit creates a new benefit
func (h *BenefitHandler) CreateBenefit(c *gin.Context) {
	c.JSON(http.StatusCreated, gin.H{"message": "Create benefit endpoint"})
}

// UpdateBenefit updates an existing benefit
func (h *BenefitHandler) UpdateBenefit(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Update benefit endpoint"})
}

// DeleteBenefit deletes a benefit
func (h *BenefitHandler) DeleteBenefit(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Delete benefit endpoint"})
}
