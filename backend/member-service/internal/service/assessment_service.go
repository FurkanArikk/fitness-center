package service

import (
	"context"
	"errors"

	"github.com/FurkanArikk/fitness-center/backend/member-service/internal/model"
	"github.com/FurkanArikk/fitness-center/backend/member-service/internal/repository"
)

var (
	ErrAssessmentNotFound = errors.New("assessment not found")
	ErrInvalidAssessment  = errors.New("invalid assessment data")
)

// AssessmentServiceImpl implements FitnessAssessmentService
type AssessmentServiceImpl struct {
	repo repository.AssessmentRepository
}

// NewAssessmentService creates a new assessment service
func NewAssessmentService(repo repository.AssessmentRepository) FitnessAssessmentService {
	return &AssessmentServiceImpl{
		repo: repo,
	}
}

// Create creates a new fitness assessment
func (s *AssessmentServiceImpl) Create(ctx context.Context, assessment *model.FitnessAssessment) error {
	if assessment == nil || assessment.MemberID <= 0 || assessment.TrainerID <= 0 {
		return ErrInvalidAssessment
	}

	return s.repo.Create(ctx, assessment)
}

// GetByID retrieves an assessment by ID
func (s *AssessmentServiceImpl) GetByID(ctx context.Context, id int64) (*model.FitnessAssessment, error) {
	if id <= 0 {
		return nil, ErrInvalidAssessment
	}

	assessment, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if assessment == nil {
		return nil, ErrAssessmentNotFound
	}

	return assessment, nil
}

// Update updates an existing assessment
func (s *AssessmentServiceImpl) Update(ctx context.Context, assessment *model.FitnessAssessment) error {
	if assessment == nil || assessment.ID <= 0 {
		return ErrInvalidAssessment
	}

	// Verify the assessment exists
	_, err := s.GetByID(ctx, assessment.ID)
	if err != nil {
		return err
	}

	return s.repo.Update(ctx, assessment)
}

// Delete removes an assessment
func (s *AssessmentServiceImpl) Delete(ctx context.Context, id int64) error {
	if id <= 0 {
		return ErrInvalidAssessment
	}

	// Verify the assessment exists
	_, err := s.GetByID(ctx, id)
	if err != nil {
		return err
	}

	return s.repo.Delete(ctx, id)
}

// ListByMemberID retrieves all assessments for a member
func (s *AssessmentServiceImpl) ListByMemberID(ctx context.Context, memberID int64) ([]*model.FitnessAssessment, error) {
	if memberID <= 0 {
		return nil, ErrInvalidAssessment
	}

	return s.repo.GetByMemberID(ctx, memberID)
}

// GetLatestByMemberID retrieves the most recent assessment for a member
func (s *AssessmentServiceImpl) GetLatestByMemberID(ctx context.Context, memberID int64) (*model.FitnessAssessment, error) {
	if memberID <= 0 {
		return nil, ErrInvalidAssessment
	}

	return s.repo.GetLatestByMemberID(ctx, memberID)
}
