package postgres

import (
	"context"
	"errors"
	"fmt"

	"github.com/FurkanArikk/fitness-center/backend/member-service/internal/model"
	"gorm.io/gorm"
)

// MembershipRepository implements model.MembershipRepository interface
type MembershipRepository struct {
	db *gorm.DB
}

// NewMembershipRepository creates a new MembershipRepository
func NewMembershipRepository(db *gorm.DB) model.MembershipRepository {
	return &MembershipRepository{db: db}
}

// Create adds a new membership to the database
func (r *MembershipRepository) Create(ctx context.Context, membership *model.Membership) error {
	if err := r.db.WithContext(ctx).Create(membership).Error; err != nil {
		return fmt.Errorf("creating membership: %w", err)
	}
	return nil
}

// GetByID retrieves a membership by their ID
func (r *MembershipRepository) GetByID(ctx context.Context, id int64) (*model.Membership, error) {
	var membership model.Membership
	if err := r.db.WithContext(ctx).Where("membership_id = ?", id).First(&membership).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("membership not found")
		}
		return nil, fmt.Errorf("getting membership by ID: %w", err)
	}
	return &membership, nil
}

// Update updates membership information
func (r *MembershipRepository) Update(ctx context.Context, membership *model.Membership) error {
	result := r.db.WithContext(ctx).Model(membership).Where("membership_id = ?", membership.ID).Updates(membership)
	if result.Error != nil {
		return fmt.Errorf("updating membership: %w", result.Error)
	}
	if result.RowsAffected == 0 {
		return fmt.Errorf("membership not found")
	}
	return nil
}

// Delete removes a membership by their ID
func (r *MembershipRepository) Delete(ctx context.Context, id int64) error {
	result := r.db.WithContext(ctx).Where("membership_id = ?", id).Delete(&model.Membership{})
	if result.Error != nil {
		return fmt.Errorf("deleting membership: %w", result.Error)
	}
	if result.RowsAffected == 0 {
		return fmt.Errorf("membership not found")
	}
	return nil
}

// List retrieves a paginated list of memberships
func (r *MembershipRepository) List(ctx context.Context, offset, limit int) ([]*model.Membership, error) {
	var memberships []*model.Membership
	if err := r.db.WithContext(ctx).Offset(offset).Limit(limit).Order("membership_id").Find(&memberships).Error; err != nil {
		return nil, fmt.Errorf("listing memberships: %w", err)
	}
	return memberships, nil
}

// Count returns the total number of memberships
func (r *MembershipRepository) Count(ctx context.Context) (int, error) {
	var count int64
	if err := r.db.WithContext(ctx).Model(&model.Membership{}).Count(&count).Error; err != nil {
		return 0, fmt.Errorf("counting memberships: %w", err)
	}
	return int(count), nil
}

// GetActiveOnes retrieves all active memberships
func (r *MembershipRepository) GetActiveOnes(ctx context.Context) ([]*model.Membership, error) {
	var memberships []*model.Membership
	if err := r.db.WithContext(ctx).Where("is_active = ?", true).Find(&memberships).Error; err != nil {
		return nil, fmt.Errorf("getting active memberships: %w", err)
	}
	return memberships, nil
}

// GetActive retrieves all active memberships (alias for GetActiveOnes)
func (r *MembershipRepository) GetActive(ctx context.Context) ([]*model.Membership, error) {
	return r.GetActiveOnes(ctx)
}

// GetByName retrieves a membership by name
func (r *MembershipRepository) GetByName(ctx context.Context, name string) (*model.Membership, error) {
	var membership model.Membership
	if err := r.db.WithContext(ctx).Where("membership_name = ?", name).First(&membership).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("membership not found")
		}
		return nil, fmt.Errorf("getting membership by name: %w", err)
	}
	return &membership, nil
}

// GetAll retrieves all memberships
func (r *MembershipRepository) GetAll(ctx context.Context) ([]*model.Membership, error) {
	var memberships []*model.Membership
	if err := r.db.WithContext(ctx).Find(&memberships).Error; err != nil {
		return nil, fmt.Errorf("getting all memberships: %w", err)
	}
	return memberships, nil
}

// UpdateStatus updates the active status of a membership
func (r *MembershipRepository) UpdateStatus(ctx context.Context, id int64, isActive bool) error {
	result := r.db.WithContext(ctx).Model(&model.Membership{}).Where("membership_id = ?", id).Update("is_active", isActive)
	if result.Error != nil {
		return fmt.Errorf("updating membership status: %w", result.Error)
	}
	if result.RowsAffected == 0 {
		return fmt.Errorf("membership not found")
	}
	return nil
}

// IsMembershipInUse checks if a membership is currently being used by any members
func (r *MembershipRepository) IsMembershipInUse(ctx context.Context, id int64) (bool, error) {
	var count int64
	if err := r.db.WithContext(ctx).Model(&model.MemberMembership{}).Where("membership_id = ?", id).Count(&count).Error; err != nil {
		return false, fmt.Errorf("checking membership usage: %w", err)
	}
	return count > 0, nil
}
