package repository

import (
	"database/sql"

	"github.com/FurkanArikk/fitness-center/backend/staff-service/internal/model"
	"github.com/FurkanArikk/fitness-center/backend/staff-service/internal/repository/postgres"
)

// Repository is a factory for all repositories
type Repository struct {
	StaffRepo         model.StaffRepository
	QualificationRepo model.QualificationRepository
	TrainerRepo       model.TrainerRepository
	TrainingRepo      model.PersonalTrainingRepository
}

// NewRepository creates a new repository factory with all repositories
func NewRepository(db *sql.DB) *Repository {
	return &Repository{
		StaffRepo:         postgres.NewStaffRepository(db),
		QualificationRepo: postgres.NewQualificationRepository(db),
		TrainerRepo:       postgres.NewTrainerRepository(db),
		TrainingRepo:      postgres.NewPersonalTrainingRepository(db),
	}
}

// NewStaffRepository creates a new staff repository
func NewStaffRepository(db *sql.DB) model.StaffRepository {
	return postgres.NewStaffRepository(db)
}

// NewQualificationRepository creates a new qualification repository
func NewQualificationRepository(db *sql.DB) model.QualificationRepository {
	return postgres.NewQualificationRepository(db)
}

// NewTrainerRepository creates a new trainer repository
func NewTrainerRepository(db *sql.DB) model.TrainerRepository {
	return postgres.NewTrainerRepository(db)
}

// NewPersonalTrainingRepository creates a new personal training repository
func NewPersonalTrainingRepository(db *sql.DB) model.PersonalTrainingRepository {
	return postgres.NewPersonalTrainingRepository(db)
}
