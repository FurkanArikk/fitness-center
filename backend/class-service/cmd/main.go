package main

import (
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/FurkanArikk/fitness-center/backend/class-service/internal/config"
	"github.com/FurkanArikk/fitness-center/backend/class-service/internal/db"
	"github.com/FurkanArikk/fitness-center/backend/class-service/internal/handler"
	"github.com/FurkanArikk/fitness-center/backend/class-service/internal/repository"
	"github.com/FurkanArikk/fitness-center/backend/class-service/internal/server"
	"github.com/FurkanArikk/fitness-center/backend/class-service/internal/service"
)

func main() {
	// Set up logging
	log.SetFlags(log.LstdFlags | log.Lshortfile)
	log.Println("Starting class service...")

	// Load configuration
	cfg := config.LoadConfig()
	log.Printf("Loaded configuration: server port=%d", cfg.Server.Port)

	// Initialize database connection
	database, err := db.NewPostgresDB(cfg.Database)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer database.Close()

	// Initialize repositories
	repos := repository.NewRepositories(database.DB)

	// Initialize services
	services := service.NewServices(repos)

	// Initialize handlers
	handlers := handler.NewHandlers(services, database)

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

	log.Println("Class service is running. Press Ctrl+C to stop.")

	// Wait for termination signal
	<-done
	log.Println("Class service is shutting down...")
}
