package dto

import (
	"time"

	"github.com/furkan/fitness-center/backend/facility-service/internal/model"
)

// AttendanceResponse represents the response for attendance data
type AttendanceResponse struct {
	AttendanceID int        `json:"attendance_id"`
	MemberID     int        `json:"member_id"`
	CheckInTime  time.Time  `json:"check_in_time"`
	CheckOutTime *time.Time `json:"check_out_time,omitempty"`
	Date         DateOnly   `json:"date"`
	FacilityID   int        `json:"facility_id"`
	CreatedAt    time.Time  `json:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at"`
	FacilityName string     `json:"facility_name,omitempty"`
}

// AttendanceCreateRequest represents the request for creating an attendance record
type AttendanceCreateRequest struct {
	MemberID    int       `json:"member_id" binding:"required"`
	CheckInTime time.Time `json:"check_in_time"`
	FacilityID  int       `json:"facility_id" binding:"required"`
}

// AttendanceUpdateRequest represents the request for updating an attendance record
type AttendanceUpdateRequest struct {
	MemberID     int        `json:"member_id"`
	CheckInTime  time.Time  `json:"check_in_time"`
	CheckOutTime *time.Time `json:"check_out_time"`
	FacilityID   int        `json:"facility_id"`
}

// CheckoutRequest represents the request for checking out
type CheckoutRequest struct {
	CheckOutTime time.Time `json:"check_out_time"`
}

// ToModel converts AttendanceCreateRequest to model.Attendance
func (r *AttendanceCreateRequest) ToModel() model.Attendance {
	// Set check-in time to now if not provided
	checkInTime := r.CheckInTime
	if checkInTime.IsZero() {
		checkInTime = time.Now()
	}

	return model.Attendance{
		MemberID:    r.MemberID,
		CheckInTime: checkInTime,
		FacilityID:  r.FacilityID,
		Date:        time.Now(), // This will be overwritten by the database trigger
	}
}

// ToModel converts AttendanceUpdateRequest to model.Attendance
func (r *AttendanceUpdateRequest) ToModel() model.Attendance {
	return model.Attendance{
		MemberID:     r.MemberID,
		CheckInTime:  r.CheckInTime,
		CheckOutTime: r.CheckOutTime,
		FacilityID:   r.FacilityID,
	}
}

// FromModel converts model.Attendance to AttendanceResponse
func AttendanceResponseFromModel(model model.Attendance) AttendanceResponse {
	return AttendanceResponse{
		AttendanceID: model.AttendanceID,
		MemberID:     model.MemberID,
		CheckInTime:  model.CheckInTime,
		CheckOutTime: model.CheckOutTime,
		Date:         DateOnly(model.Date),
		FacilityID:   model.FacilityID,
		CreatedAt:    model.CreatedAt,
		UpdatedAt:    model.UpdatedAt,
	}
}

// FromModelList converts a list of model.Attendance to a list of AttendanceResponse
func AttendanceResponseListFromModel(models []*model.Attendance) []AttendanceResponse {
	responses := make([]AttendanceResponse, len(models))
	for i, model := range models {
		responses[i] = AttendanceResponseFromModel(*model)
	}
	return responses
}
