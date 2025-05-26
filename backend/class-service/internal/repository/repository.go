package repository

import (
	"database/sql"

	"github.com/FurkanArikk/fitness-center/backend/class-service/internal/model"
	"github.com/FurkanArikk/fitness-center/backend/class-service/internal/repository/postgres"
)

// Repository is a factory for all repositories
type Repository struct {
	ClassRepo    model.ClassRepository
	ScheduleRepo model.ScheduleRepository
	BookingRepo  model.BookingRepository
}

// NewRepositories creates a new repository factory with all repositories
func NewRepositories(db *sql.DB) *Repository {
	return &Repository{
		ClassRepo:    postgres.NewClassRepository(db),
		ScheduleRepo: postgres.NewScheduleRepository(db),
		BookingRepo:  postgres.NewBookingRepository(db),
	}
}

// NewClassRepository creates a new class repository
func NewClassRepository(db *sql.DB) model.ClassRepository {
	return postgres.NewClassRepository(db)
}

// NewScheduleRepository creates a new schedule repository
func NewScheduleRepository(db *sql.DB) model.ScheduleRepository {
	return postgres.NewScheduleRepository(db)
}

// NewBookingRepository creates a new booking repository
func NewBookingRepository(db *sql.DB) model.BookingRepository {
	return postgres.NewBookingRepository(db)
}
