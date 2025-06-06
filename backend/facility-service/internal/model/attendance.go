package model

import (
	"context"
	"time"
)

// Attendance represents a member's visit to a facility
type Attendance struct {
	AttendanceID int        `json:"attendance_id" gorm:"column:attendance_id;primaryKey;autoIncrement"`
	MemberID     int        `json:"member_id" gorm:"column:member_id;not null;index"`
	CheckInTime  time.Time  `json:"check_in_time" gorm:"column:check_in_time;not null"`
	CheckOutTime *time.Time `json:"check_out_time" gorm:"column:check_out_time"`
	Date         time.Time  `json:"date" gorm:"column:date;type:date;not null;index"`
	FacilityID   int        `json:"facility_id" gorm:"column:facility_id;not null;index"`
	CreatedAt    time.Time  `json:"created_at" gorm:"column:created_at;autoCreateTime"`
	UpdatedAt    time.Time  `json:"updated_at" gorm:"column:updated_at;autoUpdateTime"`

	// Relations (optional, for joining data)
	Facility *Facility `json:"facility,omitempty" gorm:"foreignKey:FacilityID;references:FacilityID"`
}

// TableName specifies the table name for GORM
func (Attendance) TableName() string {
	return "attendance"
}

// AttendanceRepository defines the operations for attendance data access
type AttendanceRepository interface {
	GetAll(ctx context.Context) ([]Attendance, error)
	GetAllPaginated(ctx context.Context, offset, limit int) ([]Attendance, int, error)
	GetByID(ctx context.Context, id int) (*Attendance, error)
	Create(ctx context.Context, attendance *Attendance) (*Attendance, error)
	Update(ctx context.Context, id int, attendance *Attendance) (*Attendance, error)
	Delete(ctx context.Context, id int) error
	GetByMemberID(ctx context.Context, memberID int) ([]Attendance, error)
	GetByFacilityID(ctx context.Context, facilityID int) ([]Attendance, error)
	GetByDateRange(ctx context.Context, startDate, endDate time.Time) ([]Attendance, error)
	CheckIn(ctx context.Context, memberID, facilityID int) (*Attendance, error)
	CheckOut(ctx context.Context, attendanceID int) (*Attendance, error)
}
