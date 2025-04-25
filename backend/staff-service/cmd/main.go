package main

import (
	"log"
	"os"
	"os/signal"
	"strconv"
	"syscall"

	"github.com/FurkanArikk/fitness-center/backend/staff-service/internal/config"
	"github.com/FurkanArikk/fitness-center/backend/staff-service/internal/db"
	"github.com/FurkanArikk/fitness-center/backend/staff-service/internal/handler"
	"github.com/FurkanArikk/fitness-center/backend/staff-service/internal/server"
)

func main() {
	log.Println("Starting staff service...")

	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load configuration: %v", err)
	}

	log.Printf("Loaded configuration: server port=%d", cfg.Server.Port)

	// Initialize database connection
	database, err := db.NewPostgresDB(cfg.Database)
	if err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}

	// Create handlers
	h := handler.NewHandler(database)

	// Setup HTTP server
	srv := server.NewServer(h, strconv.Itoa(cfg.Server.Port))

	// Handle graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	go func() {
		<-quit
		log.Println("Shutting down staff service...")
		if err := srv.Shutdown(); err != nil {
			log.Fatalf("Server shutdown error: %v", err)
		}
	}()

	log.Println("Staff service is running. Press Ctrl+C to stop.")

	// Start the server
	if err := srv.Start(); err != nil {
		log.Fatalf("Server error: %v", err)
	}
}
