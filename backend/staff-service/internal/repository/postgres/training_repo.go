package postgres

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/FurkanArikk/fitness-center/backend/staff-service/internal/model"
	"gorm.io/gorm"
)

// PersonalTrainingRepository handles database operations related to personal training sessions
type PersonalTrainingRepository struct {
	db *gorm.DB
}

// NewPersonalTrainingRepository creates a new PersonalTrainingRepository
func NewPersonalTrainingRepository(db *gorm.DB) *PersonalTrainingRepository {
	return &PersonalTrainingRepository{db: db}
}

// GetAll retrieves all personal training sessions from the database
func (r *PersonalTrainingRepository) GetAll(ctx context.Context) ([]model.PersonalTraining, error) {
	var sessions []model.PersonalTraining

	result := r.db.WithContext(ctx).Order("session_date DESC, start_time ASC").Find(&sessions)
	if result.Error != nil {
		return nil, fmt.Errorf("error querying training sessions: %w", result.Error)
	}

	return sessions, nil
}

// GetByID retrieves a personal training session by ID
func (r *PersonalTrainingRepository) GetByID(ctx context.Context, id int64) (*model.PersonalTraining, error) {
	var session model.PersonalTraining

	result := r.db.WithContext(ctx).First(&session, id)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("training session not found")
		}
		return nil, fmt.Errorf("error querying training session: %w", result.Error)
	}

	return &session, nil
}

// GetByMemberID retrieves all personal training sessions for a member
func (r *PersonalTrainingRepository) GetByMemberID(ctx context.Context, memberID int64) ([]model.PersonalTraining, error) {
	var sessions []model.PersonalTraining

	result := r.db.WithContext(ctx).
		Where("member_id = ?", memberID).
		Order("session_date DESC, start_time ASC").Find(&sessions)

	if result.Error != nil {
		return nil, fmt.Errorf("error querying training sessions by member ID: %w", result.Error)
	}

	return sessions, nil
}

// GetByTrainerID retrieves all personal training sessions for a trainer
func (r *PersonalTrainingRepository) GetByTrainerID(ctx context.Context, trainerID int64) ([]model.PersonalTraining, error) {
	var sessions []model.PersonalTraining

	result := r.db.WithContext(ctx).
		Where("trainer_id = ?", trainerID).
		Order("session_date DESC, start_time ASC").Find(&sessions)

	if result.Error != nil {
		return nil, fmt.Errorf("error querying training sessions by trainer ID: %w", result.Error)
	}

	return sessions, nil
}

// GetByDateRange retrieves all personal training sessions within a date range
func (r *PersonalTrainingRepository) GetByDateRange(ctx context.Context, startDate, endDate time.Time) ([]model.PersonalTraining, error) {
	var sessions []model.PersonalTraining

	result := r.db.WithContext(ctx).
		Where("session_date BETWEEN ? AND ?", startDate, endDate).
		Order("session_date ASC, start_time ASC").Find(&sessions)

	if result.Error != nil {
		return nil, fmt.Errorf("error querying training sessions by date range: %w", result.Error)
	}

	return sessions, nil
}

// GetByStatus retrieves all personal training sessions with a specific status
func (r *PersonalTrainingRepository) GetByStatus(ctx context.Context, status string) ([]model.PersonalTraining, error) {
	var sessions []model.PersonalTraining

	result := r.db.WithContext(ctx).
		Where("status = ?", status).
		Order("session_date ASC, start_time ASC").Find(&sessions)

	if result.Error != nil {
		return nil, fmt.Errorf("error querying training sessions by status: %w", result.Error)
	}

	return sessions, nil
}

// GetByStatusAndDate retrieves all personal training sessions with a specific status on a specific date
func (r *PersonalTrainingRepository) GetByStatusAndDate(ctx context.Context, status string, date time.Time) ([]model.PersonalTraining, error) {
	var sessions []model.PersonalTraining

	// Create date range for the specified date (start of day to end of day)
	endDate := date.AddDate(0, 0, 1)

	result := r.db.WithContext(ctx).
		Where("status = ? AND session_date >= ? AND session_date < ?", status, date, endDate).
		Order("session_date ASC, start_time ASC").Find(&sessions)

	if result.Error != nil {
		return nil, fmt.Errorf("error querying training sessions by status and date: %w", result.Error)
	}

	return sessions, nil
}

// Create adds a new personal training session to the database
func (r *PersonalTrainingRepository) Create(ctx context.Context, req *model.PersonalTrainingRequest) (*model.PersonalTraining, error) {
	session := &model.PersonalTraining{
		MemberID:    req.MemberID,
		TrainerID:   req.TrainerID,
		SessionDate: req.SessionDate,
		StartTime:   req.StartTime,
		EndTime:     req.EndTime,
		Notes:       req.Notes,
		Status:      req.Status,
		Price:       req.Price,
	}

	result := r.db.WithContext(ctx).Create(session)
	if result.Error != nil {
		return nil, fmt.Errorf("error creating training session: %w", result.Error)
	}

	return session, nil
}

// Update modifies an existing personal training session in the database
func (r *PersonalTrainingRepository) Update(ctx context.Context, id int64, req *model.PersonalTrainingRequest) (*model.PersonalTraining, error) {
	var session model.PersonalTraining

	// First check if session exists
	result := r.db.WithContext(ctx).First(&session, id)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("training session not found")
		}
		return nil, fmt.Errorf("error finding training session: %w", result.Error)
	}

	// Update session
	session.MemberID = req.MemberID
	session.TrainerID = req.TrainerID
	session.SessionDate = req.SessionDate
	session.StartTime = req.StartTime
	session.EndTime = req.EndTime
	session.Notes = req.Notes
	session.Status = req.Status
	session.Price = req.Price

	result = r.db.WithContext(ctx).Save(&session)
	if result.Error != nil {
		return nil, fmt.Errorf("error updating training session: %w", result.Error)
	}

	return &session, nil
}

// Delete removes a personal training session from the database
func (r *PersonalTrainingRepository) Delete(ctx context.Context, id int64) error {
	result := r.db.WithContext(ctx).Delete(&model.PersonalTraining{}, id)
	if result.Error != nil {
		return fmt.Errorf("error deleting training session: %w", result.Error)
	}

	if result.RowsAffected == 0 {
		return fmt.Errorf("training session not found")
	}

	return nil
}

// GetWithTrainerDetails retrieves a personal training session with trainer details
func (r *PersonalTrainingRepository) GetWithTrainerDetails(ctx context.Context, id int64) (*model.PersonalTraining, error) {
	var session model.PersonalTraining

	result := r.db.WithContext(ctx).
		Preload("Trainer").
		Preload("Trainer.Staff").
		First(&session, id)

	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("training session not found")
		}
		return nil, fmt.Errorf("error querying training session: %w", result.Error)
	}

	return &session, nil
}

// GetAllPaginated retrieves personal training sessions with pagination
func (r *PersonalTrainingRepository) GetAllPaginated(ctx context.Context, offset, limit int) ([]model.PersonalTraining, int, error) {
	var sessions []model.PersonalTraining
	var totalCount int64

	// Get total count
	countResult := r.db.WithContext(ctx).Model(&model.PersonalTraining{}).Count(&totalCount)
	if countResult.Error != nil {
		return nil, 0, fmt.Errorf("error counting training sessions: %w", countResult.Error)
	}

	// Get paginated data
	result := r.db.WithContext(ctx).
		Order("session_date DESC, start_time ASC").
		Offset(offset).Limit(limit).Find(&sessions)

	if result.Error != nil {
		return nil, 0, fmt.Errorf("error querying paginated training sessions: %w", result.Error)
	}

	return sessions, int(totalCount), nil
}
