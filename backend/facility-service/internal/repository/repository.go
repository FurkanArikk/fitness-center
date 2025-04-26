package repository

import (
	"context"
	"time"

	"github.com/furkan/fitness-center/backend/facility-service/internal/model"
)

// EquipmentRepository defines operations for equipment storage
type EquipmentRepository interface {
	Create(ctx context.Context, equipment *model.Equipment) (*model.Equipment, error)
	GetByID(ctx context.Context, id int) (*model.Equipment, error)
	Update(ctx context.Context, equipment *model.Equipment) (*model.Equipment, error)
	Delete(ctx context.Context, id int) error
	List(ctx context.Context, filter map[string]interface{}, page, pageSize int) ([]*model.Equipment, int, error)
	ListByCategory(ctx context.Context, category string, page, pageSize int) ([]*model.Equipment, int, error)
	ListByStatus(ctx context.Context, status string, page, pageSize int) ([]*model.Equipment, int, error)
	ListByMaintenanceDue(ctx context.Context, date string, page, pageSize int) ([]*model.Equipment, int, error)
}

// FacilityRepository defines operations for facility storage
type FacilityRepository interface {
	Create(ctx context.Context, facility *model.Facility) (*model.Facility, error)
	GetByID(ctx context.Context, id int) (*model.Facility, error)
	GetByName(ctx context.Context, name string) (*model.Facility, error)
	Update(ctx context.Context, facility *model.Facility) (*model.Facility, error)
	Delete(ctx context.Context, id int) error
	List(ctx context.Context, filter map[string]interface{}, page, pageSize int) ([]*model.Facility, int, error)
	ListByStatus(ctx context.Context, status string, page, pageSize int) ([]*model.Facility, int, error)
}

// AttendanceRepository defines operations for attendance storage
type AttendanceRepository interface {
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

// Repository combines all repositories
type Repository interface {
	Equipment() EquipmentRepository
	Facility() FacilityRepository
	Attendance() AttendanceRepository
	Close() error // Add Close method to the interface
}
