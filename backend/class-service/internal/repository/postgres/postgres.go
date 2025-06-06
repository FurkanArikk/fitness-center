package postgres

import (
	"context"
	"fmt"
	"log"

	"github.com/FurkanArikk/fitness-center/backend/class-service/internal/config"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// PostgresRepository implements repository.Repository
type PostgresRepository struct {
	db *gorm.DB
}

// NewPostgresDB creates a new PostgreSQL database connection
func NewPostgresDB(cfg config.DatabaseConfig) (*gorm.DB, error) {
	db, err := gorm.Open(postgres.Open(cfg.GetDSN()), &gorm.Config{})
	if err != nil {
		return nil, fmt.Errorf("error opening database connection: %w", err)
	}

	// Test the connection
	sqlDB, err := db.DB()
	if err != nil {
		return nil, fmt.Errorf("error getting underlying sql.DB: %w", err)
	}

	if err := sqlDB.Ping(); err != nil {
		return nil, fmt.Errorf("error connecting to the database: %w", err)
	}

	log.Println("Connected to PostgreSQL database with GORM")
	return db, nil
}

// Ping checks if the database connection is active
func (r *PostgresRepository) Ping(ctx context.Context) error {
	sqlDB, err := r.db.DB()
	if err != nil {
		return err
	}
	return sqlDB.PingContext(ctx)
}
