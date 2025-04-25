package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// GetAll returns all trainers
func (h *TrainerHandler) GetAll(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Get all trainers endpoint"})
}

// GetByID returns a specific trainer
func (h *TrainerHandler) GetByID(c *gin.Context) {
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	c.JSON(http.StatusOK, gin.H{"message": "Get trainer by ID endpoint", "id": id})
}

// GetByStaffID returns the trainer profile for a specific staff member
func (h *TrainerHandler) GetByStaffID(c *gin.Context) {
	staffID, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	c.JSON(http.StatusOK, gin.H{"message": "Get trainer by staff ID endpoint", "staffID": staffID})
}

// Create creates a new trainer
func (h *TrainerHandler) Create(c *gin.Context) {
	c.JSON(http.StatusCreated, gin.H{"message": "Create trainer endpoint"})
}

// Update updates an existing trainer
func (h *TrainerHandler) Update(c *gin.Context) {
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	c.JSON(http.StatusOK, gin.H{"message": "Update trainer endpoint", "id": id})
}

// Delete deletes a trainer
func (h *TrainerHandler) Delete(c *gin.Context) {
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	c.JSON(http.StatusOK, gin.H{"message": "Delete trainer endpoint", "id": id})
}

// GetBySpecialization returns trainers filtered by specialization
func (h *TrainerHandler) GetBySpecialization(c *gin.Context) {
	specialization := c.Param("spec")
	c.JSON(http.StatusOK, gin.H{"message": "Get trainers by specialization endpoint", "specialization": specialization})
}

// GetTopRated returns the top rated trainers
func (h *TrainerHandler) GetTopRated(c *gin.Context) {
	limit, _ := strconv.Atoi(c.Param("limit"))
	c.JSON(http.StatusOK, gin.H{"message": "Get top rated trainers endpoint", "limit": limit})
}
