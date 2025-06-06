package postgres

import (
	"context"
	"errors"
	"fmt"

	"github.com/FurkanArikk/fitness-center/backend/member-service/internal/model"
	"gorm.io/gorm"
)

// BenefitRepository implements model.BenefitRepository interface
type BenefitRepository struct {
	db *gorm.DB
}

// NewBenefitRepository creates a new BenefitRepository
func NewBenefitRepository(db *gorm.DB) model.BenefitRepository {
	return &BenefitRepository{db: db}
}

// Create adds a new membership benefit to the database
func (r *BenefitRepository) Create(ctx context.Context, benefit *model.MembershipBenefit) error {
	if err := r.db.WithContext(ctx).Create(benefit).Error; err != nil {
		return fmt.Errorf("creating membership benefit: %w", err)
	}
	return nil
}

// GetByID retrieves a membership benefit by their ID
func (r *BenefitRepository) GetByID(ctx context.Context, id int64) (*model.MembershipBenefit, error) {
	var benefit model.MembershipBenefit
	if err := r.db.WithContext(ctx).Where("benefit_id = ?", id).First(&benefit).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("membership benefit not found")
		}
		return nil, fmt.Errorf("getting membership benefit by ID: %w", err)
	}
	return &benefit, nil
}

// Update updates membership benefit information
func (r *BenefitRepository) Update(ctx context.Context, benefit *model.MembershipBenefit) error {
	result := r.db.WithContext(ctx).Model(benefit).Where("benefit_id = ?", benefit.ID).Updates(benefit)
	if result.Error != nil {
		return fmt.Errorf("updating membership benefit: %w", result.Error)
	}
	if result.RowsAffected == 0 {
		return fmt.Errorf("membership benefit not found")
	}
	return nil
}

// Delete removes a membership benefit by their ID
func (r *BenefitRepository) Delete(ctx context.Context, id int64) error {
	result := r.db.WithContext(ctx).Where("benefit_id = ?", id).Delete(&model.MembershipBenefit{})
	if result.Error != nil {
		return fmt.Errorf("deleting membership benefit: %w", result.Error)
	}
	if result.RowsAffected == 0 {
		return fmt.Errorf("membership benefit not found")
	}
	return nil
}

// List retrieves benefits for a specific membership
func (r *BenefitRepository) List(ctx context.Context, membershipID int64) ([]*model.MembershipBenefit, error) {
	var benefits []*model.MembershipBenefit
	if err := r.db.WithContext(ctx).Where("membership_id = ?", membershipID).Order("benefit_id").Find(&benefits).Error; err != nil {
		return nil, fmt.Errorf("listing membership benefits: %w", err)
	}
	return benefits, nil
}

// ListPaginated retrieves paginated benefits for a specific membership
func (r *BenefitRepository) ListPaginated(ctx context.Context, membershipID int64, offset, limit int) ([]*model.MembershipBenefit, error) {
	var benefits []*model.MembershipBenefit
	if err := r.db.WithContext(ctx).Where("membership_id = ?", membershipID).Offset(offset).Limit(limit).Order("benefit_id").Find(&benefits).Error; err != nil {
		return nil, fmt.Errorf("listing paginated membership benefits: %w", err)
	}
	return benefits, nil
}

// GetByMembershipID retrieves benefits for a specific membership (alias for List)
func (r *BenefitRepository) GetByMembershipID(ctx context.Context, membershipID int64) ([]*model.MembershipBenefit, error) {
	return r.List(ctx, membershipID)
}

// ListAll retrieves all membership benefits
func (r *BenefitRepository) ListAll(ctx context.Context) ([]*model.MembershipBenefit, error) {
	var benefits []*model.MembershipBenefit
	if err := r.db.WithContext(ctx).Order("benefit_id").Find(&benefits).Error; err != nil {
		return nil, fmt.Errorf("listing all membership benefits: %w", err)
	}
	return benefits, nil
}

// ListAllPaginated retrieves all membership benefits with pagination
func (r *BenefitRepository) ListAllPaginated(ctx context.Context, offset, limit int) ([]*model.MembershipBenefit, error) {
	var benefits []*model.MembershipBenefit
	if err := r.db.WithContext(ctx).Offset(offset).Limit(limit).Order("benefit_id").Find(&benefits).Error; err != nil {
		return nil, fmt.Errorf("listing all paginated membership benefits: %w", err)
	}
	return benefits, nil
}

// Count returns the total number of membership benefits
func (r *BenefitRepository) Count(ctx context.Context) (int, error) {
	var count int64
	if err := r.db.WithContext(ctx).Model(&model.MembershipBenefit{}).Count(&count).Error; err != nil {
		return 0, fmt.Errorf("counting membership benefits: %w", err)
	}
	return int(count), nil
}

// CountByMembership returns the number of benefits for a specific membership
func (r *BenefitRepository) CountByMembership(ctx context.Context, membershipID int64) (int, error) {
	var count int64
	if err := r.db.WithContext(ctx).Model(&model.MembershipBenefit{}).Where("membership_id = ?", membershipID).Count(&count).Error; err != nil {
		return 0, fmt.Errorf("counting membership benefits by membership: %w", err)
	}
	return int(count), nil
}
