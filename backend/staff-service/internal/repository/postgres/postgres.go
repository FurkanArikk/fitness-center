package postgres

import (
	"github.com/FurkanArikk/fitness-center/backend/staff-service/internal/db"
	"github.com/FurkanArikk/fitness-center/backend/staff-service/internal/model"
)

// Repository provides access to all repository implementations
type Repository struct {
	Staff            model.StaffRepository
	Trainer          model.TrainerRepository
	Qualification    model.QualificationRepository
	PersonalTraining model.PersonalTrainingRepository
}

// NewRepository creates a new repository with all implementations
func NewRepository(database *db.PostgresDB) *Repository {
	return &Repository{
		Staff:            NewStaffRepository(database.DB),
		Trainer:          NewTrainerRepository(database.DB),
		Qualification:    NewQualificationRepository(database.DB),
		PersonalTraining: NewPersonalTrainingRepository(database.DB),
	}
}
