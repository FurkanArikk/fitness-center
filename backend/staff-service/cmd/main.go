package main

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

	"github.com/gorilla/mux"
	_ "github.com/lib/pq"

	"github.com/fitness-center/staff-service/internal/config"
	"github.com/fitness-center/staff-service/internal/handler"
	"github.com/fitness-center/staff-service/internal/repository"
	"github.com/fitness-center/staff-service/internal/service"
)

func main() {
	// Load configuration
	cfg := config.LoadConfig()

	// Set up logger
	logger := log.New(os.Stdout, "[STAFF-SERVICE] ", log.LstdFlags)

	// Connect to database
	db, err := sql.Open("postgres", cfg.Database.GetDSN())
	if err != nil {
		logger.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	// Check database connection
	if err := db.Ping(); err != nil {
		logger.Fatalf("Failed to ping database: %v", err)
	}
	logger.Println("Connected to database successfully")

	// Create repositories
	staffRepo := repository.NewStaffRepository(db)
	qualificationRepo := repository.NewQualificationRepository(db)
	trainerRepo := repository.NewTrainerRepository(db)
	trainingRepo := repository.NewPersonalTrainingRepository(db)

	// Create services
	staffService := service.NewStaffService(staffRepo)
	qualificationService := service.NewQualificationService(qualificationRepo)
	trainerService := service.NewTrainerService(trainerRepo, staffRepo)
	trainingService := service.NewPersonalTrainingService(trainingRepo, trainerRepo)

	// Create handlers
	staffHandler := handler.NewStaffHandler(staffService)
	qualificationHandler := handler.NewQualificationHandler(qualificationService)
	trainerHandler := handler.NewTrainerHandler(trainerService)
	trainingHandler := handler.NewTrainingHandler(trainingService)

	// Create router
	router := mux.NewRouter()
	router.Use(loggingMiddleware(logger))

	// Register API routes with router
	apiRouter := router.PathPrefix("/api/v1").Subrouter()
	handler.RegisterHandlers(apiRouter, staffHandler, qualificationHandler, trainerHandler, trainingHandler)

	// Add health check endpoint
	router.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("OK"))
	})

	// Set up HTTP server
	server := &http.Server{
		Addr:         fmt.Sprintf(":%d", cfg.Server.Port),
		Handler:      router,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Start server in a goroutine
	go func() {
		logger.Printf("Starting server on port %d", cfg.Server.Port)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			logger.Fatalf("Failed to start server: %v", err)
		}
	}()

	// Wait for interrupt signal to gracefully shut down the server
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	logger.Println("Shutting down server...")

	// Create a deadline to wait for
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	// Doesn't block if no connections, but will otherwise wait until the timeout
	if err := server.Shutdown(ctx); err != nil {
		logger.Fatalf("Server forced to shutdown: %v", err)
	}

	logger.Println("Server exiting")
}

// Middleware for logging HTTP requests
func loggingMiddleware(logger *log.Logger) mux.MiddlewareFunc {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			start := time.Now()
			next.ServeHTTP(w, r)
			logger.Printf(
				"%s %s %s %s",
				r.Method,
				r.RequestURI,
				r.RemoteAddr,
				time.Since(start),
			)
		})
	}
}
