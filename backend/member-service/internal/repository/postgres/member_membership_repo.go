package postgres

import (
	"context"
	"errors"
	"fmt"

	"github.com/FurkanArikk/fitness-center/backend/member-service/internal/model"
	"gorm.io/gorm"
)

// MemberMembershipRepository implements model.MemberMembershipRepository interface
type MemberMembershipRepository struct {
	db *gorm.DB
}

// NewMemberMembershipRepository creates a new MemberMembershipRepository
func NewMemberMembershipRepository(db *gorm.DB) model.MemberMembershipRepository {
	return &MemberMembershipRepository{db: db}
}

// Create adds a new member-membership relationship to the database
func (r *MemberMembershipRepository) Create(ctx context.Context, memberMembership *model.MemberMembership) error {
	if err := r.db.WithContext(ctx).Create(memberMembership).Error; err != nil {
		return fmt.Errorf("creating member membership: %w", err)
	}
	return nil
}

// GetByID retrieves a member-membership relationship by their ID
func (r *MemberMembershipRepository) GetByID(ctx context.Context, id int64) (*model.MemberMembership, error) {
	var memberMembership model.MemberMembership
	if err := r.db.WithContext(ctx).Where("member_membership_id = ?", id).First(&memberMembership).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("member membership not found")
		}
		return nil, fmt.Errorf("getting member membership by ID: %w", err)
	}
	return &memberMembership, nil
}

// Update updates member-membership relationship information
func (r *MemberMembershipRepository) Update(ctx context.Context, memberMembership *model.MemberMembership) error {
	result := r.db.WithContext(ctx).Model(memberMembership).Where("member_membership_id = ?", memberMembership.ID).Updates(memberMembership)
	if result.Error != nil {
		return fmt.Errorf("updating member membership: %w", result.Error)
	}
	if result.RowsAffected == 0 {
		return fmt.Errorf("member membership not found")
	}
	return nil
}

// Delete removes a member-membership relationship by their ID
func (r *MemberMembershipRepository) Delete(ctx context.Context, id int64) error {
	result := r.db.WithContext(ctx).Where("member_membership_id = ?", id).Delete(&model.MemberMembership{})
	if result.Error != nil {
		return fmt.Errorf("deleting member membership: %w", result.Error)
	}
	if result.RowsAffected == 0 {
		return fmt.Errorf("member membership not found")
	}
	return nil
}

// ListByMemberID retrieves all membership relationships for a specific member
func (r *MemberMembershipRepository) ListByMemberID(ctx context.Context, memberID int64) ([]*model.MemberMembership, error) {
	var memberMemberships []*model.MemberMembership
	if err := r.db.WithContext(ctx).Where("member_id = ?", memberID).Order("member_membership_id").Find(&memberMemberships).Error; err != nil {
		return nil, fmt.Errorf("listing member memberships by member ID: %w", err)
	}
	return memberMemberships, nil
}

// GetActiveMembership retrieves the active membership for a specific member
func (r *MemberMembershipRepository) GetActiveMembership(ctx context.Context, memberID int64) (*model.MemberMembership, error) {
	var memberMembership model.MemberMembership
	if err := r.db.WithContext(ctx).Where("member_id = ? AND end_date > NOW() AND payment_status = 'paid'", memberID).First(&memberMembership).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("active membership not found")
		}
		return nil, fmt.Errorf("getting active member membership: %w", err)
	}
	return &memberMembership, nil
}

// GetByMemberID retrieves all membership relationships for a specific member (alias for ListByMemberID)
func (r *MemberMembershipRepository) GetByMemberID(ctx context.Context, memberID int64) ([]*model.MemberMembership, error) {
	return r.ListByMemberID(ctx, memberID)
}
