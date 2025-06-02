package postgres

import (
	"context"
	"fmt"

	"github.com/furkan/fitness-center/backend/facility-service/internal/model"
	"github.com/furkan/fitness-center/backend/facility-service/internal/repository"
	"gorm.io/gorm"
)

type facilityRepository struct {
	db *gorm.DB
}

// NewFacilityRepository creates a new facility repository
func NewFacilityRepository(db *gorm.DB) repository.FacilityRepository {
	return &facilityRepository{db: db}
}

// Create adds a new facility record
func (r *facilityRepository) Create(ctx context.Context, facility *model.Facility) (*model.Facility, error) {
	if err := r.db.WithContext(ctx).Create(facility).Error; err != nil {
		return nil, fmt.Errorf("creating facility: %w", err)
	}
	return facility, nil
}

// GetByID retrieves facility by ID
func (r *facilityRepository) GetByID(ctx context.Context, id int) (*model.Facility, error) {
	var facility model.Facility
	if err := r.db.WithContext(ctx).Where("facility_id = ? AND is_deleted = ?", id, false).First(&facility).Error; err != nil {
		return nil, fmt.Errorf("getting facility by ID: %w", err)
	}
	return &facility, nil
}

// GetByName retrieves facility by name
func (r *facilityRepository) GetByName(ctx context.Context, name string) (*model.Facility, error) {
	var facility model.Facility
	if err := r.db.WithContext(ctx).Where("name = ? AND is_deleted = ?", name, false).First(&facility).Error; err != nil {
		return nil, fmt.Errorf("getting facility by name: %w", err)
	}
	return &facility, nil
}

// Update updates a facility record
func (r *facilityRepository) Update(ctx context.Context, facility *model.Facility) (*model.Facility, error) {
	// First check if the facility exists
	var existingFacility model.Facility
	if err := r.db.WithContext(ctx).Where("facility_id = ? AND is_deleted = ?", facility.FacilityID, false).First(&existingFacility).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("facility with ID %d not found", facility.FacilityID)
		}
		return nil, fmt.Errorf("checking facility existence: %w", err)
	}

	// Check if name already exists for a different facility
	if facility.Name != existingFacility.Name {
		var count int64
		r.db.WithContext(ctx).Model(&model.Facility{}).Where("name = ? AND facility_id != ? AND is_deleted = ?", facility.Name, facility.FacilityID, false).Count(&count)
		if count > 0 {
			return nil, fmt.Errorf("facility with name '%s' already exists", facility.Name)
		}
	}

	// Update only specific fields to avoid overwriting system fields
	result := r.db.WithContext(ctx).Model(&existingFacility).Updates(map[string]interface{}{
		"name":         facility.Name,
		"description":  facility.Description,
		"capacity":     facility.Capacity,
		"status":       facility.Status,
		"opening_hour": facility.OpeningHour,
		"closing_hour": facility.ClosingHour,
	})

	if result.Error != nil {
		return nil, fmt.Errorf("updating facility: %w", result.Error)
	}

	if result.RowsAffected == 0 {
		return nil, fmt.Errorf("facility with ID %d not found", facility.FacilityID)
	}

	// Return the updated facility
	facility.CreatedAt = existingFacility.CreatedAt
	return facility, nil
}

// Delete removes a facility record (soft delete)
func (r *facilityRepository) Delete(ctx context.Context, id int) error {
	result := r.db.WithContext(ctx).Model(&model.Facility{}).Where("facility_id = ?", id).Update("is_deleted", true)
	if result.Error != nil {
		return fmt.Errorf("soft deleting facility: %w", result.Error)
	}
	if result.RowsAffected == 0 {
		return fmt.Errorf("facility with ID %d not found", id)
	}
	return nil
}

// List retrieves facilities with filters
func (r *facilityRepository) List(ctx context.Context, filter map[string]interface{}, page, pageSize int) ([]*model.Facility, int, error) {
	var facilities []*model.Facility
	var total int64

	db := r.db.WithContext(ctx).Where("is_deleted = ?", false)

	// Apply filters
	for key, value := range filter {
		db = db.Where(fmt.Sprintf("%s = ?", key), value)
	}

	// Count total records
	if err := db.Model(&model.Facility{}).Count(&total).Error; err != nil {
		return nil, 0, fmt.Errorf("counting facilities: %w", err)
	}

	// Apply pagination
	offset := (page - 1) * pageSize
	if err := db.Offset(offset).Limit(pageSize).Order("facility_id").Find(&facilities).Error; err != nil {
		return nil, 0, fmt.Errorf("listing facilities: %w", err)
	}

	return facilities, int(total), nil
}

// ListByStatus retrieves facilities by status
func (r *facilityRepository) ListByStatus(ctx context.Context, status string, page, pageSize int) ([]*model.Facility, int, error) {
	return r.List(ctx, map[string]interface{}{"status": status}, page, pageSize)
}
