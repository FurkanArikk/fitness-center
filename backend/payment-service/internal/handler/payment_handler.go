package handler

import (
	"net/http"
	"strconv"
	"time"

	"github.com/FurkanArikk/fitness-center/backend/payment-service/internal/model"
	"github.com/FurkanArikk/fitness-center/backend/payment-service/pkg/dto"
	"github.com/gin-gonic/gin"
)

// CreatePayment handles payment creation
func (h *Handler) CreatePayment(c *gin.Context) {
	var paymentReq dto.PaymentRequest
	if err := c.ShouldBindJSON(&paymentReq); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Set payment date to now if not provided
	if paymentReq.PaymentDate.IsZero() {
		paymentReq.PaymentDate = time.Now()
	}

	// Convert DTO to model
	payment := dto.ConvertToPaymentModel(&paymentReq)

	createdPayment, err := h.svc.Payment().Create(c.Request.Context(), payment)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Convert model to response DTO
	response := dto.ConvertToPaymentResponse(createdPayment)
	c.JSON(http.StatusCreated, response)
}

// GetPayment retrieves payment by ID
func (h *Handler) GetPayment(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid payment ID"})
		return
	}

	payment, err := h.svc.Payment().GetByID(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Payment not found"})
		return
	}

	c.JSON(http.StatusOK, payment)
}

// UpdatePayment handles payment update
func (h *Handler) UpdatePayment(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid payment ID"})
		return
	}

	var payment model.Payment
	if err := c.ShouldBindJSON(&payment); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	payment.PaymentID = id
	updatedPayment, err := h.svc.Payment().Update(c.Request.Context(), &payment)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, updatedPayment)
}

// DeletePayment handles payment deletion
func (h *Handler) DeletePayment(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid payment ID"})
		return
	}

	if err := h.svc.Payment().Delete(c.Request.Context(), id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Payment deleted successfully"})
}

// ListPayments handles listing all payments with pagination
func (h *Handler) ListPayments(c *gin.Context) {
	page, err := strconv.Atoi(c.DefaultQuery("page", "1"))
	if err != nil || page < 1 {
		page = 1
	}

	pageSize, err := strconv.Atoi(c.DefaultQuery("pageSize", "10"))
	if err != nil || pageSize < 1 {
		pageSize = 10
	}

	payments, total, err := h.svc.Payment().List(c.Request.Context(), map[string]interface{}{}, page, pageSize)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":       payments,
		"page":       page,
		"pageSize":   pageSize,
		"totalItems": total,
		"totalPages": (total + pageSize - 1) / pageSize,
	})
}

// ListPaymentsByMember handles listing payments by member ID
func (h *Handler) ListPaymentsByMember(c *gin.Context) {
	memberID, err := strconv.Atoi(c.Param("memberID"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid member ID"})
		return
	}

	page, err := strconv.Atoi(c.DefaultQuery("page", "1"))
	if err != nil || page < 1 {
		page = 1
	}

	pageSize, err := strconv.Atoi(c.DefaultQuery("pageSize", "10"))
	if err != nil || pageSize < 1 {
		pageSize = 10
	}

	payments, total, err := h.svc.Payment().ListByMemberID(c.Request.Context(), memberID, page, pageSize)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":       payments,
		"page":       page,
		"pageSize":   pageSize,
		"totalItems": total,
		"totalPages": (total + pageSize - 1) / pageSize,
	})
}

// ListPaymentsByStatus handles listing payments by status
func (h *Handler) ListPaymentsByStatus(c *gin.Context) {
	status := c.Param("status")

	page, err := strconv.Atoi(c.DefaultQuery("page", "1"))
	if err != nil || page < 1 {
		page = 1
	}

	pageSize, err := strconv.Atoi(c.DefaultQuery("pageSize", "10"))
	if err != nil || pageSize < 1 {
		pageSize = 10
	}

	payments, total, err := h.svc.Payment().ListByStatus(c.Request.Context(), status, page, pageSize)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":       payments,
		"page":       page,
		"pageSize":   pageSize,
		"totalItems": total,
		"totalPages": (total + pageSize - 1) / pageSize,
	})
}

// ListPaymentsByMethod handles listing payments by payment method
func (h *Handler) ListPaymentsByMethod(c *gin.Context) {
	method := c.Param("method")

	page, err := strconv.Atoi(c.DefaultQuery("page", "1"))
	if err != nil || page < 1 {
		page = 1
	}

	pageSize, err := strconv.Atoi(c.DefaultQuery("pageSize", "10"))
	if err != nil || pageSize < 1 {
		pageSize = 10
	}

	payments, total, err := h.svc.Payment().ListByPaymentMethod(c.Request.Context(), method, page, pageSize)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":       payments,
		"page":       page,
		"pageSize":   pageSize,
		"totalItems": total,
		"totalPages": (total + pageSize - 1) / pageSize,
	})
}

// ListPaymentsByType handles listing payments by payment type
func (h *Handler) ListPaymentsByType(c *gin.Context) {
	typeID, err := strconv.Atoi(c.Param("typeID"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid payment type ID"})
		return
	}

	page, err := strconv.Atoi(c.DefaultQuery("page", "1"))
	if err != nil || page < 1 {
		page = 1
	}

	pageSize, err := strconv.Atoi(c.DefaultQuery("pageSize", "10"))
	if err != nil || pageSize < 1 {
		pageSize = 10
	}

	payments, total, err := h.svc.Payment().ListByPaymentType(c.Request.Context(), typeID, page, pageSize)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":       payments,
		"page":       page,
		"pageSize":   pageSize,
		"totalItems": total,
		"totalPages": (total + pageSize - 1) / pageSize,
	})
}

// GetPaymentStatistics handles retrieving payment statistics
func (h *Handler) GetPaymentStatistics(c *gin.Context) {
	// Parse optional query parameters
	memberID := c.Query("memberID")
	typeID := c.Query("typeID")
	startDate := c.Query("startDate")
	endDate := c.Query("endDate")

	// Create a filter map based on the provided parameters
	filter := make(map[string]interface{})
	if memberID != "" {
		memberIDInt, err := strconv.Atoi(memberID)
		if err == nil {
			filter["member_id"] = memberIDInt
		}
	}
	if typeID != "" {
		typeIDInt, err := strconv.Atoi(typeID)
		if err == nil {
			filter["payment_type_id"] = typeIDInt
		}
	}
	if startDate != "" {
		filter["start_date"] = startDate
	}
	if endDate != "" {
		filter["end_date"] = endDate
	}

	stats, err := h.svc.Payment().GetStatistics(c.Request.Context(), filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, stats)
}
