package postgres

import (
	"context"
	"errors"
	"fmt"

	"github.com/FurkanArikk/fitness-center/backend/staff-service/internal/model"
	"gorm.io/gorm"
)

// TrainerRepository handles database operations related to trainers
type TrainerRepository struct {
	db *gorm.DB
}

// NewTrainerRepository creates a new TrainerRepository
func NewTrainerRepository(db *gorm.DB) *TrainerRepository {
	return &TrainerRepository{db: db}
}

// GetAll retrieves all active trainers from the database
func (r *TrainerRepository) GetAll(ctx context.Context) ([]model.Trainer, error) {
	var trainers []model.Trainer

	result := r.db.WithContext(ctx).Where("is_active = ?", true).Order("rating DESC").Find(&trainers)
	if result.Error != nil {
		return nil, fmt.Errorf("error querying trainers: %w", result.Error)
	}

	return trainers, nil
}

// GetByID retrieves an active trainer by ID
func (r *TrainerRepository) GetByID(ctx context.Context, id int64) (*model.Trainer, error) {
	var trainer model.Trainer

	result := r.db.WithContext(ctx).Where("trainer_id = ? AND is_active = ?", id, true).First(&trainer)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("trainer not found")
		}
		return nil, fmt.Errorf("error querying trainer: %w", result.Error)
	}

	return &trainer, nil
}

// GetByStaffID retrieves an active trainer by staff ID
func (r *TrainerRepository) GetByStaffID(ctx context.Context, staffID int64) (*model.Trainer, error) {
	var trainer model.Trainer

	result := r.db.WithContext(ctx).Where("staff_id = ? AND is_active = ?", staffID, true).First(&trainer)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("trainer not found")
		}
		return nil, fmt.Errorf("error querying trainer: %w", result.Error)
	}

	return &trainer, nil
}

// Create adds a new trainer to the database
func (r *TrainerRepository) Create(ctx context.Context, req *model.TrainerRequest) (*model.Trainer, error) {
	trainer := &model.Trainer{
		StaffID:        req.StaffID,
		Specialization: req.Specialization,
		Certification:  req.Certification,
		Experience:     req.Experience,
		Rating:         req.Rating,
		IsActive:       true,
	}

	result := r.db.WithContext(ctx).Create(trainer)
	if result.Error != nil {
		return nil, fmt.Errorf("error creating trainer: %w", result.Error)
	}

	return trainer, nil
}

// Update modifies an existing trainer in the database
func (r *TrainerRepository) Update(ctx context.Context, id int64, req *model.TrainerRequest) (*model.Trainer, error) {
	var trainer model.Trainer

	// First check if trainer exists and is active
	result := r.db.WithContext(ctx).Where("trainer_id = ? AND is_active = ?", id, true).First(&trainer)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("trainer not found or already deleted")
		}
		return nil, fmt.Errorf("error finding trainer: %w", result.Error)
	}

	// Update trainer
	trainer.StaffID = req.StaffID
	trainer.Specialization = req.Specialization
	trainer.Certification = req.Certification
	trainer.Experience = req.Experience
	trainer.Rating = req.Rating

	result = r.db.WithContext(ctx).Save(&trainer)
	if result.Error != nil {
		return nil, fmt.Errorf("error updating trainer: %w", result.Error)
	}

	return &trainer, nil
}

// Delete soft deletes a trainer by setting is_active to false
func (r *TrainerRepository) Delete(ctx context.Context, id int64) error {
	result := r.db.WithContext(ctx).Model(&model.Trainer{}).
		Where("trainer_id = ? AND is_active = ?", id, true).
		Update("is_active", false)

	if result.Error != nil {
		return fmt.Errorf("error soft deleting trainer: %w", result.Error)
	}

	if result.RowsAffected == 0 {
		return fmt.Errorf("trainer not found or already deleted")
	}

	return nil
}

// GetBySpecialization retrieves trainers by specialization
func (r *TrainerRepository) GetBySpecialization(ctx context.Context, specialization string) ([]model.Trainer, error) {
	var trainers []model.Trainer

	result := r.db.WithContext(ctx).
		Where("specialization = ? AND is_active = ?", specialization, true).
		Order("rating DESC").Find(&trainers)

	if result.Error != nil {
		return nil, fmt.Errorf("error querying trainers by specialization: %w", result.Error)
	}

	return trainers, nil
}

// GetTopRated retrieves the top rated trainers
func (r *TrainerRepository) GetTopRated(ctx context.Context, limit int) ([]model.Trainer, error) {
	var trainers []model.Trainer

	result := r.db.WithContext(ctx).
		Where("is_active = ?", true).
		Order("rating DESC").
		Limit(limit).Find(&trainers)

	if result.Error != nil {
		return nil, fmt.Errorf("error querying top rated trainers: %w", result.Error)
	}

	return trainers, nil
}

// GetWithStaffDetails retrieves all trainers with their staff details
func (r *TrainerRepository) GetWithStaffDetails(ctx context.Context) ([]model.Trainer, error) {
	var trainers []model.Trainer

	result := r.db.WithContext(ctx).
		Preload("Staff").
		Where("is_active = ?", true).
		Order("rating DESC").Find(&trainers)

	if result.Error != nil {
		return nil, fmt.Errorf("error querying trainers with staff details: %w", result.Error)
	}

	return trainers, nil
}

// GetAllPaginated retrieves trainers with pagination
func (r *TrainerRepository) GetAllPaginated(ctx context.Context, offset, limit int) ([]model.Trainer, int, error) {
	var trainers []model.Trainer
	var totalCount int64

	// Get total count
	countResult := r.db.WithContext(ctx).Model(&model.Trainer{}).Where("is_active = ?", true).Count(&totalCount)
	if countResult.Error != nil {
		return nil, 0, fmt.Errorf("error counting trainers: %w", countResult.Error)
	}

	// Get paginated data
	result := r.db.WithContext(ctx).
		Where("is_active = ?", true).
		Order("rating DESC").
		Offset(offset).Limit(limit).Find(&trainers)

	if result.Error != nil {
		return nil, 0, fmt.Errorf("error querying paginated trainers: %w", result.Error)
	}

	return trainers, int(totalCount), nil
}
