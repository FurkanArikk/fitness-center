package service

import (
	"context"

	"github.com/FurkanArikk/fitness-center/backend/staff-service/internal/model"
)

// StaffService implements business logic for staff operations
type StaffService struct {
	repo model.StaffRepository
}

// NewStaffService creates a new StaffService
func NewStaffService(repo model.StaffRepository) *StaffService {
	return &StaffService{repo: repo}
}

// GetAll retrieves all staff members
func (s *StaffService) GetAll(ctx context.Context) ([]model.Staff, error) {
	return s.repo.GetAll(ctx)
}

// GetAllPaginated retrieves staff members with pagination
func (s *StaffService) GetAllPaginated(ctx context.Context, offset, limit int) ([]model.Staff, int, error) {
	return s.repo.GetAllPaginated(ctx, offset, limit)
}

// GetByID retrieves a staff member by ID
func (s *StaffService) GetByID(ctx context.Context, id int64) (*model.Staff, error) {
	return s.repo.GetByID(ctx, id)
}

// Create adds a new staff member
func (s *StaffService) Create(ctx context.Context, staff *model.Staff) (*model.Staff, error) {
	// Add any business logic/validation here
	return s.repo.Create(ctx, staff)
}

// Update modifies an existing staff member
func (s *StaffService) Update(ctx context.Context, staff *model.Staff) (*model.Staff, error) {
	// Add any business logic/validation here
	return s.repo.Update(ctx, staff)
}

// Delete removes a staff member
func (s *StaffService) Delete(ctx context.Context, id int64) error {
	// Add any business logic/validation here
	return s.repo.Delete(ctx, id)
}

// GetByEmail retrieves a staff member by email
func (s *StaffService) GetByEmail(ctx context.Context, email string) (*model.Staff, error) {
	return s.repo.GetByEmail(ctx, email)
}

// GetByPosition retrieves staff members by position
func (s *StaffService) GetByPosition(ctx context.Context, position string) ([]model.Staff, error) {
	return s.repo.GetByPosition(ctx, position)
}

// GetByStatus retrieves staff members by status
func (s *StaffService) GetByStatus(ctx context.Context, status string) ([]model.Staff, error) {
	return s.repo.GetByStatus(ctx, status)
}
