package repository

import (
	"github.com/FurkanArikk/fitness-center/backend/class-service/internal/model"
	"github.com/FurkanArikk/fitness-center/backend/class-service/internal/repository/postgres"
	"gorm.io/gorm"
)

// Repository is a factory for all repositories
type Repository struct {
	ClassRepo    model.ClassRepository
	ScheduleRepo model.ScheduleRepository
	BookingRepo  model.BookingRepository
}

// NewRepositories creates a new repository factory with all repositories
func NewRepositories(db *gorm.DB) *Repository {
	return &Repository{
		ClassRepo:    postgres.NewClassRepository(db),
		ScheduleRepo: postgres.NewScheduleRepository(db),
		BookingRepo:  postgres.NewBookingRepository(db),
	}
}

// NewClassRepository creates a new class repository
func NewClassRepository(db *gorm.DB) model.ClassRepository {
	return postgres.NewClassRepository(db)
}

// NewScheduleRepository creates a new schedule repository
func NewScheduleRepository(db *gorm.DB) model.ScheduleRepository {
	return postgres.NewScheduleRepository(db)
}

// NewBookingRepository creates a new booking repository
func NewBookingRepository(db *gorm.DB) model.BookingRepository {
	return postgres.NewBookingRepository(db)
}
