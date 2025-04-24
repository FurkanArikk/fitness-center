package postgres

import (
	"database/sql"
	"fmt"
	"log"

	_ "github.com/lib/pq"

	"github.com/FurkanArikk/fitness-center/backend/class-service/internal/config"
	"github.com/FurkanArikk/fitness-center/backend/class-service/internal/repository"
)

// NewPostgresDB creates a new PostgreSQL database connection
func NewPostgresDB(cfg config.DatabaseConfig) (*sql.DB, error) {
	db, err := sql.Open("postgres", cfg.GetDSN())
	if err != nil {
		return nil, fmt.Errorf("error opening database connection: %w", err)
	}

	// Test the connection
	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("error connecting to the database: %w", err)
	}

	log.Println("Connected to PostgreSQL database")
	return db, nil
}

// NewRepository creates a new repository with all required repositories
func NewRepository(db *sql.DB) *repository.Repository {
	return &repository.Repository{
		Class:    NewClassRepository(db),
		Schedule: NewScheduleRepository(db),
		Booking:  NewBookingRepository(db),
	}
}
