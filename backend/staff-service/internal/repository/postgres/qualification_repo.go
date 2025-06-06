package postgres

import (
	"context"
	"errors"
	"fmt"

	"github.com/FurkanArikk/fitness-center/backend/staff-service/internal/model"
	"gorm.io/gorm"
)

// QualificationRepository handles database operations related to staff qualifications
type QualificationRepository struct {
	db *gorm.DB
}

// NewQualificationRepository creates a new QualificationRepository
func NewQualificationRepository(db *gorm.DB) *QualificationRepository {
	return &QualificationRepository{db: db}
}

// GetAll retrieves all qualifications from the database
func (r *QualificationRepository) GetAll(ctx context.Context) ([]model.Qualification, error) {
	var qualifications []model.Qualification

	result := r.db.WithContext(ctx).Order("expiry_date DESC").Find(&qualifications)
	if result.Error != nil {
		return nil, fmt.Errorf("error querying qualifications: %w", result.Error)
	}

	return qualifications, nil
}

// GetByID retrieves a qualification by ID
func (r *QualificationRepository) GetByID(ctx context.Context, id int64) (*model.Qualification, error) {
	var qualification model.Qualification

	result := r.db.WithContext(ctx).First(&qualification, id)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("qualification not found")
		}
		return nil, fmt.Errorf("error querying qualification: %w", result.Error)
	}

	return &qualification, nil
}

// GetByStaffID retrieves all qualifications for a staff member
func (r *QualificationRepository) GetByStaffID(ctx context.Context, staffID int64) ([]model.Qualification, error) {
	var qualifications []model.Qualification

	result := r.db.WithContext(ctx).Where("staff_id = ?", staffID).Order("expiry_date DESC").Find(&qualifications)
	if result.Error != nil {
		return nil, fmt.Errorf("error querying qualifications by staff ID: %w", result.Error)
	}

	return qualifications, nil
}

// Create adds a new qualification to the database
func (r *QualificationRepository) Create(ctx context.Context, req *model.QualificationRequest) (*model.Qualification, error) {
	qualification := &model.Qualification{
		StaffID:           req.StaffID,
		QualificationName: req.QualificationName,
		IssueDate:         req.IssueDate,
		ExpiryDate:        req.ExpiryDate,
		IssuingAuthority:  req.IssuingAuthority,
	}

	result := r.db.WithContext(ctx).Create(qualification)
	if result.Error != nil {
		return nil, fmt.Errorf("error creating qualification: %w", result.Error)
	}

	return qualification, nil
}

// Update modifies an existing qualification in the database
func (r *QualificationRepository) Update(ctx context.Context, id int64, req *model.QualificationRequest) (*model.Qualification, error) {
	var qualification model.Qualification

	// First check if qualification exists
	result := r.db.WithContext(ctx).First(&qualification, id)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("qualification not found")
		}
		return nil, fmt.Errorf("error finding qualification: %w", result.Error)
	}

	// Update qualification
	qualification.StaffID = req.StaffID
	qualification.QualificationName = req.QualificationName
	qualification.IssueDate = req.IssueDate
	qualification.ExpiryDate = req.ExpiryDate
	qualification.IssuingAuthority = req.IssuingAuthority

	result = r.db.WithContext(ctx).Save(&qualification)
	if result.Error != nil {
		return nil, fmt.Errorf("error updating qualification: %w", result.Error)
	}

	return &qualification, nil
}

// Delete removes a qualification from the database
func (r *QualificationRepository) Delete(ctx context.Context, id int64) error {
	result := r.db.WithContext(ctx).Delete(&model.Qualification{}, id)
	if result.Error != nil {
		return fmt.Errorf("error deleting qualification: %w", result.Error)
	}

	if result.RowsAffected == 0 {
		return fmt.Errorf("qualification not found")
	}

	return nil
}

// GetExpiringSoon retrieves qualifications expiring within the specified number of days
func (r *QualificationRepository) GetExpiringSoon(ctx context.Context, days int) ([]model.Qualification, error) {
	var qualifications []model.Qualification

	result := r.db.WithContext(ctx).
		Where("expiry_date <= CURRENT_DATE + ?", days).
		Order("expiry_date").Find(&qualifications)

	if result.Error != nil {
		return nil, fmt.Errorf("error querying expiring qualifications: %w", result.Error)
	}

	return qualifications, nil
}

// GetAllPaginated retrieves qualifications with pagination
func (r *QualificationRepository) GetAllPaginated(ctx context.Context, offset, limit int) ([]model.Qualification, int, error) {
	var qualifications []model.Qualification
	var totalCount int64

	// Get total count
	countResult := r.db.WithContext(ctx).Model(&model.Qualification{}).Count(&totalCount)
	if countResult.Error != nil {
		return nil, 0, fmt.Errorf("error counting qualifications: %w", countResult.Error)
	}

	// Get paginated data
	result := r.db.WithContext(ctx).
		Order("expiry_date DESC").
		Offset(offset).Limit(limit).Find(&qualifications)

	if result.Error != nil {
		return nil, 0, fmt.Errorf("error querying paginated qualifications: %w", result.Error)
	}

	return qualifications, int(totalCount), nil
}

// GetByStaffIDPaginated retrieves qualifications for a specific staff member with pagination
func (r *QualificationRepository) GetByStaffIDPaginated(ctx context.Context, staffID int64, offset, limit int) ([]model.Qualification, int, error) {
	var qualifications []model.Qualification
	var totalCount int64

	// Get total count for this staff member
	countResult := r.db.WithContext(ctx).Model(&model.Qualification{}).Where("staff_id = ?", staffID).Count(&totalCount)
	if countResult.Error != nil {
		return nil, 0, fmt.Errorf("error counting qualifications for staff: %w", countResult.Error)
	}

	// Get paginated data
	result := r.db.WithContext(ctx).
		Where("staff_id = ?", staffID).
		Order("expiry_date DESC").
		Offset(offset).Limit(limit).Find(&qualifications)

	if result.Error != nil {
		return nil, 0, fmt.Errorf("error querying paginated qualifications by staff ID: %w", result.Error)
	}

	return qualifications, int(totalCount), nil
}
