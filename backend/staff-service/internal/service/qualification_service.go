package service

import (
	"github.com/FurkanArikk/fitness-center/backend/staff-service/internal/model"
)

// QualificationService implements business logic for qualification operations
type QualificationService struct {
	repo model.QualificationRepository
}

// NewQualificationService creates a new QualificationService
func NewQualificationService(repo model.QualificationRepository) *QualificationService {
	return &QualificationService{repo: repo}
}

// GetAll retrieves all qualifications
func (s *QualificationService) GetAll() ([]model.Qualification, error) {
	return s.repo.GetAll()
}

// GetAllPaginated retrieves qualifications with pagination
func (s *QualificationService) GetAllPaginated(offset, limit int) ([]model.Qualification, int, error) {
	return s.repo.GetAllPaginated(offset, limit)
}

// GetByID retrieves a qualification by ID
func (s *QualificationService) GetByID(id int64) (*model.Qualification, error) {
	return s.repo.GetByID(id)
}

// GetByStaffID retrieves all qualifications for a staff member
func (s *QualificationService) GetByStaffID(staffID int64) ([]model.Qualification, error) {
	return s.repo.GetByStaffID(staffID)
}

// GetByStaffIDPaginated retrieves qualifications for a staff member with pagination
func (s *QualificationService) GetByStaffIDPaginated(staffID int64, offset, limit int) ([]model.Qualification, int, error) {
	return s.repo.GetByStaffIDPaginated(staffID, offset, limit)
}

// Create adds a new qualification
func (s *QualificationService) Create(qualification *model.Qualification) (*model.Qualification, error) {
	// Add any business logic/validation here
	return s.repo.Create(qualification)
}

// Update modifies an existing qualification
func (s *QualificationService) Update(qualification *model.Qualification) (*model.Qualification, error) {
	// Add any business logic/validation here
	return s.repo.Update(qualification)
}

// Delete removes a qualification
func (s *QualificationService) Delete(id int64) error {
	// Add any business logic/validation here
	return s.repo.Delete(id)
}

// GetExpiringSoon retrieves qualifications expiring within the specified number of days
func (s *QualificationService) GetExpiringSoon(days int) ([]model.Qualification, error) {
	return s.repo.GetExpiringSoon(days)
}
