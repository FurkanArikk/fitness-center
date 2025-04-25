package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// GetAll returns all staff records
func (h *StaffHandler) GetAll(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Get all staff endpoint"})
}

// GetByID returns a specific staff member
func (h *StaffHandler) GetByID(c *gin.Context) {
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	c.JSON(http.StatusOK, gin.H{"message": "Get staff by ID endpoint", "id": id})
}

// Create creates a new staff member
func (h *StaffHandler) Create(c *gin.Context) {
	c.JSON(http.StatusCreated, gin.H{"message": "Create staff endpoint"})
}

// Update updates an existing staff member
func (h *StaffHandler) Update(c *gin.Context) {
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	c.JSON(http.StatusOK, gin.H{"message": "Update staff endpoint", "id": id})
}

// Delete deletes a staff member
func (h *StaffHandler) Delete(c *gin.Context) {
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	c.JSON(http.StatusOK, gin.H{"message": "Delete staff endpoint", "id": id})
}
