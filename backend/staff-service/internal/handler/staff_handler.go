package handler

import (
	"fmt"
	"net/http"
	"strconv"

	"github.com/FurkanArikk/fitness-center/backend/staff-service/pkg/dto"
	"github.com/gin-gonic/gin"
)

// GetAll returns all staff records
func (h *StaffHandler) GetAll(c *gin.Context) {
	staff, err := h.service.GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Convert to response DTOs
	response := dto.StaffListFromModel(staff)
	c.JSON(http.StatusOK, response)
}

// GetByID returns a specific staff member
func (h *StaffHandler) GetByID(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid staff ID"})
		return
	}

	staff, err := h.service.GetByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	// Convert to response DTO
	response := dto.StaffFromModel(staff)
	c.JSON(http.StatusOK, response)
}

// Create creates a new staff member
func (h *StaffHandler) Create(c *gin.Context) {
	var staffRequest dto.StaffRequest

	if err := c.ShouldBindJSON(&staffRequest); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Convert DTO to model
	staffModel, err := staffRequest.ToModel()
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Invalid date format: %s", err.Error())})
		return
	}

	// Call service to create staff
	newStaff, err := h.service.Create(staffModel)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Convert model back to response DTO
	response := dto.StaffFromModel(newStaff)
	c.JSON(http.StatusCreated, response)
}

// Update updates an existing staff member
func (h *StaffHandler) Update(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid staff ID"})
		return
	}

	var staffRequest dto.StaffRequest

	if err := c.ShouldBindJSON(&staffRequest); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Convert DTO to model
	staffModel, err := staffRequest.ToModel()
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Invalid date format: %s", err.Error())})
		return
	}

	// Set the ID for the update operation
	staffModel.StaffID = id

	// Now pass the model object to the service
	updatedStaff, err := h.service.Update(staffModel)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Convert model back to response DTO
	response := dto.StaffFromModel(updatedStaff)
	c.JSON(http.StatusOK, response)
}

// Delete deletes a staff member
func (h *StaffHandler) Delete(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid staff ID"})
		return
	}

	if err := h.service.Delete(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Staff member status updated to Terminated"})
}
