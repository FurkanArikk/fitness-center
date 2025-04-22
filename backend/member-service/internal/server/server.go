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

	"github.com/FurkanArikk/fitness-center/backend/member-service/internal/handler"
	"github.com/FurkanArikk/fitness-center/backend/member-service/internal/repository/postgres"
	"github.com/FurkanArikk/fitness-center/backend/member-service/internal/service"
	"github.com/gorilla/mux"
)

// Server represents the HTTP server for the member service
type Server struct {
	router  *mux.Router
	server  *http.Server
	handler *handler.Handler
}

// Config contains the server configuration
type Config struct {
	Port         string
	ReadTimeout  time.Duration
	WriteTimeout time.Duration
	IdleTimeout  time.Duration
}

// NewServer creates a new server instance
func NewServer(db *sql.DB, config Config) *Server {
	// Create repositories
	memberRepo := postgres.NewMemberRepository(db)
	membershipRepo := postgres.NewMembershipRepository(db)
	benefitRepo := postgres.NewBenefitRepo(db)
	memberMembershipRepo := postgres.NewMemberMembershipRepo(db)
	assessmentRepo := postgres.NewFitnessAssessmentRepo(db)

	// Create services
	memberService := service.NewMemberService(memberRepo)
	membershipService := service.NewMembershipService(membershipRepo)
	benefitService := service.NewBenefitService(benefitRepo)
	memberMembershipService := service.NewMemberMembershipService(memberMembershipRepo)
	assessmentService := service.NewAssessmentService(assessmentRepo)

	// Create handler
	h := handler.NewHandler(
		memberService,
		membershipService,
		memberMembershipService,
		benefitService,
		assessmentService,
	)

	// Setup router with routes
	router := SetupRoutes(h)

	// Add middleware
	router.Use(requestLoggingMiddleware)

	// Create HTTP server
	srv := &http.Server{
		Addr:         fmt.Sprintf(":%s", config.Port),
		Handler:      router,
		ReadTimeout:  config.ReadTimeout,
		WriteTimeout: config.WriteTimeout,
		IdleTimeout:  config.IdleTimeout,
	}

	return &Server{
		router:  router,
		server:  srv,
		handler: h,
	}
}

// Start starts the HTTP server
func (s *Server) Start() error {
	// Start server in a goroutine to not block
	go func() {
		log.Printf("Starting server on %s", s.server.Addr)
		if err := s.server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Error starting server: %v", err)
		}
	}()

	return s.waitForShutdown()
}

// waitForShutdown waits for a signal to gracefully shutdown the server
func (s *Server) waitForShutdown() error {
	// Create channel to listen for signals
	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt, syscall.SIGTERM)

	// Block until a signal is received
	<-stop

	// Create a deadline for server shutdown
	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	log.Println("Shutting down server...")
	if err := s.server.Shutdown(ctx); err != nil {
		return fmt.Errorf("error shutting down server: %w", err)
	}

	log.Println("Server gracefully stopped")
	return nil
}

// requestLoggingMiddleware logs HTTP requests
func requestLoggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		startTime := time.Now()
		next.ServeHTTP(w, r)
		log.Printf(
			"%s %s %s %s",
			r.Method,
			r.RequestURI,
			r.RemoteAddr,
			time.Since(startTime),
		)
	})
}
