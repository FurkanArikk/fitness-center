package server

import (
	"context"
	"log"
	"net/http"
	"time"

	"github.com/FurkanArikk/fitness-center/backend/member-service/internal/handler"
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

	// Configure all routes using the setupRoutes function
	setupRoutes(router, h)

	srv := &Server{
		router: router,
		httpServer: &http.Server{
			Addr:    ":" + port,
			Handler: router,
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
