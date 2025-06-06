package postgres

import (
	"context"
	"errors"
	"fmt"

	"github.com/FurkanArikk/fitness-center/backend/member-service/internal/model"
	"gorm.io/gorm"
)

// AssessmentRepository implements model.FitnessAssessmentRepository interface
type AssessmentRepository struct {
	db *gorm.DB
}

// NewAssessmentRepository creates a new AssessmentRepository
func NewAssessmentRepository(db *gorm.DB) model.FitnessAssessmentRepository {
	return &AssessmentRepository{db: db}
}

// Create adds a new fitness assessment to the database
func (r *AssessmentRepository) Create(ctx context.Context, assessment *model.FitnessAssessment) error {
	if err := r.db.WithContext(ctx).Create(assessment).Error; err != nil {
		return fmt.Errorf("creating fitness assessment: %w", err)
	}
	return nil
}

// GetByID retrieves a fitness assessment by their ID
func (r *AssessmentRepository) GetByID(ctx context.Context, id int64) (*model.FitnessAssessment, error) {
	var assessment model.FitnessAssessment
	if err := r.db.WithContext(ctx).Where("assessment_id = ?", id).First(&assessment).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("fitness assessment not found")
		}
		return nil, fmt.Errorf("getting fitness assessment by ID: %w", err)
	}
	return &assessment, nil
}

// Update updates fitness assessment information
func (r *AssessmentRepository) Update(ctx context.Context, assessment *model.FitnessAssessment) error {
	result := r.db.WithContext(ctx).Model(assessment).Where("assessment_id = ?", assessment.ID).Updates(assessment)
	if result.Error != nil {
		return fmt.Errorf("updating fitness assessment: %w", result.Error)
	}
	if result.RowsAffected == 0 {
		return fmt.Errorf("fitness assessment not found")
	}
	return nil
}

// Delete removes a fitness assessment by their ID
func (r *AssessmentRepository) Delete(ctx context.Context, id int64) error {
	result := r.db.WithContext(ctx).Where("assessment_id = ?", id).Delete(&model.FitnessAssessment{})
	if result.Error != nil {
		return fmt.Errorf("deleting fitness assessment: %w", result.Error)
	}
	if result.RowsAffected == 0 {
		return fmt.Errorf("fitness assessment not found")
	}
	return nil
}

// ListByMemberID retrieves all fitness assessments for a specific member
func (r *AssessmentRepository) ListByMemberID(ctx context.Context, memberID int64) ([]*model.FitnessAssessment, error) {
	var assessments []*model.FitnessAssessment
	if err := r.db.WithContext(ctx).Where("member_id = ?", memberID).Order("assessment_date DESC").Find(&assessments).Error; err != nil {
		return nil, fmt.Errorf("listing fitness assessments by member ID: %w", err)
	}
	return assessments, nil
}

// GetLatestByMemberID retrieves the latest fitness assessment for a specific member
func (r *AssessmentRepository) GetLatestByMemberID(ctx context.Context, memberID int64) (*model.FitnessAssessment, error) {
	var assessment model.FitnessAssessment
	if err := r.db.WithContext(ctx).Where("member_id = ?", memberID).Order("assessment_date DESC").First(&assessment).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("fitness assessment not found")
		}
		return nil, fmt.Errorf("getting latest fitness assessment: %w", err)
	}
	return &assessment, nil
}

// GetByMemberID retrieves all fitness assessments for a specific member (alias for ListByMemberID)
func (r *AssessmentRepository) GetByMemberID(ctx context.Context, memberID int64) ([]*model.FitnessAssessment, error) {
	return r.ListByMemberID(ctx, memberID)
}
