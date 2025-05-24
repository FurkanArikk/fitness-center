package server

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/FurkanArikk/fitness-center/backend/class-service/internal/config"
	"github.com/FurkanArikk/fitness-center/backend/class-service/internal/handler"
	"github.com/gin-gonic/gin"
)

// Server represents the HTTP server
type Server struct {
	router     *gin.Engine
	httpServer *http.Server
}

// NewServer creates a new server instance
func NewServer(cfg *config.Config, h *handler.Handler) *Server {
	router := gin.Default()

	// Add middleware
	router.Use(corsMiddleware())
	router.Use(contentTypeMiddleware())
	router.Use(loggingMiddleware())

	// Set up routes using the function from router.go
	setupRoutes(router, h)

	srv := &Server{
		router: router,
		httpServer: &http.Server{
			Addr:         fmt.Sprintf(":%d", cfg.Server.Port),
			Handler:      router,
			ReadTimeout:  cfg.Server.ReadTimeout,
			WriteTimeout: cfg.Server.WriteTimeout,
			IdleTimeout:  cfg.Server.IdleTimeout,
		},
	}

	return srv
}

// Start starts the HTTP server
func (s *Server) Start() error {
	log.Printf("Server listening on port %s", s.httpServer.Addr[1:])
	return s.httpServer.ListenAndServe()
}

// Shutdown gracefully shuts down the server
func (s *Server) Shutdown() error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	return s.httpServer.Shutdown(ctx)
}

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
