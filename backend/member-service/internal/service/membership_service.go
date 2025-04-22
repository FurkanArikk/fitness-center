package service

import (
	"context"
	"errors"

	"github.com/FurkanArikk/fitness-center/backend/member-service/internal/model"
	"github.com/FurkanArikk/fitness-center/backend/member-service/internal/repository"
)

var (
	ErrMembershipNotFound = errors.New("membership not found")
	ErrInvalidMembership  = errors.New("invalid membership data")
	ErrMembershipExists   = errors.New("membership with this name already exists")
)

// MembershipServiceImpl implements MembershipService
type MembershipServiceImpl struct {
	repo repository.MembershipRepository
}

// NewMembershipService creates a new membership service
func NewMembershipService(repo repository.MembershipRepository) MembershipService {
	return &MembershipServiceImpl{
		repo: repo,
	}
}

// Create creates a new membership
func (s *MembershipServiceImpl) Create(ctx context.Context, membership *model.Membership) error {
	if membership == nil || membership.MembershipName == "" || membership.Duration <= 0 || membership.Price < 0 {
		return ErrInvalidMembership
	}

	// Check if a membership with the same name exists
	existing, err := s.repo.GetByName(ctx, membership.MembershipName)
	if err == nil && existing != nil {
		return ErrMembershipExists
	}

	return s.repo.Create(ctx, membership)
}

// GetByID retrieves a membership by ID
func (s *MembershipServiceImpl) GetByID(ctx context.Context, id int64) (*model.Membership, error) {
	if id <= 0 {
		return nil, ErrInvalidMembership
	}

	membership, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if membership == nil {
		return nil, ErrMembershipNotFound
	}

	return membership, nil
}

// Update updates an existing membership
func (s *MembershipServiceImpl) Update(ctx context.Context, membership *model.Membership) error {
	if membership == nil || membership.ID <= 0 { // Changed from membership.MembershipID to membership.ID
		return ErrInvalidMembership
	}

	// Verify the membership exists
	existing, err := s.GetByID(ctx, membership.ID) // Changed from membership.MembershipID to membership.ID
	if err != nil {
		return err
	}

	// Check if name is being changed and if it's already in use
	if membership.MembershipName != existing.MembershipName {
		nameCheck, _ := s.repo.GetByName(ctx, membership.MembershipName)
		if nameCheck != nil {
			return ErrMembershipExists
		}
	}

	return s.repo.Update(ctx, membership)
}

// Delete removes a membership
func (s *MembershipServiceImpl) Delete(ctx context.Context, id int64) error {
	if id <= 0 {
		return ErrInvalidMembership
	}

	// Verify the membership exists
	_, err := s.GetByID(ctx, id)
	if err != nil {
		return err
	}

	// Check if membership is in use by any members
	inUse, err := s.repo.IsMembershipInUse(ctx, id)
	if err != nil {
		return err
	}
	if inUse {
		return errors.New("cannot delete a membership that is in use by members")
	}

	return s.repo.Delete(ctx, id)
}

// List retrieves a paginated list of memberships
func (s *MembershipServiceImpl) List(ctx context.Context, page, pageSize int) ([]*model.Membership, error) {
	if page < 1 {
		page = 1
	}
	if pageSize < 1 {
		pageSize = 10
	}

	return s.repo.List(ctx, page, pageSize)
}

// GetActiveOnes retrieves all active memberships
func (s *MembershipServiceImpl) GetActiveOnes(ctx context.Context) ([]*model.Membership, error) {
	return s.repo.GetActive(ctx)
}

// UpdateStatus updates the active status of a membership
func (s *MembershipServiceImpl) UpdateStatus(ctx context.Context, id int64, isActive bool) error {
	if id <= 0 {
		return ErrInvalidMembership
	}

	// Verify the membership exists
	_, err := s.GetByID(ctx, id)
	if err != nil {
		return err
	}

	return s.repo.UpdateStatus(ctx, id, isActive)
}

// GetAll gets all memberships with optional active filter
func (s *MembershipServiceImpl) GetAll(ctx context.Context, activeOnly bool) ([]*model.Membership, error) {
	if activeOnly {
		return s.repo.GetActive(ctx)
	}
	return s.repo.GetAll(ctx)
}
