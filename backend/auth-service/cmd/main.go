package main

import (
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/FurkanArikk/fitness-center/backend/auth-service/internal/config"
	"github.com/FurkanArikk/fitness-center/backend/auth-service/internal/db"
	"github.com/FurkanArikk/fitness-center/backend/auth-service/internal/handler"
	"github.com/FurkanArikk/fitness-center/backend/auth-service/internal/repository"
	"github.com/FurkanArikk/fitness-center/backend/auth-service/internal/server"
	"github.com/FurkanArikk/fitness-center/backend/auth-service/internal/service"
)

func main() {
	// Set up logging
	log.SetFlags(log.LstdFlags | log.Lshortfile)
	log.Println("Starting auth service...")

	// Load configuration
	cfg := config.LoadConfig()
	log.Printf("Loaded configuration: server port=%d", cfg.Server.Port)

	// Initialize database connection
	database, err := db.NewPostgresDB(cfg.Database)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer database.Close()

	// Run migrations
	if err := database.RunMigrations(); err != nil {
		log.Fatalf("Failed to run migrations: %v", err)
	}

	// Initialize repositories
	repos := repository.NewRepositories(database.DB)

	// Initialize services
	authService := service.NewAuthService(cfg, repos)

	// Initialize default users
	if err := authService.InitializeDefaultUsers(); err != nil {
		log.Fatalf("Failed to initialize default users: %v", err)
	}

	// Initialize handlers
	handlers := handler.NewHandlers(authService)

	// Create and initialize server
	srv := server.NewServer(&cfg, handlers)

	// Handle graceful shutdown
	done := make(chan os.Signal, 1)
	signal.Notify(done, os.Interrupt, syscall.SIGINT, syscall.SIGTERM)

	// Start server in a goroutine
	go func() {
		if err := srv.Start(); err != nil {
			log.Fatalf("Failed to start server: %v", err)
		}
	}()

	log.Println("Auth service is running. Press Ctrl+C to stop.")

	// Wait for termination signal
	<-done
	log.Println("Auth service is shutting down...")
}
