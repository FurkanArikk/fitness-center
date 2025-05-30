package server

import (
	"context"
	"log"
	"net/http"
	"time"

	"github.com/FurkanArikk/fitness-center/backend/payment-service/internal/handler"
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

	// Setup all routes
	setupRoutes(router, h)

	srv := &Server{
		router: router,
		httpServer: &http.Server{
			Addr:         ":" + port,
			Handler:      router,
			ReadTimeout:  15 * time.Second,
			WriteTimeout: 15 * time.Second,
			IdleTimeout:  60 * time.Second,
		},
	}

	return srv
}

// Start starts the HTTP server
func (s *Server) Start() error {
	log.Printf("Payment service listening on port %s", s.httpServer.Addr[1:])
	return s.httpServer.ListenAndServe()
}

// Shutdown gracefully shuts down the server
func (s *Server) Shutdown(ctx context.Context) error {
	return s.httpServer.Shutdown(ctx)
}
