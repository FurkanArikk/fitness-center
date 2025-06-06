package service

import (
	"context"

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
func (s *QualificationService) GetAll(ctx context.Context) ([]model.Qualification, error) {
	return s.repo.GetAll(ctx)
}

// GetAllPaginated retrieves qualifications with pagination
func (s *QualificationService) GetAllPaginated(ctx context.Context, offset, limit int) ([]model.Qualification, int, error) {
	return s.repo.GetAllPaginated(ctx, offset, limit)
}

// GetByID retrieves a qualification by ID
func (s *QualificationService) GetByID(ctx context.Context, id int64) (*model.Qualification, error) {
	return s.repo.GetByID(ctx, id)
}

// GetByStaffID retrieves all qualifications for a staff member
func (s *QualificationService) GetByStaffID(ctx context.Context, staffID int64) ([]model.Qualification, error) {
	return s.repo.GetByStaffID(ctx, staffID)
}

// GetByStaffIDPaginated retrieves qualifications for a staff member with pagination
func (s *QualificationService) GetByStaffIDPaginated(ctx context.Context, staffID int64, offset, limit int) ([]model.Qualification, int, error) {
	return s.repo.GetByStaffIDPaginated(ctx, staffID, offset, limit)
}

// Create adds a new qualification
func (s *QualificationService) Create(ctx context.Context, qualification *model.Qualification) (*model.Qualification, error) {
	// Convert to request for repository
	request := &model.QualificationRequest{
		StaffID:           qualification.StaffID,
		QualificationName: qualification.QualificationName,
		IssuingAuthority:  qualification.IssuingAuthority,
		IssueDate:         qualification.IssueDate,
		ExpiryDate:        qualification.ExpiryDate,
	}
	return s.repo.Create(ctx, request)
}

// Update modifies an existing qualification
func (s *QualificationService) Update(ctx context.Context, qualification *model.Qualification) (*model.Qualification, error) {
	// Convert to request for repository
	request := &model.QualificationRequest{
		StaffID:           qualification.StaffID,
		QualificationName: qualification.QualificationName,
		IssuingAuthority:  qualification.IssuingAuthority,
		IssueDate:         qualification.IssueDate,
		ExpiryDate:        qualification.ExpiryDate,
	}
	return s.repo.Update(ctx, qualification.QualificationID, request)
}

// Delete removes a qualification
func (s *QualificationService) Delete(ctx context.Context, id int64) error {
	return s.repo.Delete(ctx, id)
}

// GetExpiringSoon retrieves qualifications expiring within the specified number of days
func (s *QualificationService) GetExpiringSoon(ctx context.Context, days int) ([]model.Qualification, error) {
	return s.repo.GetExpiringSoon(ctx, days)
}
