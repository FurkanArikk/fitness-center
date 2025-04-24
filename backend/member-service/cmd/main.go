package main

import (
	"database/sql"
	"fmt"
	"log"
	"time"

	"github.com/FurkanArikk/fitness-center/backend/member-service/internal/config"
	"github.com/FurkanArikk/fitness-center/backend/member-service/internal/server"
	_ "github.com/lib/pq"
)

func main() {
	fmt.Println("Starting Member Service...")

	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load configuration: %v", err)
	}

	// Connect to database
	db, err := connectDB(cfg.Database)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	// Initialize and start the server
	srv := server.NewServer(db, server.Config{
		Port:         fmt.Sprintf("%d", cfg.Server.Port),
		ReadTimeout:  cfg.Server.ReadTimeout,
		WriteTimeout: cfg.Server.WriteTimeout,
		IdleTimeout:  cfg.Server.IdleTimeout,
	})

	if err := srv.Start(); err != nil {
		log.Fatalf("Server error: %v", err)
	}

	fmt.Println("Server gracefully stopped")
}

func connectDB(cfg config.DatabaseConfig) (*sql.DB, error) {
	db, err := sql.Open("postgres", cfg.GetDSN())
	if err != nil {
		return nil, fmt.Errorf("failed to open database connection: %w", err)
	}

	// Set connection pool settings
	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(5)
	db.SetConnMaxLifetime(5 * time.Minute)

	// Check connection
	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	return db, nil
}
