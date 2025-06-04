package service

import (
	"context"

	"github.com/FurkanArikk/fitness-center/backend/facility-service/internal/model"
	"github.com/FurkanArikk/fitness-center/backend/facility-service/internal/repository"
)

// EquipmentService defines business operations for equipment
type EquipmentService interface {
	Create(ctx context.Context, equipment *model.Equipment) (*model.Equipment, error)
	GetByID(ctx context.Context, id int) (*model.Equipment, error)
	Update(ctx context.Context, equipment *model.Equipment) (*model.Equipment, error)
	Delete(ctx context.Context, id int) error
	List(ctx context.Context, filter map[string]interface{}, page, pageSize int) ([]*model.Equipment, int, error)
	ListByCategory(ctx context.Context, category string, page, pageSize int) ([]*model.Equipment, int, error)
	ListByStatus(ctx context.Context, status string, page, pageSize int) ([]*model.Equipment, int, error)
	ListByMaintenanceDue(ctx context.Context, date string, page, pageSize int) ([]*model.Equipment, int, error)
}

// equipmentService implements EquipmentService
type equipmentService struct {
	repo repository.Repository
}

// NewEquipmentService creates a new equipment service
func NewEquipmentService(repo repository.Repository) EquipmentService {
	return &equipmentService{
		repo: repo,
	}
}

// Create adds a new equipment record
func (s *equipmentService) Create(ctx context.Context, equipment *model.Equipment) (*model.Equipment, error) {
	// Add any business logic/validation here
	return s.repo.Equipment().Create(ctx, equipment)
}

// GetByID retrieves equipment by ID
func (s *equipmentService) GetByID(ctx context.Context, id int) (*model.Equipment, error) {
	return s.repo.Equipment().GetByID(ctx, id)
}

// Update updates an equipment record
func (s *equipmentService) Update(ctx context.Context, equipment *model.Equipment) (*model.Equipment, error) {
	// Add any business logic/validation here
	return s.repo.Equipment().Update(ctx, equipment)
}

// Delete removes an equipment record
func (s *equipmentService) Delete(ctx context.Context, id int) error {
	return s.repo.Equipment().Delete(ctx, id)
}

// List retrieves equipment with filters
func (s *equipmentService) List(ctx context.Context, filter map[string]interface{}, page, pageSize int) ([]*model.Equipment, int, error) {
	return s.repo.Equipment().List(ctx, filter, page, pageSize)
}

// ListByCategory retrieves equipment by category
func (s *equipmentService) ListByCategory(ctx context.Context, category string, page, pageSize int) ([]*model.Equipment, int, error) {
	return s.repo.Equipment().ListByCategory(ctx, category, page, pageSize)
}

// ListByStatus retrieves equipment by status
func (s *equipmentService) ListByStatus(ctx context.Context, status string, page, pageSize int) ([]*model.Equipment, int, error) {
	return s.repo.Equipment().ListByStatus(ctx, status, page, pageSize)
}

// ListByMaintenanceDue retrieves equipment by next maintenance date
func (s *equipmentService) ListByMaintenanceDue(ctx context.Context, date string, page, pageSize int) ([]*model.Equipment, int, error) {
	return s.repo.Equipment().ListByMaintenanceDue(ctx, date, page, pageSize)
}
