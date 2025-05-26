package handler

import (
	"net/http"
	"strconv"

	"github.com/FurkanArikk/fitness-center/backend/class-service/pkg/dto"
	"github.com/gin-gonic/gin"
)

// GetClasses handles GET /classes
func (h *ClassHandler) GetClasses(c *gin.Context) {
	activeOnly := true // Default to showing only active classes
	if status := c.Query("status"); status == "all" {
		activeOnly = false
	}

	// Parse pagination parameters
	params := ParsePaginationParams(c)

	classes, total, err := h.service.GetClassesPaginated(c.Request.Context(), activeOnly, params.Offset, params.PageSize)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Convert model.Class to dto.ClassResponse
	dtoClasses := dto.ClassResponseListFromModel(classes)

	response := CreatePaginatedResponse(dtoClasses, params, total)
	c.JSON(http.StatusOK, response)
}

// GetClassByID handles GET /classes/:id
func (h *ClassHandler) GetClassByID(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid class ID"})
		return
	}

	class, err := h.service.GetClassByID(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Class not found"})
		return
	}

	// Convert model.Class to dto.ClassResponse
	dtoClass := dto.ClassResponseFromModel(class)

	c.JSON(http.StatusOK, gin.H{
		"data": dtoClass,
	})
}

// CreateClass handles POST /classes
func (h *ClassHandler) CreateClass(c *gin.Context) {
	var req dto.ClassCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Convert DTO to model
	modelReq := req.ToModel()

	class, err := h.service.CreateClass(c.Request.Context(), modelReq)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Convert model.Class to dto.ClassResponse
	dtoClass := dto.ClassResponseFromModel(class)

	c.JSON(http.StatusCreated, gin.H{
		"data":    dtoClass,
		"message": "Class created successfully",
	})
}

// UpdateClass handles PUT /classes/:id
func (h *ClassHandler) UpdateClass(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid class ID"})
		return
	}

	var req dto.ClassUpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Convert DTO to model
	modelReq := req.ToModel()

	class, err := h.service.UpdateClass(c.Request.Context(), id, modelReq)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Convert model.Class to dto.ClassResponse
	dtoClass := dto.ClassResponseFromModel(class)

	c.JSON(http.StatusOK, gin.H{
		"data":    dtoClass,
		"message": "Class updated successfully",
	})
}

// DeleteClass handles DELETE /classes/:id
func (h *ClassHandler) DeleteClass(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid class ID"})
		return
	}

	err = h.service.DeleteClass(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Class deleted successfully",
	})
}
