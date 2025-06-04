package postgres

import (
	"context"
	"fmt"
	"time"

	"github.com/FurkanArikk/fitness-center/backend/facility-service/internal/model"
	"github.com/FurkanArikk/fitness-center/backend/facility-service/internal/repository"
	"gorm.io/gorm"
)

type equipmentRepository struct {
	db *gorm.DB
}

// NewEquipmentRepository creates a new equipment repository
func NewEquipmentRepository(db *gorm.DB) repository.EquipmentRepository {
	return &equipmentRepository{db: db}
}

// Create adds a new equipment record
func (r *equipmentRepository) Create(ctx context.Context, equipment *model.Equipment) (*model.Equipment, error) {
	if err := r.db.WithContext(ctx).Create(equipment).Error; err != nil {
		return nil, fmt.Errorf("creating equipment: %w", err)
	}
	return equipment, nil
}

// GetByID retrieves equipment by ID
func (r *equipmentRepository) GetByID(ctx context.Context, id int) (*model.Equipment, error) {
	var equipment model.Equipment
	if err := r.db.WithContext(ctx).Where("equipment_id = ?", id).First(&equipment).Error; err != nil {
		return nil, fmt.Errorf("getting equipment by ID: %w", err)
	}
	return &equipment, nil
}

// Update updates an equipment record
func (r *equipmentRepository) Update(ctx context.Context, equipment *model.Equipment) (*model.Equipment, error) {
	if err := r.db.WithContext(ctx).Save(equipment).Error; err != nil {
		return nil, fmt.Errorf("updating equipment: %w", err)
	}
	return equipment, nil
}

// Delete removes an equipment record
func (r *equipmentRepository) Delete(ctx context.Context, id int) error {
	result := r.db.WithContext(ctx).Delete(&model.Equipment{}, id)
	if result.Error != nil {
		return fmt.Errorf("deleting equipment: %w", result.Error)
	}
	if result.RowsAffected == 0 {
		return fmt.Errorf("equipment with ID %d not found", id)
	}
	return nil
}

// List retrieves equipment with filters and pagination
func (r *equipmentRepository) List(ctx context.Context, filter map[string]interface{}, page, pageSize int) ([]*model.Equipment, int, error) {
	var equipment []*model.Equipment
	var total int64

	db := r.db.WithContext(ctx).Model(&model.Equipment{})

	// Apply filters
	for key, value := range filter {
		db = db.Where(fmt.Sprintf("%s = ?", key), value)
	}

	// Count total records
	if err := db.Count(&total).Error; err != nil {
		return nil, 0, fmt.Errorf("counting equipment: %w", err)
	}

	// Apply pagination
	offset := (page - 1) * pageSize
	if err := db.Offset(offset).Limit(pageSize).Order("equipment_id").Find(&equipment).Error; err != nil {
		return nil, 0, fmt.Errorf("listing equipment: %w", err)
	}

	return equipment, int(total), nil
}

// ListByCategory retrieves equipment by category
func (r *equipmentRepository) ListByCategory(ctx context.Context, category string, page, pageSize int) ([]*model.Equipment, int, error) {
	return r.List(ctx, map[string]interface{}{"category": category}, page, pageSize)
}

// ListByStatus retrieves equipment by status
func (r *equipmentRepository) ListByStatus(ctx context.Context, status string, page, pageSize int) ([]*model.Equipment, int, error) {
	return r.List(ctx, map[string]interface{}{"status": status}, page, pageSize)
}

// ListByMaintenanceDue retrieves equipment needing maintenance by a specific date
func (r *equipmentRepository) ListByMaintenanceDue(ctx context.Context, date string, page, pageSize int) ([]*model.Equipment, int, error) {
	var equipment []*model.Equipment
	var total int64

	parsedDate, err := time.Parse("2006-01-02", date)
	if err != nil {
		return nil, 0, fmt.Errorf("parsing date: %w", err)
	}

	db := r.db.WithContext(ctx).Model(&model.Equipment{}).Where("next_maintenance_date <= ?", parsedDate)

	// Count total records
	if err := db.Count(&total).Error; err != nil {
		return nil, 0, fmt.Errorf("counting equipment needing maintenance: %w", err)
	}

	// Apply pagination
	offset := (page - 1) * pageSize
	if err := db.Offset(offset).Limit(pageSize).Order("next_maintenance_date").Find(&equipment).Error; err != nil {
		return nil, 0, fmt.Errorf("listing equipment needing maintenance: %w", err)
	}

	return equipment, int(total), nil
}
