package server

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/fitness-center/staff-service/internal/config"
	"github.com/fitness-center/staff-service/internal/handler"
)

// Server represents the HTTP server
type Server struct {
	httpServer *http.Server
	router     *Router
	logger     *log.Logger
}

// NewServer creates a new HTTP server with the provided router
func NewServer(cfg config.ServerConfig, staffHandler *handler.StaffHandler, qualificationHandler *handler.QualificationHandler,
	trainerHandler *handler.TrainerHandler, trainingHandler *handler.TrainingHandler) *Server {

	// Create a logger
	logger := log.New(os.Stdout, "[SERVER] ", log.LstdFlags)

	// Create a router
	router := NewRouter(staffHandler, qualificationHandler, trainerHandler, trainingHandler)

	// Create an HTTP server
	httpServer := &http.Server{
		Addr:         fmt.Sprintf(":%d", cfg.Port),
		Handler:      router,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	return &Server{
		httpServer: httpServer,
		router:     router,
		logger:     logger,
	}
}

// Start starts the HTTP server
func (s *Server) Start() error {
	// Start the server in a goroutine so that it doesn't block
	go func() {
		s.logger.Printf("Starting server on %s", s.httpServer.Addr)
		if err := s.httpServer.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			s.logger.Fatalf("Could not listen on %s: %v", s.httpServer.Addr, err)
		}
	}()

	return nil
}

// Shutdown gracefully shuts down the server
func (s *Server) Shutdown(ctx context.Context) error {
	s.logger.Println("Server is shutting down...")

	// Shutdown the server with the given context
	if err := s.httpServer.Shutdown(ctx); err != nil {
		return fmt.Errorf("server shutdown failed: %v", err)
	}

	s.logger.Println("Server stopped")
	return nil
}

// WaitForShutdown waits for a signal to shutdown the server
func (s *Server) WaitForShutdown() {
	// Create a channel to receive OS signals
	sig := make(chan os.Signal, 1)
	signal.Notify(sig, syscall.SIGINT, syscall.SIGTERM)

	// Block until a signal is received
	received := <-sig
	s.logger.Printf("Received signal %s, initiating shutdown", received)

	// Create a context with a timeout for the shutdown
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	// Shutdown the server
	if err := s.Shutdown(ctx); err != nil {
		s.logger.Fatalf("Error during shutdown: %v", err)
	}
}
