package handler

import (
	"net/http"
	"strconv"

	"github.com/furkan/fitness-center/backend/facility-service/pkg/dto"
	"github.com/gin-gonic/gin"
)

// CreateFacility handles facility creation
func (h *Handler) CreateFacility(c *gin.Context) {
	var facilityReq dto.FacilityCreateRequest
	if err := c.ShouldBindJSON(&facilityReq); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Convert DTO to model
	facility, err := facilityReq.ToModel()
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	createdFacility, err := h.repo.Facility().Create(c.Request.Context(), &facility)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Convert model to response DTO
	response := dto.FacilityResponseFromModel(*createdFacility)
	c.JSON(http.StatusCreated, response)
}

// GetFacility retrieves facility by ID
func (h *Handler) GetFacility(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid facility ID"})
		return
	}

	facility, err := h.repo.Facility().GetByID(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Facility not found"})
		return
	}

	// Convert model to response DTO
	response := dto.FacilityResponseFromModel(*facility)
	c.JSON(http.StatusOK, response)
}

// UpdateFacility handles facility update
func (h *Handler) UpdateFacility(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid facility ID"})
		return
	}

	var facilityReq dto.FacilityUpdateRequest
	if err := c.ShouldBindJSON(&facilityReq); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Convert DTO to model
	facility, err := facilityReq.ToModel()
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	facility.FacilityID = id

	updatedFacility, err := h.repo.Facility().Update(c.Request.Context(), &facility)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Convert model to response DTO
	response := dto.FacilityResponseFromModel(*updatedFacility)
	c.JSON(http.StatusOK, response)
}

// DeleteFacility handles facility deletion
func (h *Handler) DeleteFacility(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid facility ID"})
		return
	}

	if err := h.repo.Facility().Delete(c.Request.Context(), id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Facility deleted successfully"})
}

// ListFacilities handles listing all facilities with pagination
func (h *Handler) ListFacilities(c *gin.Context) {
	page, err := strconv.Atoi(c.DefaultQuery("page", "1"))
	if err != nil || page < 1 {
		page = 1
	}

	pageSize, err := strconv.Atoi(c.DefaultQuery("pageSize", "10"))
	if err != nil || pageSize < 1 {
		pageSize = 10
	}

	facilities, total, err := h.repo.Facility().List(c.Request.Context(), map[string]interface{}{}, page, pageSize)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Convert model list to response DTO list
	responseList := dto.FacilityResponseListFromModel(facilities)

	c.JSON(http.StatusOK, gin.H{
		"data":       responseList,
		"page":       page,
		"pageSize":   pageSize,
		"totalItems": total,
		"totalPages": (total + pageSize - 1) / pageSize,
	})
}

// ListFacilitiesByStatus handles listing facilities by status
func (h *Handler) ListFacilitiesByStatus(c *gin.Context) {
	status := c.Param("status")
	page, err := strconv.Atoi(c.DefaultQuery("page", "1"))
	if err != nil || page < 1 {
		page = 1
	}

	pageSize, err := strconv.Atoi(c.DefaultQuery("pageSize", "10"))
	if err != nil || pageSize < 1 {
		pageSize = 10
	}

	facilities, total, err := h.repo.Facility().ListByStatus(c.Request.Context(), status, page, pageSize)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":       facilities,
		"page":       page,
		"pageSize":   pageSize,
		"totalItems": total,
		"totalPages": (total + pageSize - 1) / pageSize,
	})
}
