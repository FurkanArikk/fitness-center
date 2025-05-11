package handler

import (
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

// HealthCheck handles health check requests by checking database connectivity
func (h *Handler) HealthCheck(c *gin.Context) {
	// Create a timeout context
	ctx, cancel := context.WithTimeout(c.Request.Context(), 3*time.Second)
	defer cancel()

	// Check database connectivity
	dbStatus := "up"
	if err := h.repo.Ping(ctx); err != nil {
		dbStatus = "down"
	}

	// Determine overall status
	overallStatus := "up"
	if dbStatus == "down" {
		overallStatus = "degraded"
		c.JSON(http.StatusServiceUnavailable, gin.H{
			"status":    overallStatus,
			"service":   "facility-service",
			"time":      time.Now().Format(time.RFC3339),
			"database":  dbStatus,
			"message":   "Service is running but database is unavailable",
			"timestamp": time.Now().Unix(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":    overallStatus,
		"service":   "facility-service",
		"time":      time.Now().Format(time.RFC3339),
		"database":  dbStatus,
		"message":   "Service is healthy",
		"timestamp": time.Now().Unix(),
	})
}
