package model

import (
	"time"
)

// Attendance represents a member's visit to a facility
type Attendance struct {
	AttendanceID int        `json:"attendance_id" db:"attendance_id"`
	MemberID     int        `json:"member_id" db:"member_id"`
	CheckInTime  time.Time  `json:"check_in_time" db:"check_in_time"`
	CheckOutTime *time.Time `json:"check_out_time" db:"check_out_time"`
	Date         time.Time  `json:"date" db:"date"`
	FacilityID   int        `json:"facility_id" db:"facility_id"`
	CreatedAt    time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at" db:"updated_at"`
}
