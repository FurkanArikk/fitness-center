package service

import (
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
func (s *StaffService) GetAll() ([]model.Staff, error) {
	return s.repo.GetAll()
}

// GetAllPaginated retrieves staff members with pagination
func (s *StaffService) GetAllPaginated(offset, limit int) ([]model.Staff, int, error) {
	return s.repo.GetAllPaginated(offset, limit)
}

// GetByID retrieves a staff member by ID
func (s *StaffService) GetByID(id int64) (*model.Staff, error) {
	return s.repo.GetByID(id)
}

// Create adds a new staff member
func (s *StaffService) Create(staff *model.Staff) (*model.Staff, error) {
	// Add any business logic/validation here
	return s.repo.Create(staff)
}

// Update modifies an existing staff member
func (s *StaffService) Update(staff *model.Staff) (*model.Staff, error) {
	// Add any business logic/validation here
	return s.repo.Update(staff)
}

// Delete removes a staff member
func (s *StaffService) Delete(id int64) error {
	// Add any business logic/validation here
	return s.repo.Delete(id)
}

// GetByEmail retrieves a staff member by email
func (s *StaffService) GetByEmail(email string) (*model.Staff, error) {
	return s.repo.GetByEmail(email)
}

// GetByPosition retrieves staff members by position
func (s *StaffService) GetByPosition(position string) ([]model.Staff, error) {
	return s.repo.GetByPosition(position)
}

// GetByStatus retrieves staff members by status
func (s *StaffService) GetByStatus(status string) ([]model.Staff, error) {
	return s.repo.GetByStatus(status)
}
