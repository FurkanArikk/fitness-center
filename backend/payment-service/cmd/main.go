package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/furkan/fitness-center/backend/payment-service/internal/config"
	"github.com/furkan/fitness-center/backend/payment-service/internal/handler"
	"github.com/furkan/fitness-center/backend/payment-service/internal/repository/postgres"
	"github.com/furkan/fitness-center/backend/payment-service/internal/server"
	"github.com/furkan/fitness-center/backend/payment-service/internal/service"
)

func main() {
	// Load configuration
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatalf("Failed to load configuration: %v", err)
	}

	// Initialize repository
	repo, err := postgres.NewPostgresRepository(cfg.DB.GetConnectionString())
	if err != nil {
		log.Fatalf("Failed to initialize repository: %v", err)
	}
	defer repo.Close()

	// Initialize service
	svc := service.New(repo)

	// Initialize handler
	h := handler.New(repo)
	h.SetService(svc)

	// Create and start server
	srv := server.NewServer(h, fmt.Sprintf("%d", cfg.ServerPort))

	// Set up graceful shutdown
	done := make(chan os.Signal, 1)
	signal.Notify(done, os.Interrupt, syscall.SIGINT, syscall.SIGTERM)

	go func() {
		if err := srv.Start(); err != nil {
			log.Fatalf("Failed to start server: %v", err)
		}
	}()

	log.Printf("Payment service started on port %d", cfg.ServerPort)

	// Wait for interrupt signal
	<-done
	log.Print("Server shutting down...")

	// Gracefully shutdown the server
	ctx, cancel := context.WithTimeout(context.Background(), cfg.ShutdownTimeout)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Fatalf("Server shutdown failed: %v", err)
	}

	log.Print("Server exited properly")
}
