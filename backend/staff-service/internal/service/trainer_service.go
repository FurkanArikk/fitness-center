package service

import (
	"context"

	"github.com/FurkanArikk/fitness-center/backend/staff-service/internal/model"
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
func (s *TrainerService) GetAll(ctx context.Context) ([]model.Trainer, error) {
	return s.repo.GetAll(ctx)
}

// GetAllPaginated retrieves trainers with pagination
func (s *TrainerService) GetAllPaginated(ctx context.Context, offset, limit int) ([]model.Trainer, int, error) {
	return s.repo.GetAllPaginated(ctx, offset, limit)
}

// GetByID retrieves a trainer by ID
func (s *TrainerService) GetByID(ctx context.Context, id int64) (*model.Trainer, error) {
	trainer, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	// Optionally load staff details
	staff, err := s.staffRepo.GetByID(ctx, trainer.StaffID)
	if err == nil {
		trainer.Staff = staff
	}

	return trainer, nil
}

// GetByStaffID retrieves a trainer by staff ID
func (s *TrainerService) GetByStaffID(ctx context.Context, staffID int64) (*model.Trainer, error) {
	trainer, err := s.repo.GetByStaffID(ctx, staffID)
	if err != nil {
		return nil, err
	}

	// Optionally load staff details
	staff, err := s.staffRepo.GetByID(ctx, trainer.StaffID)
	if err == nil {
		trainer.Staff = staff
	}

	return trainer, nil
}

// Create adds a new trainer
func (s *TrainerService) Create(ctx context.Context, trainer *model.Trainer) (*model.Trainer, error) {
	// Verify the staff member exists
	_, err := s.staffRepo.GetByID(ctx, trainer.StaffID)
	if err != nil {
		return nil, err
	}

	// Add any business logic/validation here
	request := &model.TrainerRequest{
		StaffID:        trainer.StaffID,
		Specialization: trainer.Specialization,
		Certification:  trainer.Certification,
		Experience:     trainer.Experience,
		Rating:         trainer.Rating,
		IsActive:       trainer.IsActive,
	}
	return s.repo.Create(ctx, request)
}

// Update modifies an existing trainer
func (s *TrainerService) Update(ctx context.Context, trainer *model.Trainer) (*model.Trainer, error) {
	// Verify the staff member exists
	_, err := s.staffRepo.GetByID(ctx, trainer.StaffID)
	if err != nil {
		return nil, err
	}

	// Add any business logic/validation here
	request := &model.TrainerRequest{
		StaffID:        trainer.StaffID,
		Specialization: trainer.Specialization,
		Certification:  trainer.Certification,
		Experience:     trainer.Experience,
		Rating:         trainer.Rating,
		IsActive:       trainer.IsActive,
	}
	return s.repo.Update(ctx, trainer.TrainerID, request)
}

// Delete removes a trainer
func (s *TrainerService) Delete(ctx context.Context, id int64) error {
	// Add any business logic/validation here
	return s.repo.Delete(ctx, id)
}

// GetBySpecialization retrieves trainers by specialization
func (s *TrainerService) GetBySpecialization(ctx context.Context, specialization string) ([]model.Trainer, error) {
	return s.repo.GetBySpecialization(ctx, specialization)
}

// GetTopRated retrieves the top rated trainers
func (s *TrainerService) GetTopRated(ctx context.Context, limit int) ([]model.Trainer, error) {
	return s.repo.GetTopRated(ctx, limit)
}

// GetWithStaffDetails retrieves all trainers with their staff details
func (s *TrainerService) GetWithStaffDetails(ctx context.Context) ([]model.Trainer, error) {
	return s.repo.GetWithStaffDetails(ctx)
}
