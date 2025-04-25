package server

import (
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

// corsMiddleware adds CORS headers to responses
func corsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusOK)
			return
		}

		c.Next()
	}
}

// contentTypeMiddleware sets the default content type for API responses
func contentTypeMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Content-Type", "application/json")
		c.Next()
	}
}

// loggingMiddleware logs requests with timing information
func loggingMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()

		// Process request
		c.Next()

		// Log after request is processed
		duration := time.Since(start)
		method := c.Request.Method
		path := c.Request.URL.Path
		statusCode := c.Writer.Status()

		log.Printf("%s %s %d completed in %v", method, path, statusCode, duration)
	}
}
