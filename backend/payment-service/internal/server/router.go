package server

import (
	"time"

	"github.com/furkan/fitness-center/backend/payment-service/internal/handler"
	"github.com/gin-gonic/gin"
)

// setupRoutes configures all API routes for the payment service
func setupRoutes(router *gin.Engine, handler *handler.Handler) {
	// Health check endpoint
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "up",
			"service": "payment-service",
			"time":    time.Now().Format(time.RFC3339),
		})
	})

	// API v1 routes
	api := router.Group("/api/v1")

	// Payment routes
	payments := api.Group("/payments")
	{
		payments.POST("", handler.CreatePayment)
		payments.GET("", handler.ListPayments)
		payments.GET("/:id", handler.GetPayment)
		payments.PUT("/:id", handler.UpdatePayment)
		payments.DELETE("/:id", handler.DeletePayment)
		payments.GET("/member/:memberID", handler.ListPaymentsByMember)
		payments.GET("/status/:status", handler.ListPaymentsByStatus)
		payments.GET("/method/:method", handler.ListPaymentsByMethod)
		payments.GET("/type/:typeID", handler.ListPaymentsByType)
		payments.GET("/statistics", handler.GetPaymentStatistics)
	}

	// Payment Type routes
	paymentTypes := api.Group("/payment-types")
	{
		paymentTypes.POST("", handler.CreatePaymentType)
		paymentTypes.GET("", handler.ListPaymentTypes)
		paymentTypes.GET("/:id", handler.GetPaymentType)
		paymentTypes.PUT("/:id", handler.UpdatePaymentType)
		paymentTypes.DELETE("/:id", handler.DeletePaymentType)
		paymentTypes.PUT("/:id/status", handler.TogglePaymentTypeStatus)
	}

	// Transaction routes
	transactions := api.Group("/transactions")
	{
		transactions.POST("", handler.CreateTransaction)
		transactions.GET("", handler.ListTransactions)
		transactions.GET("/:id", handler.GetTransaction)
		transactions.PUT("/:id", handler.UpdateTransaction)
		transactions.DELETE("/:id", handler.DeleteTransaction)
		transactions.GET("/payment/:paymentID", handler.ListTransactionsByPayment)
		transactions.GET("/status/:status", handler.ListTransactionsByStatus)
		transactions.POST("/process", handler.ProcessPayment)
	}
}
