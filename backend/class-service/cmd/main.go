package main

import (
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/FurkanArikk/fitness-center/backend/class-service/internal/config"
	"github.com/FurkanArikk/fitness-center/backend/class-service/internal/server"
)

func main() {
	// Set up logging
	log.SetFlags(log.LstdFlags | log.Lshortfile)
	log.Println("Starting class service...")

	// Load configuration
	cfg := config.LoadConfig()
	log.Printf("Loaded configuration: server port=%d", cfg.Server.Port)

	// Create and initialize server
	srv, err := server.NewServer(cfg)
	if err != nil {
		log.Fatalf("Failed to initialize server: %v", err)
	}

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
