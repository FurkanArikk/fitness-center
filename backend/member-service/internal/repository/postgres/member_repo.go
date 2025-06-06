package postgres

import (
	"context"
	"errors"
	"fmt"

	"github.com/FurkanArikk/fitness-center/backend/member-service/internal/model"
	"gorm.io/gorm"
)

// MemberRepository implements model.MemberRepository interface
type MemberRepository struct {
	db *gorm.DB
}

// NewMemberRepository creates a new MemberRepository
func NewMemberRepository(db *gorm.DB) model.MemberRepository {
	return &MemberRepository{db: db}
}

// Create adds a new member to the database
func (r *MemberRepository) Create(ctx context.Context, member *model.Member) error {
	if err := r.db.WithContext(ctx).Create(member).Error; err != nil {
		return fmt.Errorf("creating member: %w", err)
	}
	return nil
}

// GetByID retrieves a member by their ID
func (r *MemberRepository) GetByID(ctx context.Context, id int64) (*model.Member, error) {
	var member model.Member
	if err := r.db.WithContext(ctx).Where("member_id = ?", id).First(&member).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("member not found")
		}
		return nil, fmt.Errorf("getting member by ID: %w", err)
	}
	return &member, nil
}

// Update updates member information
func (r *MemberRepository) Update(ctx context.Context, member *model.Member) error {
	result := r.db.WithContext(ctx).Model(member).Where("member_id = ?", member.ID).Updates(member)
	if result.Error != nil {
		return fmt.Errorf("updating member: %w", result.Error)
	}
	if result.RowsAffected == 0 {
		return fmt.Errorf("member not found")
	}
	return nil
}

// Delete removes a member by their ID
func (r *MemberRepository) Delete(ctx context.Context, id int64) error {
	result := r.db.WithContext(ctx).Where("member_id = ?", id).Delete(&model.Member{})
	if result.Error != nil {
		return fmt.Errorf("deleting member: %w", result.Error)
	}
	if result.RowsAffected == 0 {
		return fmt.Errorf("member not found")
	}
	return nil
}

// List retrieves a paginated list of members
func (r *MemberRepository) List(ctx context.Context, offset, limit int) ([]*model.Member, error) {
	var members []*model.Member
	if err := r.db.WithContext(ctx).Offset(offset).Limit(limit).Order("member_id").Find(&members).Error; err != nil {
		return nil, fmt.Errorf("listing members: %w", err)
	}
	return members, nil
}

// Count returns the total number of members
func (r *MemberRepository) Count(ctx context.Context) (int, error) {
	var count int64
	if err := r.db.WithContext(ctx).Model(&model.Member{}).Count(&count).Error; err != nil {
		return 0, fmt.Errorf("counting members: %w", err)
	}
	return int(count), nil
}

// GetByEmail retrieves a member by their email address
func (r *MemberRepository) GetByEmail(ctx context.Context, email string) (*model.Member, error) {
	var member model.Member
	if err := r.db.WithContext(ctx).Where("email = ?", email).First(&member).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("member not found")
		}
		return nil, fmt.Errorf("getting member by email: %w", err)
	}
	return &member, nil
}
