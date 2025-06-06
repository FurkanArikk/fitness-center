package postgres

import (
	"context"
	"errors"
	"fmt"

	"github.com/FurkanArikk/fitness-center/backend/staff-service/internal/model"
	"gorm.io/gorm"
)

// StaffRepository handles database operations related to staff
type StaffRepository struct {
	db *gorm.DB
}

// NewStaffRepository creates a new StaffRepository
func NewStaffRepository(db *gorm.DB) *StaffRepository {
	return &StaffRepository{db: db}
}

// GetAll retrieves all staff members from the database
func (r *StaffRepository) GetAll(ctx context.Context) ([]model.Staff, error) {
	var staffList []model.Staff

	err := r.db.WithContext(ctx).
		Order("last_name ASC, first_name ASC").
		Find(&staffList).Error

	if err != nil {
		return nil, fmt.Errorf("error querying staff: %w", err)
	}

	return staffList, nil
}

// GetAllPaginated retrieves paginated staff members from the database
func (r *StaffRepository) GetAllPaginated(ctx context.Context, offset, limit int) ([]model.Staff, int, error) {
	var staffList []model.Staff
	var total int64

	// Get total count
	if err := r.db.WithContext(ctx).Model(&model.Staff{}).Count(&total).Error; err != nil {
		return nil, 0, fmt.Errorf("error counting staff: %w", err)
	}

	// Get paginated results
	err := r.db.WithContext(ctx).
		Order("last_name ASC, first_name ASC").
		Offset(offset).
		Limit(limit).
		Find(&staffList).Error

	if err != nil {
		return nil, 0, fmt.Errorf("error querying paginated staff: %w", err)
	}

	return staffList, int(total), nil
}

// GetByID retrieves a staff member by ID
func (r *StaffRepository) GetByID(ctx context.Context, id int64) (*model.Staff, error) {
	var staff model.Staff

	err := r.db.WithContext(ctx).First(&staff, id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("staff not found")
		}
		return nil, fmt.Errorf("error querying staff: %w", err)
	}

	return &staff, nil
}

// Create adds a new staff member to the database
func (r *StaffRepository) Create(ctx context.Context, staff *model.Staff) (*model.Staff, error) {
	err := r.db.WithContext(ctx).Create(staff).Error
	if err != nil {
		// Check for unique constraint violation on email
		if errors.Is(err, gorm.ErrDuplicatedKey) ||
			(err.Error() != "" && (fmt.Sprintf("%v", err) == "ERROR: duplicate key value violates unique constraint \"staff_email_key\" (SQLSTATE 23505)" ||
				fmt.Sprintf("%v", err) == "UNIQUE constraint failed: staff.email")) {
			return nil, fmt.Errorf("staff with email '%s' already exists", staff.Email)
		}
		return nil, fmt.Errorf("error creating staff: %w", err)
	}

	return staff, nil
}

// Update modifies an existing staff member in the database
func (r *StaffRepository) Update(ctx context.Context, staff *model.Staff) (*model.Staff, error) {
	err := r.db.WithContext(ctx).Save(staff).Error
	if err != nil {
		return nil, fmt.Errorf("error updating staff: %w", err)
	}

	return staff, nil
}

// Delete removes a staff member from the database (soft delete by updating status)
func (r *StaffRepository) Delete(ctx context.Context, id int64) error {
	// Instead of deleting, update the status to "Terminated"
	result := r.db.WithContext(ctx).
		Model(&model.Staff{}).
		Where("staff_id = ?", id).
		Update("status", "Terminated")

	if result.Error != nil {
		return fmt.Errorf("error deleting staff: %w", result.Error)
	}

	if result.RowsAffected == 0 {
		return fmt.Errorf("staff not found")
	}

	return nil
}

// GetByEmail retrieves a staff member by email
func (r *StaffRepository) GetByEmail(ctx context.Context, email string) (*model.Staff, error) {
	var staff model.Staff

	err := r.db.WithContext(ctx).Where("email = ?", email).First(&staff).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("staff not found")
		}
		return nil, fmt.Errorf("error querying staff by email: %w", err)
	}

	return &staff, nil
}

// GetByPosition retrieves staff members by position
func (r *StaffRepository) GetByPosition(ctx context.Context, position string) ([]model.Staff, error) {
	var staffList []model.Staff

	err := r.db.WithContext(ctx).
		Where("position = ?", position).
		Order("last_name ASC, first_name ASC").
		Find(&staffList).Error

	if err != nil {
		return nil, fmt.Errorf("error querying staff by position: %w", err)
	}

	return staffList, nil
}

// GetByStatus retrieves staff members by status
func (r *StaffRepository) GetByStatus(ctx context.Context, status string) ([]model.Staff, error) {
	var staffList []model.Staff

	err := r.db.WithContext(ctx).
		Where("status = ?", status).
		Order("last_name ASC, first_name ASC").
		Find(&staffList).Error

	if err != nil {
		return nil, fmt.Errorf("error querying staff by status: %w", err)
	}

	return staffList, nil
}
