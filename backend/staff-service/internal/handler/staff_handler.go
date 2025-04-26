package handler

import (
	"net/http"
	"strconv"

	"github.com/FurkanArikk/fitness-center/backend/staff-service/internal/model"
	"github.com/gin-gonic/gin"
)

// GetAll returns all staff records
func (h *StaffHandler) GetAll(c *gin.Context) {
	staff, err := h.service.GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, staff)
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

	c.JSON(http.StatusOK, staff)
}

// Create creates a new staff member
func (h *StaffHandler) Create(c *gin.Context) {
	var staff struct {
		FirstName string  `json:"firstName" binding:"required"`
		LastName  string  `json:"lastName" binding:"required"`
		Email     string  `json:"email" binding:"required,email"`
		Phone     string  `json:"phone"`
		Address   string  `json:"address"`
		Position  string  `json:"position" binding:"required"`
		HireDate  string  `json:"hireDate"`
		Salary    float64 `json:"salary"`
		Status    string  `json:"status"`
	}

	if err := c.ShouldBindJSON(&staff); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Convert to model and call service
	// This is simplified - you'd need to convert the struct properly
	newStaff, err := h.service.Create(nil) // Replace with proper conversion
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, newStaff)
}

// Update updates an existing staff member
func (h *StaffHandler) Update(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid staff ID"})
		return
	}

	var staffRequest struct {
		FirstName string  `json:"firstName"`
		LastName  string  `json:"lastName"`
		Email     string  `json:"email"`
		Phone     string  `json:"phone"`
		Address   string  `json:"address"`
		Position  string  `json:"position"`
		HireDate  string  `json:"hireDate"`
		Salary    float64 `json:"salary"`
		Status    string  `json:"status"`
	}

	if err := c.ShouldBindJSON(&staffRequest); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Create a proper staff model to pass to the service
	staffModel := &model.Staff{
		StaffID:   id, // Changed from ID to StaffID
		FirstName: staffRequest.FirstName,
		LastName:  staffRequest.LastName,
		Email:     staffRequest.Email,
		Phone:     staffRequest.Phone,
		Address:   staffRequest.Address,
		Position:  staffRequest.Position,
		// Convert HireDate from string to time.Time if needed
		Salary: staffRequest.Salary,
		Status: staffRequest.Status,
	}

	// Now pass the model object to the service
	updatedStaff, err := h.service.Update(staffModel)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, updatedStaff)
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

	c.JSON(http.StatusOK, gin.H{"message": "Staff member deleted successfully"})
}
