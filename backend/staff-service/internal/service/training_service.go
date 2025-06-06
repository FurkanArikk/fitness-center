package service

import (
	"context"
	"fmt"
	"time"

	"github.com/FurkanArikk/fitness-center/backend/staff-service/internal/model"
)

// PersonalTrainingService implements business logic for personal training operations
type PersonalTrainingService struct {
	repo        model.PersonalTrainingRepository
	trainerRepo model.TrainerRepository
}

// NewPersonalTrainingService creates a new PersonalTrainingService
func NewPersonalTrainingService(repo model.PersonalTrainingRepository, trainerRepo model.TrainerRepository) *PersonalTrainingService {
	return &PersonalTrainingService{
		repo:        repo,
		trainerRepo: trainerRepo,
	}
}

// GetAll retrieves all personal training sessions
func (s *PersonalTrainingService) GetAll(ctx context.Context) ([]model.PersonalTraining, error) {
	return s.repo.GetAll(ctx)
}

// GetAllPaginated retrieves personal training sessions with pagination
func (s *PersonalTrainingService) GetAllPaginated(ctx context.Context, offset, limit int) ([]model.PersonalTraining, int, error) {
	return s.repo.GetAllPaginated(ctx, offset, limit)
}

// GetByID retrieves a personal training session by ID
func (s *PersonalTrainingService) GetByID(ctx context.Context, id int64) (*model.PersonalTraining, error) {
	return s.repo.GetByID(ctx, id)
}

// GetByMemberID retrieves all personal training sessions for a member
func (s *PersonalTrainingService) GetByMemberID(ctx context.Context, memberID int64) ([]model.PersonalTraining, error) {
	return s.repo.GetByMemberID(ctx, memberID)
}

// GetByTrainerID retrieves all personal training sessions for a trainer
func (s *PersonalTrainingService) GetByTrainerID(ctx context.Context, trainerID int64) ([]model.PersonalTraining, error) {
	return s.repo.GetByTrainerID(ctx, trainerID)
}

// GetByDateRange retrieves all personal training sessions within a date range
func (s *PersonalTrainingService) GetByDateRange(ctx context.Context, startDate, endDate time.Time) ([]model.PersonalTraining, error) {
	return s.repo.GetByDateRange(ctx, startDate, endDate)
}

// GetByStatus retrieves all personal training sessions with a specific status
func (s *PersonalTrainingService) GetByStatus(ctx context.Context, status string) ([]model.PersonalTraining, error) {
	return s.repo.GetByStatus(ctx, status)
}

// GetByStatusAndDate retrieves all personal training sessions with a specific status on a specific date
func (s *PersonalTrainingService) GetByStatusAndDate(ctx context.Context, status string, date time.Time) ([]model.PersonalTraining, error) {
	return s.repo.GetByStatusAndDate(ctx, status, date)
}

// Create adds a new personal training session
func (s *PersonalTrainingService) Create(ctx context.Context, training *model.PersonalTraining) (*model.PersonalTraining, error) {
	// Verify the trainer exists
	_, err := s.trainerRepo.GetByID(ctx, training.TrainerID)
	if err != nil {
		return nil, fmt.Errorf("trainer not found: %w", err)
	}

	// Validate time format
	if training.StartTime >= training.EndTime {
		return nil, fmt.Errorf("start time must be before end time")
	}

	// Check for schedule conflicts
	existingTrainings, err := s.repo.GetByTrainerID(ctx, training.TrainerID)
	if err != nil {
		return nil, fmt.Errorf("error checking trainer schedule: %w", err)
	}

	for _, existing := range existingTrainings {
		if existing.SessionDate.Equal(training.SessionDate) {
			// Time format is assumed to be HH:MM:SS in string format
			if (existing.StartTime <= training.StartTime && training.StartTime < existing.EndTime) ||
				(existing.StartTime < training.EndTime && training.EndTime <= existing.EndTime) ||
				(training.StartTime <= existing.StartTime && existing.EndTime <= training.EndTime) {
				return nil, fmt.Errorf("schedule conflict: trainer already has a session during this time")
			}
		}
	}

	// Convert to request struct for repository
	request := &model.PersonalTrainingRequest{
		MemberID:    training.MemberID,
		TrainerID:   training.TrainerID,
		SessionDate: training.SessionDate,
		StartTime:   training.StartTime,
		EndTime:     training.EndTime,
		Notes:       training.Notes,
		Status:      training.Status,
		Price:       training.Price,
	}
	return s.repo.Create(ctx, request)
}

// Update modifies an existing personal training session
func (s *PersonalTrainingService) Update(ctx context.Context, training *model.PersonalTraining) (*model.PersonalTraining, error) {
	// Verify the trainer exists but allow inactive trainers for updates
	_, err := s.trainerRepo.GetByID(ctx, training.TrainerID)
	if err != nil {
		// Check if the error is because the trainer is inactive
		// Try to get the training session to verify the trainer ID is valid
		existingSession, existErr := s.repo.GetByID(ctx, training.SessionID)
		if existErr != nil {
			return nil, fmt.Errorf("session not found: %w", existErr)
		}

		// If the trainer ID in the update matches the existing session,
		// don't allow update with inactive trainer, just inform the user
		if existingSession.TrainerID == training.TrainerID {
			return nil, fmt.Errorf("trainer is inactive and cannot be used for training sessions")
		}

		// If trying to change to a different trainer ID that's invalid/inactive
		return nil, fmt.Errorf("trainer not found or inactive: %w", err)
	}

	// Validate time format
	if training.StartTime >= training.EndTime {
		return nil, fmt.Errorf("start time must be before end time")
	}

	// Convert to request struct for repository
	request := &model.PersonalTrainingRequest{
		MemberID:    training.MemberID,
		TrainerID:   training.TrainerID,
		SessionDate: training.SessionDate,
		StartTime:   training.StartTime,
		EndTime:     training.EndTime,
		Notes:       training.Notes,
		Status:      training.Status,
		Price:       training.Price,
	}
	return s.repo.Update(ctx, training.SessionID, request)
}

// Delete removes a personal training session
func (s *PersonalTrainingService) Delete(ctx context.Context, id int64) error {
	// Check if the session is already completed
	training, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return fmt.Errorf("session not found: %w", err)
	}

	if training.Status == "Completed" {
		return fmt.Errorf("cannot delete a completed training session")
	}

	return s.repo.Delete(ctx, id)
}

// GetWithTrainerDetails retrieves a personal training session with trainer details
func (s *PersonalTrainingService) GetWithTrainerDetails(ctx context.Context, id int64) (*model.PersonalTraining, error) {
	return s.repo.GetWithTrainerDetails(ctx, id)
}

// ScheduleSession schedules a new personal training session
func (s *PersonalTrainingService) ScheduleSession(ctx context.Context, training *model.PersonalTraining) (*model.PersonalTraining, error) {
	// Set status to Scheduled
	training.Status = "Scheduled"

	// Create the session
	return s.Create(ctx, training)
}

// CancelSession cancels a personal training session
func (s *PersonalTrainingService) CancelSession(ctx context.Context, id int64) error {
	// Retrieve the session
	training, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return fmt.Errorf("session not found: %w", err)
	}

	// Check if it can be canceled
	if training.Status == "Completed" {
		return fmt.Errorf("cannot cancel a completed training session")
	}

	// Update status to Cancelled
	training.Status = "Cancelled"
	request := &model.PersonalTrainingRequest{
		MemberID:    training.MemberID,
		TrainerID:   training.TrainerID,
		SessionDate: training.SessionDate,
		StartTime:   training.StartTime,
		EndTime:     training.EndTime,
		Notes:       training.Notes,
		Status:      training.Status,
		Price:       training.Price,
	}
	_, err = s.repo.Update(ctx, training.SessionID, request)
	return err
}

// CompleteSession marks a personal training session as completed
func (s *PersonalTrainingService) CompleteSession(ctx context.Context, id int64) error {
	// Retrieve the session
	training, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return fmt.Errorf("session not found: %w", err)
	}

	// Check if it can be completed
	if training.Status == "Cancelled" {
		return fmt.Errorf("cannot complete a cancelled training session")
	}

	// Update status to Completed
	training.Status = "Completed"
	request := &model.PersonalTrainingRequest{
		MemberID:    training.MemberID,
		TrainerID:   training.TrainerID,
		SessionDate: training.SessionDate,
		StartTime:   training.StartTime,
		EndTime:     training.EndTime,
		Notes:       training.Notes,
		Status:      training.Status,
		Price:       training.Price,
	}
	_, err = s.repo.Update(ctx, training.SessionID, request)
	return err
}
