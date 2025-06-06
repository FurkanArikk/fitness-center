package postgres

import (
	"context"
	"errors"
	"fmt"

	"github.com/FurkanArikk/fitness-center/backend/class-service/internal/model"
	"gorm.io/gorm"
)

// ClassRepository implements model.ClassRepository interface
type ClassRepository struct {
	db *gorm.DB
}

// NewClassRepository creates a new ClassRepository
func NewClassRepository(db *gorm.DB) model.ClassRepository {
	return &ClassRepository{db: db}
}

// GetAll returns all classes, optionally filtered by active status
func (r *ClassRepository) GetAll(ctx context.Context, activeOnly bool) ([]model.Class, error) {
	var classes []model.Class

	query := r.db.WithContext(ctx)
	if activeOnly {
		query = query.Where("is_active = ?", true)
	}

	err := query.Order("class_name").Find(&classes).Error
	if err != nil {
		return nil, fmt.Errorf("failed to fetch classes: %w", err)
	}

	return classes, nil
}

// GetAllPaginated returns paginated classes with total count
func (r *ClassRepository) GetAllPaginated(ctx context.Context, activeOnly bool, offset, limit int) ([]model.Class, int, error) {
	var classes []model.Class
	var total int64

	query := r.db.WithContext(ctx).Model(&model.Class{})
	if activeOnly {
		query = query.Where("is_active = ?", true)
	}

	// Get total count
	err := query.Count(&total).Error
	if err != nil {
		return nil, 0, fmt.Errorf("failed to count classes: %w", err)
	}

	// Get paginated data
	err = query.Order("class_name").Limit(limit).Offset(offset).Find(&classes).Error
	if err != nil {
		return nil, 0, fmt.Errorf("failed to fetch classes: %w", err)
	}

	return classes, int(total), nil
}

// GetByID returns a class by its ID
func (r *ClassRepository) GetByID(ctx context.Context, id int) (model.Class, error) {
	var class model.Class

	err := r.db.WithContext(ctx).Where("class_id = ?", id).First(&class).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return model.Class{}, errors.New("class not found")
		}
		return model.Class{}, fmt.Errorf("failed to fetch class: %w", err)
	}

	return class, nil
}

// Create adds a new class
func (r *ClassRepository) Create(ctx context.Context, class model.Class) (model.Class, error) {
	err := r.db.WithContext(ctx).Create(&class).Error
	if err != nil {
		return model.Class{}, fmt.Errorf("failed to create class: %w", err)
	}

	return class, nil
}

// Update modifies an existing class
func (r *ClassRepository) Update(ctx context.Context, id int, class model.Class) (model.Class, error) {
	class.ClassID = id

	err := r.db.WithContext(ctx).Save(&class).Error
	if err != nil {
		return model.Class{}, fmt.Errorf("failed to update class: %w", err)
	}

	return class, nil
}

// Delete removes a class by its ID
func (r *ClassRepository) Delete(ctx context.Context, id int) error {
	result := r.db.WithContext(ctx).Delete(&model.Class{}, id)
	if result.Error != nil {
		return fmt.Errorf("failed to delete class: %w", result.Error)
	}

	if result.RowsAffected == 0 {
		return errors.New("class not found")
	}

	return nil
}

// ExistsInSchedule checks if a class is used in any schedule
func (r *ClassRepository) ExistsInSchedule(ctx context.Context, id int) (bool, error) {
	var count int64

	err := r.db.WithContext(ctx).Model(&model.Schedule{}).Where("class_id = ?", id).Count(&count).Error
	if err != nil {
		return false, fmt.Errorf("failed to check if class exists in schedule: %w", err)
	}

	return count > 0, nil
}
