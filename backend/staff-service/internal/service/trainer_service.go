package service

import (
	"github.com/fitness-center/staff-service/internal/model"
)

// TrainerService implements business logic for trainer operations
type TrainerService struct {
	repo      model.TrainerRepository
	staffRepo model.StaffRepository
}

// NewTrainerService creates a new TrainerService
func NewTrainerService(repo model.TrainerRepository, staffRepo model.StaffRepository) *TrainerService {
	return &TrainerService{
		repo:      repo,
		staffRepo: staffRepo,
	}
}

// GetAll retrieves all trainers
func (s *TrainerService) GetAll() ([]model.Trainer, error) {
	return s.repo.GetAll()
}

// GetByID retrieves a trainer by ID
func (s *TrainerService) GetByID(id int64) (*model.Trainer, error) {
	trainer, err := s.repo.GetByID(id)
	if err != nil {
		return nil, err
	}

	// Optionally load staff details
	staff, err := s.staffRepo.GetByID(trainer.StaffID)
	if err == nil {
		trainer.Staff = staff
	}

	return trainer, nil
}

// GetByStaffID retrieves a trainer by staff ID
func (s *TrainerService) GetByStaffID(staffID int64) (*model.Trainer, error) {
	trainer, err := s.repo.GetByStaffID(staffID)
	if err != nil {
		return nil, err
	}

	// Optionally load staff details
	staff, err := s.staffRepo.GetByID(trainer.StaffID)
	if err == nil {
		trainer.Staff = staff
	}

	return trainer, nil
}

// Create adds a new trainer
func (s *TrainerService) Create(trainer *model.Trainer) (*model.Trainer, error) {
	// Verify the staff member exists
	_, err := s.staffRepo.GetByID(trainer.StaffID)
	if err != nil {
		return nil, err
	}

	// Add any business logic/validation here
	return s.repo.Create(trainer)
}

// Update modifies an existing trainer
func (s *TrainerService) Update(trainer *model.Trainer) (*model.Trainer, error) {
	// Verify the staff member exists
	_, err := s.staffRepo.GetByID(trainer.StaffID)
	if err != nil {
		return nil, err
	}

	// Add any business logic/validation here
	return s.repo.Update(trainer)
}

// Delete removes a trainer
func (s *TrainerService) Delete(id int64) error {
	// Add any business logic/validation here
	return s.repo.Delete(id)
}

// GetBySpecialization retrieves trainers by specialization
func (s *TrainerService) GetBySpecialization(specialization string) ([]model.Trainer, error) {
	return s.repo.GetBySpecialization(specialization)
}

// GetTopRated retrieves the top rated trainers
func (s *TrainerService) GetTopRated(limit int) ([]model.Trainer, error) {
	return s.repo.GetTopRated(limit)
}

// GetWithStaffDetails retrieves all trainers with their staff details
func (s *TrainerService) GetWithStaffDetails() ([]model.Trainer, error) {
	return s.repo.GetWithStaffDetails()
}
