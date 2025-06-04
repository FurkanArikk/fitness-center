package main

import (
	"log"
	"os"
	"strconv"

	"github.com/FurkanArikk/fitness-center/backend/facility-service/internal/config"
	"github.com/FurkanArikk/fitness-center/backend/facility-service/internal/handler"
	"github.com/FurkanArikk/fitness-center/backend/facility-service/internal/repository/postgres"
	"github.com/FurkanArikk/fitness-center/backend/facility-service/internal/server"
	"github.com/FurkanArikk/fitness-center/backend/facility-service/internal/service"
)

func main() {
	// Load configuration from environment
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatalf("Failed to load configuration: %v", err)
	}

	// Database connection
	pgConnStr := cfg.PostgresConfig.GetConnectionString()
	repo, err := postgres.NewPostgresRepository(pgConnStr)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer repo.Close()

	// Initialize services
	svc := service.New(repo)

	// Initialize handlers
	h := handler.New(repo)

	// Use the service in the handler
	h.SetService(svc)

	// Setup and start server
	port := os.Getenv("FACILITY_SERVICE_PORT")
	if port == "" {
		port = strconv.Itoa(cfg.ServerPort)
	}

	srv := server.NewServer(h, port)

	log.Println("Starting facility service...")
	if err := srv.Start(); err != nil {
		log.Fatalf("Error starting server: %v", err)
	}
}
