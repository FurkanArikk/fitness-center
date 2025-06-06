package handler

import (
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/FurkanArikk/fitness-center/backend/facility-service/pkg/dto"
	"github.com/gin-gonic/gin"
)

// CreateEquipment handles equipment creation
func (h *Handler) CreateEquipment(c *gin.Context) {
	var equipmentReq dto.EquipmentCreateRequest
	if err := c.ShouldBindJSON(&equipmentReq); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Convert DTO to model
	equipment := equipmentReq.ToModel()

	createdEquipment, err := h.repo.Equipment().Create(c.Request.Context(), &equipment)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Convert model to response DTO
	response := dto.EquipmentResponseFromModel(*createdEquipment)
	c.JSON(http.StatusCreated, response)
}

// GetEquipment retrieves equipment by ID
func (h *Handler) GetEquipment(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid equipment ID"})
		return
	}

	equipment, err := h.repo.Equipment().GetByID(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Equipment not found"})
		return
	}

	// Convert model to response DTO
	response := dto.EquipmentResponseFromModel(*equipment)
	c.JSON(http.StatusOK, response)
}

// UpdateEquipment handles equipment update
func (h *Handler) UpdateEquipment(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid equipment ID"})
		return
	}

	var equipmentReq dto.EquipmentUpdateRequest
	if err := c.ShouldBindJSON(&equipmentReq); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Convert DTO to model
	equipment := equipmentReq.ToModel()
	equipment.EquipmentID = id

	updatedEquipment, err := h.repo.Equipment().Update(c.Request.Context(), &equipment)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Convert model to response DTO
	response := dto.EquipmentResponseFromModel(*updatedEquipment)
	c.JSON(http.StatusOK, response)
}

// DeleteEquipment handles equipment deletion
func (h *Handler) DeleteEquipment(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid equipment ID"})
		return
	}

	if err := h.repo.Equipment().Delete(c.Request.Context(), id); err != nil {
		if strings.Contains(err.Error(), "not found") {
			c.JSON(http.StatusNotFound, gin.H{"error": "Equipment not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Equipment deleted successfully"})
}

// ListEquipment handles listing all equipment with pagination
func (h *Handler) ListEquipment(c *gin.Context) {
	page, err := strconv.Atoi(c.DefaultQuery("page", "1"))
	if err != nil || page < 1 {
		page = 1
	}

	pageSize, err := strconv.Atoi(c.DefaultQuery("pageSize", "10"))
	if err != nil || pageSize < 1 {
		pageSize = 10
	}

	equipment, total, err := h.repo.Equipment().List(c.Request.Context(), map[string]interface{}{}, page, pageSize)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Convert model list to response DTO list
	responseList := dto.EquipmentResponseListFromModel(equipment)

	c.JSON(http.StatusOK, gin.H{
		"data":       responseList,
		"page":       page,
		"pageSize":   pageSize,
		"totalItems": total,
		"totalPages": (total + pageSize - 1) / pageSize,
	})
}

// ListEquipmentByCategory handles listing equipment by category
func (h *Handler) ListEquipmentByCategory(c *gin.Context) {
	category := c.Param("category")
	page, err := strconv.Atoi(c.DefaultQuery("page", "1"))
	if err != nil || page < 1 {
		page = 1
	}

	pageSize, err := strconv.Atoi(c.DefaultQuery("pageSize", "10"))
	if err != nil || pageSize < 1 {
		pageSize = 10
	}

	equipment, total, err := h.repo.Equipment().ListByCategory(c.Request.Context(), category, page, pageSize)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":       equipment,
		"page":       page,
		"pageSize":   pageSize,
		"totalItems": total,
		"totalPages": (total + pageSize - 1) / pageSize,
	})
}

// ListEquipmentByStatus handles listing equipment by status
func (h *Handler) ListEquipmentByStatus(c *gin.Context) {
	status := c.Param("status")
	page, err := strconv.Atoi(c.DefaultQuery("page", "1"))
	if err != nil || page < 1 {
		page = 1
	}

	pageSize, err := strconv.Atoi(c.DefaultQuery("pageSize", "10"))
	if err != nil || pageSize < 1 {
		pageSize = 10
	}

	equipment, total, err := h.repo.Equipment().ListByStatus(c.Request.Context(), status, page, pageSize)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":       equipment,
		"page":       page,
		"pageSize":   pageSize,
		"totalItems": total,
		"totalPages": (total + pageSize - 1) / pageSize,
	})
}

// ListEquipmentByMaintenance handles listing equipment by maintenance date
func (h *Handler) ListEquipmentByMaintenance(c *gin.Context) {
	date := c.DefaultQuery("date", time.Now().Format("2006-01-02"))
	page, err := strconv.Atoi(c.DefaultQuery("page", "1"))
	if err != nil || page < 1 {
		page = 1
	}

	pageSize, err := strconv.Atoi(c.DefaultQuery("pageSize", "10"))
	if err != nil || pageSize < 1 {
		pageSize = 10
	}

	equipment, total, err := h.repo.Equipment().ListByMaintenanceDue(c.Request.Context(), date, page, pageSize)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":       equipment,
		"page":       page,
		"pageSize":   pageSize,
		"totalItems": total,
		"totalPages": (total + pageSize - 1) / pageSize,
	})
}
