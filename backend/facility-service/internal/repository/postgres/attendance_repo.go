package postgres

import (
	"context"
	"fmt"
	"time"

	"github.com/FurkanArikk/fitness-center/backend/facility-service/internal/model"
	"github.com/FurkanArikk/fitness-center/backend/facility-service/internal/repository"
	"gorm.io/gorm"
)

type attendanceRepository struct {
	db *gorm.DB
}

// NewAttendanceRepository creates a new attendance repository
func NewAttendanceRepository(db *gorm.DB) repository.AttendanceRepository {
	return &attendanceRepository{db: db}
}

// Create adds a new attendance record
func (r *attendanceRepository) Create(ctx context.Context, attendance *model.Attendance) (*model.Attendance, error) {
	if err := r.db.WithContext(ctx).Create(attendance).Error; err != nil {
		return nil, fmt.Errorf("creating attendance: %w", err)
	}
	return attendance, nil
}

// GetByID retrieves attendance by ID
func (r *attendanceRepository) GetByID(ctx context.Context, id int) (*model.Attendance, error) {
	var attendance model.Attendance
	if err := r.db.WithContext(ctx).Where("attendance_id = ?", id).First(&attendance).Error; err != nil {
		return nil, fmt.Errorf("getting attendance by ID: %w", err)
	}
	return &attendance, nil
}

// Update updates an attendance record
func (r *attendanceRepository) Update(ctx context.Context, attendance *model.Attendance) (*model.Attendance, error) {
	// First check if the attendance exists
	var existingAttendance model.Attendance
	if err := r.db.WithContext(ctx).Where("attendance_id = ?", attendance.AttendanceID).First(&existingAttendance).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("attendance with ID %d not found", attendance.AttendanceID)
		}
		return nil, fmt.Errorf("checking attendance existence: %w", err)
	}

	// Update the record
	result := r.db.WithContext(ctx).Model(&existingAttendance).Updates(map[string]interface{}{
		"member_id":      attendance.MemberID,
		"check_in_time":  attendance.CheckInTime,
		"check_out_time": attendance.CheckOutTime,
		"date":           attendance.Date,
		"facility_id":    attendance.FacilityID,
	})

	if result.Error != nil {
		return nil, fmt.Errorf("updating attendance: %w", result.Error)
	}

	if result.RowsAffected == 0 {
		return nil, fmt.Errorf("attendance with ID %d not found", attendance.AttendanceID)
	}

	// Return the updated attendance with preserved creation time
	attendance.CreatedAt = existingAttendance.CreatedAt
	return attendance, nil
}

// Delete removes an attendance record
func (r *attendanceRepository) Delete(ctx context.Context, id int) error {
	// First check if the attendance exists
	var attendance model.Attendance
	if err := r.db.WithContext(ctx).Where("attendance_id = ?", id).First(&attendance).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return fmt.Errorf("attendance with ID %d not found", id)
		}
		return fmt.Errorf("checking attendance existence: %w", err)
	}

	// Delete the record
	result := r.db.WithContext(ctx).Delete(&model.Attendance{}, id)
	if result.Error != nil {
		return fmt.Errorf("deleting attendance: %w", result.Error)
	}
	if result.RowsAffected == 0 {
		return fmt.Errorf("attendance with ID %d not found", id)
	}
	return nil
}

// List retrieves attendance records with filters and pagination
func (r *attendanceRepository) List(ctx context.Context, filter map[string]interface{}, page, pageSize int) ([]*model.Attendance, int, error) {
	var attendance []*model.Attendance
	var total int64

	db := r.db.WithContext(ctx).Model(&model.Attendance{})

	// Apply filters
	for key, value := range filter {
		db = db.Where(fmt.Sprintf("%s = ?", key), value)
	}

	// Count total records
	if err := db.Count(&total).Error; err != nil {
		return nil, 0, fmt.Errorf("counting attendance: %w", err)
	}

	// Apply pagination
	offset := (page - 1) * pageSize
	if err := db.Offset(offset).Limit(pageSize).Order("check_in_time DESC").Find(&attendance).Error; err != nil {
		return nil, 0, fmt.Errorf("listing attendance: %w", err)
	}

	return attendance, int(total), nil
}

// ListByMemberID retrieves attendance by member ID
func (r *attendanceRepository) ListByMemberID(ctx context.Context, memberID int, page, pageSize int) ([]*model.Attendance, int, error) {
	return r.List(ctx, map[string]interface{}{"member_id": memberID}, page, pageSize)
}

// ListByFacilityID retrieves attendance by facility ID
func (r *attendanceRepository) ListByFacilityID(ctx context.Context, facilityID int, page, pageSize int) ([]*model.Attendance, int, error) {
	return r.List(ctx, map[string]interface{}{"facility_id": facilityID}, page, pageSize)
}

// ListByDate retrieves attendance by date
func (r *attendanceRepository) ListByDate(ctx context.Context, date string, page, pageSize int) ([]*model.Attendance, int, error) {
	return r.List(ctx, map[string]interface{}{"date": date}, page, pageSize)
}

// CheckOut updates an attendance record with check-out time
func (r *attendanceRepository) CheckOut(ctx context.Context, attendanceID int, checkOutTime time.Time) error {
	// First check if the attendance exists and is not already checked out
	var attendance model.Attendance
	if err := r.db.WithContext(ctx).Where("attendance_id = ?", attendanceID).First(&attendance).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return fmt.Errorf("attendance with ID %d not found", attendanceID)
		}
		return fmt.Errorf("checking attendance existence: %w", err)
	}

	// Check if already checked out
	if attendance.CheckOutTime != nil {
		return fmt.Errorf("member has already checked out at %v", attendance.CheckOutTime.Format("15:04:05"))
	}

	// Update with check-out time
	result := r.db.WithContext(ctx).Model(&model.Attendance{}).Where("attendance_id = ?", attendanceID).Update("check_out_time", checkOutTime)
	if result.Error != nil {
		return fmt.Errorf("updating check-out time: %w", result.Error)
	}
	if result.RowsAffected == 0 {
		return fmt.Errorf("attendance with ID %d not found", attendanceID)
	}
	return nil
}
