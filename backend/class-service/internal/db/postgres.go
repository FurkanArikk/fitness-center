package db

import (
	"context"
	"database/sql"
	"fmt"
	"log"

	"github.com/FurkanArikk/fitness-center/backend/class-service/internal/config"
	_ "github.com/lib/pq"
)

// PostgresDB represents the PostgreSQL database implementation
type PostgresDB struct {
	DB *sql.DB
}

// NewPostgresDB creates a new PostgreSQL database connection
func NewPostgresDB(cfg config.DatabaseConfig) (*PostgresDB, error) {
	connStr := cfg.GetDSN()

	db, err := sql.Open("postgres", connStr)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	log.Println("Connected to PostgreSQL database")

	return &PostgresDB{DB: db}, nil
}

// Ping checks if the database connection is active
func (db *PostgresDB) Ping(ctx context.Context) error {
	return db.DB.PingContext(ctx)
}

// Close closes the database connection
func (db *PostgresDB) Close() error {
	return db.DB.Close()
}
