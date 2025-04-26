package service

import (
	"context"
	"time"

	"github.com/furkan/fitness-center/backend/facility-service/internal/model"
	"github.com/furkan/fitness-center/backend/facility-service/internal/repository"
)

// AttendanceService defines business operations for attendance
type AttendanceService interface {
	Create(ctx context.Context, attendance *model.Attendance) (*model.Attendance, error)
	GetByID(ctx context.Context, id int) (*model.Attendance, error)
	Update(ctx context.Context, attendance *model.Attendance) (*model.Attendance, error)
	Delete(ctx context.Context, id int) error
	List(ctx context.Context, filter map[string]interface{}, page, pageSize int) ([]*model.Attendance, int, error)
	ListByMemberID(ctx context.Context, memberID int, page, pageSize int) ([]*model.Attendance, int, error)
	ListByFacilityID(ctx context.Context, facilityID int, page, pageSize int) ([]*model.Attendance, int, error)
	ListByDate(ctx context.Context, date string, page, pageSize int) ([]*model.Attendance, int, error)
	CheckOut(ctx context.Context, attendanceID int, checkOutTime time.Time) error
}

// attendanceService implements AttendanceService
type attendanceService struct {
	repo repository.Repository
}

// NewAttendanceService creates a new attendance service
func NewAttendanceService(repo repository.Repository) AttendanceService {
	return &attendanceService{
		repo: repo,
	}
}

// Create adds a new attendance record (check-in)
func (s *attendanceService) Create(ctx context.Context, attendance *model.Attendance) (*model.Attendance, error) {
	// Ensure check-in time is set if not provided
	if attendance.CheckInTime.IsZero() {
		attendance.CheckInTime = time.Now()
	}

	return s.repo.Attendance().Create(ctx, attendance)
}

// GetByID retrieves attendance by ID
func (s *attendanceService) GetByID(ctx context.Context, id int) (*model.Attendance, error) {
	return s.repo.Attendance().GetByID(ctx, id)
}

// Update updates an attendance record
func (s *attendanceService) Update(ctx context.Context, attendance *model.Attendance) (*model.Attendance, error) {
	return s.repo.Attendance().Update(ctx, attendance)
}

// Delete removes an attendance record
func (s *attendanceService) Delete(ctx context.Context, id int) error {
	return s.repo.Attendance().Delete(ctx, id)
}

// List retrieves attendance records with filters
func (s *attendanceService) List(ctx context.Context, filter map[string]interface{}, page, pageSize int) ([]*model.Attendance, int, error) {
	return s.repo.Attendance().List(ctx, filter, page, pageSize)
}

// ListByMemberID retrieves attendance by member ID
func (s *attendanceService) ListByMemberID(ctx context.Context, memberID int, page, pageSize int) ([]*model.Attendance, int, error) {
	return s.repo.Attendance().ListByMemberID(ctx, memberID, page, pageSize)
}

// ListByFacilityID retrieves attendance by facility ID
func (s *attendanceService) ListByFacilityID(ctx context.Context, facilityID int, page, pageSize int) ([]*model.Attendance, int, error) {
	return s.repo.Attendance().ListByFacilityID(ctx, facilityID, page, pageSize)
}

// ListByDate retrieves attendance by date
func (s *attendanceService) ListByDate(ctx context.Context, date string, page, pageSize int) ([]*model.Attendance, int, error) {
	return s.repo.Attendance().ListByDate(ctx, date, page, pageSize)
}

// CheckOut updates an attendance record with check-out time
func (s *attendanceService) CheckOut(ctx context.Context, attendanceID int, checkOutTime time.Time) error {
	// If no check-out time provided, use current time
	if checkOutTime.IsZero() {
		checkOutTime = time.Now()
	}

	return s.repo.Attendance().CheckOut(ctx, attendanceID, checkOutTime)
}
