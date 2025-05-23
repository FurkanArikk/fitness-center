package handler

import (
	"net/http"
	"strconv"

	"github.com/FurkanArikk/fitness-center/backend/staff-service/pkg/dto"
	"github.com/gin-gonic/gin"
)

// GetAll returns all qualifications
func (h *QualificationHandler) GetAll(c *gin.Context) {
	// Parse pagination parameters
	params := ParsePaginationParams(c)
	var err error

	if params.IsPagined {
		// Paginated response
		qualifications, totalCount, err := h.service.GetAllPaginated(params.Offset, params.PageSize)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		// Convert models to response DTOs
		qualificationsDTO := dto.QualificationsFromModel(qualifications)
		response := CreatePaginatedResponse(qualificationsDTO, params, totalCount)

		c.JSON(http.StatusOK, response)
		return
	}

	// Non-paginated response (backward compatibility)
	qualifications, err := h.service.GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Convert models to response DTOs
	response := dto.QualificationsFromModel(qualifications)
	c.JSON(http.StatusOK, response)
}

// GetByID returns a specific qualification
func (h *QualificationHandler) GetByID(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid qualification ID"})
		return
	}

	qualification, err := h.service.GetByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	// Convert model to response DTO
	response := dto.QualificationFromModel(qualification)
	c.JSON(http.StatusOK, response)
}

// GetByStaffID returns all qualifications for a staff member
func (h *QualificationHandler) GetByStaffID(c *gin.Context) {
	staffID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid staff ID"})
		return
	}

	// Parse pagination parameters
	params := ParsePaginationParams(c)

	if params.IsPagined {
		// Paginated response
		qualifications, totalCount, err := h.service.GetByStaffIDPaginated(staffID, params.Offset, params.PageSize)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		// Convert models to response DTOs
		qualificationsDTO := dto.QualificationsFromModel(qualifications)
		response := CreatePaginatedResponse(qualificationsDTO, params, totalCount)

		c.JSON(http.StatusOK, response)
		return
	}

	// Non-paginated response (backward compatibility)
	qualifications, err := h.service.GetByStaffID(staffID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Convert models to response DTOs
	response := dto.QualificationsFromModel(qualifications)
	c.JSON(http.StatusOK, response)
}

// Create creates a new qualification
func (h *QualificationHandler) Create(c *gin.Context) {
	var request dto.QualificationRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Convert DTO to model
	qualification, err := request.ToModel()
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	result, err := h.service.Create(qualification)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Convert model to response DTO
	response := dto.QualificationFromModel(result)
	c.JSON(http.StatusCreated, response)
}

// Update updates an existing qualification
func (h *QualificationHandler) Update(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid qualification ID"})
		return
	}

	// First get the existing qualification
	existingQualification, err := h.service.GetByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Qualification not found"})
		return
	}

	// Use QualificationUpdateRequest DTO for partial updates
	var updateRequest dto.QualificationUpdateRequest

	if err := c.ShouldBindJSON(&updateRequest); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Convert update DTO to model
	qualification, err := updateRequest.ToModel(existingQualification)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	result, err := h.service.Update(qualification)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Convert model to response DTO
	response := dto.QualificationFromModel(result)
	c.JSON(http.StatusOK, response)
}

// Delete deletes a qualification
func (h *QualificationHandler) Delete(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid qualification ID"})
		return
	}

	if err := h.service.Delete(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Qualification deleted successfully"})
}
