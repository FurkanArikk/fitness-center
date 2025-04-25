package service

import (
	"github.com/FurkanArikk/fitness-center/backend/staff-service/internal/model"
	"github.com/FurkanArikk/fitness-center/backend/staff-service/internal/repository"
)

// Service is a factory for all services
type Service struct {
	StaffService         model.StaffService
	QualificationService model.QualificationService
	TrainerService       model.TrainerService
	TrainingService      model.PersonalTrainingService
}

// NewService creates a new service factory with all services
func NewService(repo *repository.Repository) *Service {
	return &Service{
		StaffService:         NewStaffService(repo.StaffRepo),
		QualificationService: NewQualificationService(repo.QualificationRepo),
		TrainerService:       NewTrainerService(repo.TrainerRepo, repo.StaffRepo),
		TrainingService:      NewPersonalTrainingService(repo.TrainingRepo, repo.TrainerRepo),
	}
}
