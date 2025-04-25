package server

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/FurkanArikk/fitness-center/backend/staff-service/internal/handler"
	"github.com/gin-gonic/gin"
)

// Server represents the HTTP server
type Server struct {
	router     *gin.Engine
	httpServer *http.Server
}

// NewServer creates a new server instance
func NewServer(h *handler.Handler, port string) *Server {
	router := gin.Default()

	// Health check endpoint with standardized response format
	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"service": "staff-service",
			"status":  "up",
			"time":    time.Now().Format(time.RFC3339),
		})
	})

	// API routes
	api := router.Group("/api/v1")
	{
		// ...existing code...
	}

	srv := &Server{
		router: router,
		httpServer: &http.Server{
			Addr:    ":" + port,
			Handler: router,
		},
	}

	log.Printf("Server listening on port %s", port)
	return srv
}

// Start starts the HTTP server
func (s *Server) Start() error {
	// Start the server in a goroutine so that it doesn't block
	go func() {
		if err := s.httpServer.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Could not listen on %s: %v", s.httpServer.Addr, err)
		}
	}()

	return nil
}

// Shutdown gracefully shuts down the server
func (s *Server) Shutdown(ctx context.Context) error {
	log.Println("Server is shutting down...")

	// Shutdown the server with the given context
	if err := s.httpServer.Shutdown(ctx); err != nil {
		return err
	}

	log.Println("Server stopped")
	return nil
}

// WaitForShutdown waits for a signal to shutdown the server
func (s *Server) WaitForShutdown() {
	// Create a channel to receive OS signals
	sig := make(chan os.Signal, 1)
	signal.Notify(sig, syscall.SIGINT, syscall.SIGTERM)

	// Block until a signal is received
	received := <-sig
	log.Printf("Received signal %s, initiating shutdown", received)

	// Create a context with a timeout for the shutdown
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	// Shutdown the server
	if err := s.Shutdown(ctx); err != nil {
		log.Fatalf("Error during shutdown: %v", err)
	}
}
