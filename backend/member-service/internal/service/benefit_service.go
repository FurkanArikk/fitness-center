package service

import (
	"context"
	"errors"

	"github.com/FurkanArikk/fitness-center/backend/member-service/internal/model"
)

var (
	ErrBenefitNotFound = errors.New("benefit not found")
	ErrInvalidBenefit  = errors.New("invalid benefit data")
)

// BenefitServiceImpl implements BenefitService
type BenefitServiceImpl struct {
	repo model.BenefitRepository
}

// NewBenefitService creates a new benefit service
func NewBenefitService(repo model.BenefitRepository) BenefitService {
	return &BenefitServiceImpl{
		repo: repo,
	}
}

// Create creates a new membership benefit
func (s *BenefitServiceImpl) Create(ctx context.Context, benefit *model.MembershipBenefit) error {
	if benefit == nil || benefit.MembershipID <= 0 || benefit.BenefitName == "" {
		return ErrInvalidBenefit
	}

	return s.repo.Create(ctx, benefit)
}

// GetByID retrieves a benefit by ID
func (s *BenefitServiceImpl) GetByID(ctx context.Context, id int64) (*model.MembershipBenefit, error) {
	if id <= 0 {
		return nil, ErrInvalidBenefit
	}

	benefit, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if benefit == nil {
		return nil, ErrBenefitNotFound
	}

	return benefit, nil
}

// Update updates an existing benefit
func (s *BenefitServiceImpl) Update(ctx context.Context, benefit *model.MembershipBenefit) error {
	if benefit == nil || benefit.ID <= 0 {
		return ErrInvalidBenefit
	}

	// Verify the benefit exists
	_, err := s.GetByID(ctx, benefit.ID)
	if err != nil {
		return err
	}

	return s.repo.Update(ctx, benefit)
}

// Delete removes a benefit
func (s *BenefitServiceImpl) Delete(ctx context.Context, id int64) error {
	if id <= 0 {
		return ErrInvalidBenefit
	}

	// Verify the benefit exists
	_, err := s.GetByID(ctx, id)
	if err != nil {
		return err
	}

	return s.repo.Delete(ctx, id)
}

// List retrieves all benefits for a membership
func (s *BenefitServiceImpl) List(ctx context.Context, membershipID int64) ([]*model.MembershipBenefit, error) {
	if membershipID <= 0 {
		return nil, ErrInvalidBenefit
	}

	return s.repo.GetByMembershipID(ctx, membershipID)
}

// ListAll retrieves all benefits across all memberships
func (s *BenefitServiceImpl) ListAll(ctx context.Context) ([]*model.MembershipBenefit, error) {
	return s.repo.ListAll(ctx)
}

// ListPaginated retrieves benefits for a membership with pagination
func (s *BenefitServiceImpl) ListPaginated(ctx context.Context, membershipID int64, page, pageSize int) ([]*model.MembershipBenefit, int, error) {
	if membershipID <= 0 {
		return nil, 0, ErrInvalidBenefit
	}

	if page < 1 {
		page = 1
	}
	if pageSize < 1 {
		pageSize = 10
	}

	// Calculate offset
	offset := (page - 1) * pageSize

	// Get the benefits
	benefits, err := s.repo.ListPaginated(ctx, membershipID, offset, pageSize)
	if err != nil {
		return nil, 0, err
	}

	// Get total count
	totalCount, err := s.repo.CountByMembership(ctx, membershipID)
	if err != nil {
		return nil, 0, err
	}

	return benefits, totalCount, nil
}

// ListAllPaginated retrieves all benefits with pagination
func (s *BenefitServiceImpl) ListAllPaginated(ctx context.Context, page, pageSize int) ([]*model.MembershipBenefit, int, error) {
	if page < 1 {
		page = 1
	}
	if pageSize < 1 {
		pageSize = 10
	}

	// Calculate offset
	offset := (page - 1) * pageSize

	// Get the benefits
	benefits, err := s.repo.ListAllPaginated(ctx, offset, pageSize)
	if err != nil {
		return nil, 0, err
	}

	// Get total count
	totalCount, err := s.repo.Count(ctx)
	if err != nil {
		return nil, 0, err
	}

	return benefits, totalCount, nil
}
