package service

import (
	"context"
	"errors"

	"github.com/FurkanArikk/fitness-center/backend/member-service/internal/model"
	"github.com/FurkanArikk/fitness-center/backend/member-service/internal/repository"
)

var (
	ErrMemberNotFound = errors.New("member not found")
	ErrInvalidMember  = errors.New("invalid member data")
	ErrEmailExists    = errors.New("email already exists")
)

// MemberServiceImpl implements MemberService
type MemberServiceImpl struct {
	repo repository.MemberRepository
}

// NewMemberService creates a new member service
func NewMemberService(repo repository.MemberRepository) MemberService {
	return &MemberServiceImpl{
		repo: repo,
	}
}

// Create creates a new member
func (s *MemberServiceImpl) Create(ctx context.Context, member *model.Member) error {
	if member == nil || member.Email == "" || member.FirstName == "" || member.LastName == "" {
		return ErrInvalidMember
	}

	// Check if email is already in use
	existingMember, _ := s.GetByEmail(ctx, member.Email)
	if existingMember != nil {
		return ErrEmailExists
	}

	// Set default status if not specified
	if member.Status == "" {
		member.Status = model.StatusActive
	} else if !model.IsValidStatus(member.Status) {
		return errors.New("invalid status: must be 'active', 'de_active', or 'hold_on'")
	}

	return s.repo.Create(ctx, member)
}

// GetByID retrieves a member by ID
func (s *MemberServiceImpl) GetByID(ctx context.Context, id int64) (*model.Member, error) {
	if id <= 0 {
		return nil, ErrInvalidMember
	}

	member, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if member == nil {
		return nil, ErrMemberNotFound
	}

	return member, nil
}

// Update updates an existing member
func (s *MemberServiceImpl) Update(ctx context.Context, member *model.Member) error {
	if member == nil || member.ID <= 0 {
		return ErrInvalidMember
	}

	// Verify the member exists
	existingMember, err := s.GetByID(ctx, member.ID)
	if err != nil {
		return err
	}

	// Check if email is being changed and if it's already in use
	if member.Email != existingMember.Email {
		emailCheck, _ := s.GetByEmail(ctx, member.Email)
		if emailCheck != nil {
			return ErrEmailExists
		}
	}

	// Validate status if being updated
	if member.Status != "" && !model.IsValidStatus(member.Status) {
		return errors.New("invalid status: must be 'active', 'de_active', or 'hold_on'")
	}

	return s.repo.Update(ctx, member)
}

// Delete removes a member
func (s *MemberServiceImpl) Delete(ctx context.Context, id int64) error {
	if id <= 0 {
		return ErrInvalidMember
	}

	// Verify the member exists
	_, err := s.GetByID(ctx, id)
	if err != nil {
		return err
	}

	return s.repo.Delete(ctx, id)
}

// List retrieves a paginated list of members
func (s *MemberServiceImpl) List(ctx context.Context, page, pageSize int) ([]*model.Member, int, error) {
	if page < 1 {
		page = 1
	}
	if pageSize < 1 {
		pageSize = 10
	}

	// Calculate offset based on page and pageSize
	offset := (page - 1) * pageSize

	// Get the members
	members, err := s.repo.List(ctx, offset, pageSize)
	if err != nil {
		return nil, 0, err
	}

	// Get total count
	totalCount, err := s.repo.Count(ctx)
	if err != nil {
		return nil, 0, err
	}

	return members, totalCount, nil
}

// GetByEmail retrieves a member by email
func (s *MemberServiceImpl) GetByEmail(ctx context.Context, email string) (*model.Member, error) {
	if email == "" {
		return nil, ErrInvalidMember
	}

	return s.repo.GetByEmail(ctx, email)
}
