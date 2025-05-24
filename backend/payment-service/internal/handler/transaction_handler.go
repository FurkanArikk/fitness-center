package handler

import (
	"net/http"
	"strconv"
	"time"

	"github.com/FurkanArikk/fitness-center/backend/payment-service/internal/model"
	"github.com/gin-gonic/gin"
)

// CreateTransaction handles transaction creation
func (h *Handler) CreateTransaction(c *gin.Context) {
	var transaction model.Transaction
	if err := c.ShouldBindJSON(&transaction); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Set transaction date if not provided
	if transaction.TransactionDate.IsZero() {
		transaction.TransactionDate = time.Now()
	}

	createdTransaction, err := h.svc.Transaction().Create(c.Request.Context(), &transaction)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, createdTransaction)
}

// GetTransaction retrieves transaction by ID
func (h *Handler) GetTransaction(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid transaction ID"})
		return
	}

	transaction, err := h.svc.Transaction().GetByID(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Transaction not found"})
		return
	}

	c.JSON(http.StatusOK, transaction)
}

// UpdateTransaction handles transaction update
func (h *Handler) UpdateTransaction(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid transaction ID"})
		return
	}

	var transaction model.Transaction
	if err := c.ShouldBindJSON(&transaction); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	transaction.TransactionID = id
	updatedTransaction, err := h.svc.Transaction().Update(c.Request.Context(), &transaction)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, updatedTransaction)
}

// DeleteTransaction handles transaction deletion
func (h *Handler) DeleteTransaction(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid transaction ID"})
		return
	}

	if err := h.svc.Transaction().Delete(c.Request.Context(), id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Transaction deleted successfully"})
}

// ListTransactions handles listing all transactions with pagination
func (h *Handler) ListTransactions(c *gin.Context) {
	page, err := strconv.Atoi(c.DefaultQuery("page", "1"))
	if err != nil || page < 1 {
		page = 1
	}

	pageSize, err := strconv.Atoi(c.DefaultQuery("pageSize", "10"))
	if err != nil || pageSize < 1 {
		pageSize = 10
	}

	transactions, total, err := h.svc.Transaction().List(c.Request.Context(), map[string]interface{}{}, page, pageSize)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":       transactions,
		"page":       page,
		"pageSize":   pageSize,
		"totalItems": total,
		"totalPages": (total + pageSize - 1) / pageSize,
	})
}

// ListTransactionsByPayment handles listing transactions by payment ID
func (h *Handler) ListTransactionsByPayment(c *gin.Context) {
	paymentID, err := strconv.Atoi(c.Param("paymentID"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid payment ID"})
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

	transactions, total, err := h.svc.Transaction().ListByPaymentID(c.Request.Context(), paymentID, page, pageSize)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":       transactions,
		"page":       page,
		"pageSize":   pageSize,
		"totalItems": total,
		"totalPages": (total + pageSize - 1) / pageSize,
	})
}

// ListTransactionsByStatus handles listing transactions by status
func (h *Handler) ListTransactionsByStatus(c *gin.Context) {
	status := c.Param("status")

	page, err := strconv.Atoi(c.DefaultQuery("page", "1"))
	if err != nil || page < 1 {
		page = 1
	}

	pageSize, err := strconv.Atoi(c.DefaultQuery("pageSize", "10"))
	if err != nil || pageSize < 1 {
		pageSize = 10
	}

	transactions, total, err := h.svc.Transaction().ListByStatus(c.Request.Context(), status, page, pageSize)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":       transactions,
		"page":       page,
		"pageSize":   pageSize,
		"totalItems": total,
		"totalPages": (total + pageSize - 1) / pageSize,
	})
}

// ProcessPayment handles payment processing
func (h *Handler) ProcessPayment(c *gin.Context) {
	var req struct {
		PaymentID            int    `json:"payment_id" binding:"required"`
		TransactionStatus    string `json:"transaction_status" binding:"required"`
		TransactionReference string `json:"transaction_reference"`
		GatewayResponse      string `json:"gateway_response"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	transaction, err := h.svc.Transaction().ProcessPayment(
		c.Request.Context(),
		req.PaymentID,
		req.TransactionStatus,
		req.TransactionReference,
		req.GatewayResponse,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, transaction)
}
