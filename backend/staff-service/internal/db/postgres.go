package db

import (
	"context"
	"fmt"
	"log"

	"github.com/FurkanArikk/fitness-center/backend/staff-service/internal/config"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// PostgresDB represents the PostgreSQL database implementation
type PostgresDB struct {
	DB *gorm.DB
}

// NewPostgresDB creates a new PostgreSQL database connection
func NewPostgresDB(cfg config.DatabaseConfig) (*PostgresDB, error) {
	dsn := cfg.GetDSN()

	// Configure GORM to disable automatic foreign key constraints
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		DisableForeignKeyConstraintWhenMigrating: true,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	// Get underlying sql.DB to configure connection pool
	sqlDB, err := db.DB()
	if err != nil {
		return nil, fmt.Errorf("failed to get underlying sql.DB: %w", err)
	}

	if err := sqlDB.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	// Skip auto-migration since database schema already exists with proper constraints
	// The migrations folder contains the proper SQL migrations for this service

	log.Println("Connected to PostgreSQL database with GORM")

	return &PostgresDB{DB: db}, nil
}

// Ping checks if the database connection is active
func (db *PostgresDB) Ping(ctx context.Context) error {
	sqlDB, err := db.DB.DB()
	if err != nil {
		return err
	}
	return sqlDB.PingContext(ctx)
}

// Close closes the database connection
func (db *PostgresDB) Close() error {
	sqlDB, err := db.DB.DB()
	if err != nil {
		return err
	}
	return sqlDB.Close()
}
