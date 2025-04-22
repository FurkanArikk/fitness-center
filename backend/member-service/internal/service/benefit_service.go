package service

import (
	"context"
	"errors"

	"github.com/FurkanArikk/fitness-center/backend/member-service/internal/model"
	"github.com/FurkanArikk/fitness-center/backend/member-service/internal/repository"
)

var (
	ErrBenefitNotFound = errors.New("benefit not found")
	ErrInvalidBenefit  = errors.New("invalid benefit data")
)

// BenefitServiceImpl implements BenefitService
type BenefitServiceImpl struct {
	repo repository.BenefitRepository
}

// NewBenefitService creates a new benefit service
func NewBenefitService(repo repository.BenefitRepository) BenefitService {
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
