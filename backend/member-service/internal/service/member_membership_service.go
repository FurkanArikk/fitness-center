package service

import (
	"context"
	"errors"
	"strings"

	"github.com/FurkanArikk/fitness-center/backend/member-service/internal/model"
	"github.com/FurkanArikk/fitness-center/backend/member-service/internal/repository"
)

var (
	ErrMemberMembershipNotFound = errors.New("member membership not found")
	ErrInvalidMemberMembership  = errors.New("invalid member membership data")
)

// MemberMembershipServiceImpl implements MemberMembershipService
type MemberMembershipServiceImpl struct {
	repo repository.MemberMembershipRepository
}

// NewMemberMembershipService creates a new member membership service
func NewMemberMembershipService(repo repository.MemberMembershipRepository) MemberMembershipService {
	return &MemberMembershipServiceImpl{
		repo: repo,
	}
}

// Create creates a new member-membership relationship
func (s *MemberMembershipServiceImpl) Create(ctx context.Context, memberMembership *model.MemberMembership) error {
	if memberMembership == nil ||
		memberMembership.MemberID <= 0 ||
		memberMembership.MembershipID <= 0 ||
		memberMembership.StartDate.IsZero() ||
		memberMembership.EndDate.IsZero() {
		return ErrInvalidMemberMembership
	}

	// Validate dates
	if memberMembership.EndDate.Before(memberMembership.StartDate) {
		return errors.New("end date cannot be before start date")
	}

	return s.repo.Create(ctx, memberMembership)
}

// GetByID retrieves a member membership by ID
func (s *MemberMembershipServiceImpl) GetByID(ctx context.Context, id int64) (*model.MemberMembership, error) {
	if id <= 0 {
		return nil, ErrInvalidMemberMembership
	}

	memberMembership, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if memberMembership == nil {
		return nil, ErrMemberMembershipNotFound
	}

	return memberMembership, nil
}

// Update updates an existing member-membership relationship
func (s *MemberMembershipServiceImpl) Update(ctx context.Context, memberMembership *model.MemberMembership) error {
	if memberMembership == nil || memberMembership.ID <= 0 {
		return ErrInvalidMemberMembership
	}

	// Verify the member membership exists
	_, err := s.GetByID(ctx, memberMembership.ID)
	if err != nil {
		return err
	}

	// Validate dates
	if !memberMembership.EndDate.IsZero() && !memberMembership.StartDate.IsZero() {
		if memberMembership.EndDate.Before(memberMembership.StartDate) {
			return errors.New("end date cannot be before start date")
		}
	}

	return s.repo.Update(ctx, memberMembership)
}

// Delete removes a member-membership relationship
func (s *MemberMembershipServiceImpl) Delete(ctx context.Context, id int64) error {
	if id <= 0 {
		return ErrInvalidMemberMembership
	}

	// Verify the member membership exists
	_, err := s.GetByID(ctx, id)
	if err != nil {
		return err
	}

	return s.repo.Delete(ctx, id)
}

// ListByMemberID retrieves all memberships for a member
func (s *MemberMembershipServiceImpl) ListByMemberID(ctx context.Context, memberID int64) ([]*model.MemberMembership, error) {
	if memberID <= 0 {
		return nil, ErrInvalidMemberMembership
	}

	return s.repo.GetByMemberID(ctx, memberID)
}

// GetActiveMembership retrieves the active membership for a member
func (s *MemberMembershipServiceImpl) GetActiveMembership(ctx context.Context, memberID int64) (*model.MemberMembership, error) {
	if memberID <= 0 {
		return nil, ErrInvalidMemberMembership
	}

	membership, err := s.repo.GetActiveMembership(ctx, memberID)
	if err != nil {
		// Check if this is a "no rows" error
		if strings.Contains(err.Error(), "sql: no rows") {
			return nil, ErrMemberMembershipNotFound
		}
		return nil, err
	}

	return membership, nil
}
