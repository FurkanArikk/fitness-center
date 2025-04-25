package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// GetAll returns all qualifications
func (h *QualificationHandler) GetAll(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Get all qualifications endpoint"})
}

// GetByID returns a specific qualification
func (h *QualificationHandler) GetByID(c *gin.Context) {
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	c.JSON(http.StatusOK, gin.H{"message": "Get qualification by ID endpoint", "id": id})
}

// GetByStaffID returns all qualifications for a specific staff member
func (h *QualificationHandler) GetByStaffID(c *gin.Context) {
	staffID, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	c.JSON(http.StatusOK, gin.H{"message": "Get qualifications by staff ID endpoint", "staffID": staffID})
}

// Create creates a new qualification
func (h *QualificationHandler) Create(c *gin.Context) {
	c.JSON(http.StatusCreated, gin.H{"message": "Create qualification endpoint"})
}

// Update updates an existing qualification
func (h *QualificationHandler) Update(c *gin.Context) {
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	c.JSON(http.StatusOK, gin.H{"message": "Update qualification endpoint", "id": id})
}

// Delete deletes a qualification
func (h *QualificationHandler) Delete(c *gin.Context) {
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	c.JSON(http.StatusOK, gin.H{"message": "Delete qualification endpoint", "id": id})
}
