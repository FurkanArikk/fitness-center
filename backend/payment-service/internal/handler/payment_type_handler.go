package handler

import (
	"net/http"
	"strconv"

	"github.com/furkan/fitness-center/backend/payment-service/internal/model"
	"github.com/gin-gonic/gin"
)

// CreatePaymentType handles payment type creation
func (h *Handler) CreatePaymentType(c *gin.Context) {
	var paymentType model.PaymentType
	if err := c.ShouldBindJSON(&paymentType); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	createdPaymentType, err := h.svc.PaymentType().Create(c.Request.Context(), &paymentType)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, createdPaymentType)
}

// GetPaymentType retrieves payment type by ID
func (h *Handler) GetPaymentType(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid payment type ID"})
		return
	}

	paymentType, err := h.svc.PaymentType().GetByID(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Payment type not found"})
		return
	}

	c.JSON(http.StatusOK, paymentType)
}

// UpdatePaymentType handles payment type update
func (h *Handler) UpdatePaymentType(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid payment type ID"})
		return
	}

	var paymentType model.PaymentType
	if err := c.ShouldBindJSON(&paymentType); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	paymentType.PaymentTypeID = id
	updatedPaymentType, err := h.svc.PaymentType().Update(c.Request.Context(), &paymentType)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, updatedPaymentType)
}

// DeletePaymentType handles payment type deletion
func (h *Handler) DeletePaymentType(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid payment type ID"})
		return
	}

	if err := h.svc.PaymentType().Delete(c.Request.Context(), id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Payment type deleted successfully"})
}

// ListPaymentTypes handles listing all payment types with pagination
func (h *Handler) ListPaymentTypes(c *gin.Context) {
	page, err := strconv.Atoi(c.DefaultQuery("page", "1"))
	if err != nil || page < 1 {
		page = 1
	}

	pageSize, err := strconv.Atoi(c.DefaultQuery("pageSize", "10"))
	if err != nil || pageSize < 1 {
		pageSize = 10
	}

	// Check if we should filter by active status
	var filter map[string]interface{}
	if activeStr := c.Query("active"); activeStr != "" {
		active := activeStr == "true"
		filter = map[string]interface{}{"is_active": active}
	} else {
		filter = map[string]interface{}{}
	}

	paymentTypes, total, err := h.svc.PaymentType().List(c.Request.Context(), filter, page, pageSize)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":       paymentTypes,
		"page":       page,
		"pageSize":   pageSize,
		"totalItems": total,
		"totalPages": (total + pageSize - 1) / pageSize,
	})
}

// TogglePaymentTypeStatus handles activating/deactivating a payment type
func (h *Handler) TogglePaymentTypeStatus(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid payment type ID"})
		return
	}

	var req struct {
		IsActive bool `json:"is_active"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.svc.PaymentType().ToggleStatus(c.Request.Context(), id, req.IsActive); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Payment type status updated successfully",
	})
}
