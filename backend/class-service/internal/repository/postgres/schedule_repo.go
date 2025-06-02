package postgres

import (
	"context"
	"errors"
	"fmt"

	"github.com/FurkanArikk/fitness-center/backend/class-service/internal/model"
	"gorm.io/gorm"
)

// ScheduleRepository implements model.ScheduleRepository interface
type ScheduleRepository struct {
	db *gorm.DB
}

// NewScheduleRepository creates a new ScheduleRepository
func NewScheduleRepository(db *gorm.DB) model.ScheduleRepository {
	return &ScheduleRepository{db: db}
}

// GetAll returns all schedules, optionally filtered by status
func (r *ScheduleRepository) GetAll(ctx context.Context, status string) ([]model.ScheduleResponse, error) {
	var schedules []model.ScheduleResponse

	query := r.db.WithContext(ctx).Table("class_schedule cs").
		Select("cs.*, c.class_name, c.duration as class_duration").
		Joins("JOIN classes c ON cs.class_id = c.class_id")

	if status != "" {
		query = query.Where("cs.status = ?", status)
	}

	err := query.Order("cs.day_of_week, cs.start_time").Find(&schedules).Error
	if err != nil {
		return nil, fmt.Errorf("failed to fetch schedules: %w", err)
	}

	return schedules, nil
}

// GetAllPaginated returns paginated schedules with total count
func (r *ScheduleRepository) GetAllPaginated(ctx context.Context, status string, offset, limit int) ([]model.ScheduleResponse, int, error) {
	var schedules []model.ScheduleResponse
	var total int64

	// Count query
	countQuery := r.db.WithContext(ctx).Table("class_schedule cs")
	if status != "" {
		countQuery = countQuery.Where("status = ?", status)
	}

	err := countQuery.Count(&total).Error
	if err != nil {
		return nil, 0, fmt.Errorf("failed to count schedules: %w", err)
	}

	// Data query
	query := r.db.WithContext(ctx).Table("class_schedule cs").
		Select("cs.*, c.class_name, c.duration as class_duration").
		Joins("JOIN classes c ON cs.class_id = c.class_id")

	if status != "" {
		query = query.Where("cs.status = ?", status)
	}

	err = query.Order("cs.day_of_week, cs.start_time").
		Limit(limit).Offset(offset).Find(&schedules).Error
	if err != nil {
		return nil, 0, fmt.Errorf("failed to fetch schedules: %w", err)
	}

	return schedules, int(total), nil
}

// GetByID returns a schedule by its ID
func (r *ScheduleRepository) GetByID(ctx context.Context, id int) (model.ScheduleResponse, error) {
	var schedule model.ScheduleResponse

	err := r.db.WithContext(ctx).Table("class_schedule cs").
		Select("cs.*, c.class_name, c.duration as class_duration").
		Joins("JOIN classes c ON cs.class_id = c.class_id").
		Where("cs.schedule_id = ?", id).
		First(&schedule).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return model.ScheduleResponse{}, errors.New("schedule not found")
		}
		return model.ScheduleResponse{}, fmt.Errorf("failed to fetch schedule: %w", err)
	}

	return schedule, nil
}

// GetByClassID returns schedules for a specific class
func (r *ScheduleRepository) GetByClassID(ctx context.Context, classID int) ([]model.ScheduleResponse, error) {
	var schedules []model.ScheduleResponse

	err := r.db.WithContext(ctx).Table("class_schedule cs").
		Select("cs.*, c.class_name, c.duration as class_duration").
		Joins("JOIN classes c ON cs.class_id = c.class_id").
		Where("cs.class_id = ?", classID).
		Order("cs.day_of_week, cs.start_time").
		Find(&schedules).Error

	if err != nil {
		return nil, fmt.Errorf("failed to fetch schedules for class: %w", err)
	}

	return schedules, nil
}

// Create adds a new schedule
func (r *ScheduleRepository) Create(ctx context.Context, schedule model.Schedule) (model.Schedule, error) {
	err := r.db.WithContext(ctx).Create(&schedule).Error
	if err != nil {
		return model.Schedule{}, fmt.Errorf("failed to create schedule: %w", err)
	}

	return schedule, nil
}

// Update modifies an existing schedule
func (r *ScheduleRepository) Update(ctx context.Context, id int, schedule model.Schedule) (model.Schedule, error) {
	schedule.ScheduleID = id

	err := r.db.WithContext(ctx).Save(&schedule).Error
	if err != nil {
		return model.Schedule{}, fmt.Errorf("failed to update schedule: %w", err)
	}

	return schedule, nil
}

// Delete removes a schedule by its ID
func (r *ScheduleRepository) Delete(ctx context.Context, id int) error {
	result := r.db.WithContext(ctx).Delete(&model.Schedule{}, id)
	if result.Error != nil {
		return fmt.Errorf("failed to delete schedule: %w", result.Error)
	}

	if result.RowsAffected == 0 {
		return errors.New("schedule not found")
	}

	return nil
}

// HasBookings checks if a schedule has any bookings
func (r *ScheduleRepository) HasBookings(ctx context.Context, id int) (bool, error) {
	var count int64

	err := r.db.WithContext(ctx).Model(&model.Booking{}).Where("schedule_id = ?", id).Count(&count).Error
	if err != nil {
		return false, fmt.Errorf("failed to check if schedule has bookings: %w", err)
	}

	return count > 0, nil
}
