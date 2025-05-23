package handler

import (
	"net/http"
	"strconv"

	"github.com/FurkanArikk/fitness-center/backend/staff-service/internal/model"
	"github.com/gin-gonic/gin"
)

// GetAll returns all trainers, optionally filtered by specialization
func (h *TrainerHandler) GetAll(c *gin.Context) {
	// Check for specialization filter
	specialization := c.Query("specialization")

	// Parse pagination parameters
	params := ParsePaginationParams(c)
	var err error

	if specialization != "" {
		// If specialization is provided, use the specialized method
		// Note: We would need to implement pagination for specialized search too,
		// but for now we'll keep specialization without pagination
		trainers, err := h.service.GetBySpecialization(specialization)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		// Return an empty array instead of null when no trainers are found
		if trainers == nil {
			trainers = []model.Trainer{}
		}

		c.JSON(http.StatusOK, trainers)
		return
	}

	// Check if pagination is requested
	if params.IsPagined {
		// Paginated response
		trainers, totalCount, err := h.service.GetAllPaginated(params.Offset, params.PageSize)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		// Return an empty array instead of null when no trainers are found
		if trainers == nil {
			trainers = []model.Trainer{}
		}

		response := CreatePaginatedResponse(trainers, params, totalCount)

		c.JSON(http.StatusOK, response)
		return
	}

	// Non-paginated response (backward compatibility)
	trainers, err := h.service.GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Return an empty array instead of null when no trainers are found
	if trainers == nil {
		trainers = []model.Trainer{}
	}

	c.JSON(http.StatusOK, trainers)
}

// GetByID returns a specific trainer
func (h *TrainerHandler) GetByID(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid trainer ID"})
		return
	}

	trainer, err := h.service.GetByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, trainer)
}

// Create creates a new trainer
func (h *TrainerHandler) Create(c *gin.Context) {
	var trainer model.Trainer
	if err := c.ShouldBindJSON(&trainer); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	result, err := h.service.Create(&trainer)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, result)
}

// Update updates an existing trainer
func (h *TrainerHandler) Update(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid trainer ID"})
		return
	}

	var trainer model.Trainer
	if err := c.ShouldBindJSON(&trainer); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	trainer.TrainerID = id

	result, err := h.service.Update(&trainer)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, result)
}

// Delete deletes a trainer
func (h *TrainerHandler) Delete(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid trainer ID"})
		return
	}

	if err := h.service.Delete(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Trainer deactivated successfully"})
}

// GetBySpecialization returns trainers filtered by specialization
func (h *TrainerHandler) GetBySpecialization(c *gin.Context) {
	specialization := c.Param("spec")
	if specialization == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Specialization parameter is required"})
		return
	}

	trainers, err := h.service.GetBySpecialization(specialization)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Return an empty array instead of null when no trainers are found
	if trainers == nil {
		trainers = []model.Trainer{}
	}

	c.JSON(http.StatusOK, trainers)
}

// GetTopRated returns the top rated trainers
func (h *TrainerHandler) GetTopRated(c *gin.Context) {
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "5"))

	trainers, err := h.service.GetTopRated(limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, trainers)
}
