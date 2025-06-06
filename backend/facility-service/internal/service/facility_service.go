package service

import (
	"context"

	"github.com/FurkanArikk/fitness-center/backend/facility-service/internal/model"
	"github.com/FurkanArikk/fitness-center/backend/facility-service/internal/repository"
)

// FacilityService defines business operations for facilities
type FacilityService interface {
	Create(ctx context.Context, facility *model.Facility) (*model.Facility, error)
	GetByID(ctx context.Context, id int) (*model.Facility, error)
	GetByName(ctx context.Context, name string) (*model.Facility, error)
	Update(ctx context.Context, facility *model.Facility) (*model.Facility, error)
	Delete(ctx context.Context, id int) error
	List(ctx context.Context, filter map[string]interface{}, page, pageSize int) ([]*model.Facility, int, error)
	ListByStatus(ctx context.Context, status string, page, pageSize int) ([]*model.Facility, int, error)
}

// facilityService implements FacilityService
type facilityService struct {
	repo repository.Repository
}

// NewFacilityService creates a new facility service
func NewFacilityService(repo repository.Repository) FacilityService {
	return &facilityService{
		repo: repo,
	}
}

// Create adds a new facility record
func (s *facilityService) Create(ctx context.Context, facility *model.Facility) (*model.Facility, error) {
	// Add any business logic/validation here
	return s.repo.Facility().Create(ctx, facility)
}

// GetByID retrieves facility by ID
func (s *facilityService) GetByID(ctx context.Context, id int) (*model.Facility, error) {
	return s.repo.Facility().GetByID(ctx, id)
}

// GetByName retrieves facility by name
func (s *facilityService) GetByName(ctx context.Context, name string) (*model.Facility, error) {
	return s.repo.Facility().GetByName(ctx, name)
}

// Update updates a facility record
func (s *facilityService) Update(ctx context.Context, facility *model.Facility) (*model.Facility, error) {
	// Add any business logic/validation here
	return s.repo.Facility().Update(ctx, facility)
}

// Delete removes a facility record
func (s *facilityService) Delete(ctx context.Context, id int) error {
	return s.repo.Facility().Delete(ctx, id)
}

// List retrieves facilities with filters
func (s *facilityService) List(ctx context.Context, filter map[string]interface{}, page, pageSize int) ([]*model.Facility, int, error) {
	return s.repo.Facility().List(ctx, filter, page, pageSize)
}

// ListByStatus retrieves facilities by status
func (s *facilityService) ListByStatus(ctx context.Context, status string, page, pageSize int) ([]*model.Facility, int, error) {
	return s.repo.Facility().ListByStatus(ctx, status, page, pageSize)
}
