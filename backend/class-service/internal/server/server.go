package server

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"

	"github.com/FurkanArikk/fitness-center/backend/class-service/internal/config"
	"github.com/FurkanArikk/fitness-center/backend/class-service/internal/handler"
	"github.com/FurkanArikk/fitness-center/backend/class-service/internal/repository/postgres"
)

// Server represents the HTTP server
type Server struct {
	db     *sql.DB
	router *gin.Engine
	config config.Config
}

// NewServer creates a new server with the given config
func NewServer(cfg config.Config) (*Server, error) {
	// Connect to the database
	db, err := postgres.NewPostgresDB(cfg.Database)
	if err != nil {
		return nil, fmt.Errorf("failed to initialize database: %w", err)
	}

	// Create router
	router := gin.Default()

	// Create server
	server := &Server{
		db:     db,
		router: router,
		config: cfg,
	}

	// Set up routes
	server.setupRoutes()

	return server, nil
}

// setupRoutes configures all routes and middleware
func (s *Server) setupRoutes() {
	// Add health check endpoint
	s.router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":  "up",
			"service": "class-service",
			"time":    time.Now().Format(time.RFC3339),
		})
	})

	// Create handler dependencies
	h := handler.NewHandler(s.db)

	// Setup routes using the handler
	h.SetupRoutes(s.router)
}

// Start begins listening for requests
func (s *Server) Start() error {
	// Create server
	srv := &http.Server{
		Addr:    fmt.Sprintf(":%d", s.config.Server.Port),
		Handler: s.router,
	}

	// Graceful shutdown
	go func() {
		// Listen for signals
		quit := make(chan os.Signal, 1)
		signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
		<-quit
		log.Println("Shutting down server...")

		// Create shutdown context
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()

		// Shutdown the server
		if err := srv.Shutdown(ctx); err != nil {
			log.Fatalf("Server forced to shutdown: %v", err)
		}

		// Close the database connection
		if err := s.db.Close(); err != nil {
			log.Fatalf("Error closing database connection: %v", err)
		}
	}()

	// Start server
	log.Printf("Server listening on port %d", s.config.Server.Port)
	if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		return fmt.Errorf("failed to start server: %w", err)
	}

	return nil
}
