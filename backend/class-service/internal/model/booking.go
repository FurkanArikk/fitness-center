package model

import (
	"time"
)

// Booking represents a member booking for a scheduled class
type Booking struct {
	BookingID        int       `json:"booking_id" db:"booking_id"`
	ScheduleID       int       `json:"schedule_id" db:"schedule_id"`
	MemberID         int       `json:"member_id" db:"member_id"`
	BookingDate      time.Time `json:"booking_date" db:"booking_date"`
	AttendanceStatus string    `json:"attendance_status" db:"attendance_status"`
	FeedbackRating   *int      `json:"feedback_rating,omitempty" db:"feedback_rating"`
	FeedbackComment  string    `json:"feedback_comment,omitempty" db:"feedback_comment"`
	CreatedAt        time.Time `json:"created_at" db:"created_at"`
	UpdatedAt        time.Time `json:"updated_at" db:"updated_at"`

	// Relations (optional, for joining data)
	Schedule *Schedule `json:"schedule,omitempty"`
}

// BookingRequest is used for creating a booking
type BookingRequest struct {
	ScheduleID  int       `json:"schedule_id" binding:"required"`
	MemberID    int       `json:"member_id" binding:"required"`
	BookingDate time.Time `json:"booking_date" binding:"required"`
}

// BookingStatusUpdate is used for updating attendance status
type BookingStatusUpdate struct {
	AttendanceStatus string `json:"attendance_status" binding:"required,oneof=booked attended cancelled no_show"`
}

// FeedbackRequest is used for providing feedback for a booking
type FeedbackRequest struct {
	Rating  int    `json:"rating" binding:"required,min=1,max=5"`
	Comment string `json:"comment"`
}

// BookingResponse includes schedule and class details with the booking
type BookingResponse struct {
	Booking
	ClassName string `json:"class_name"`
	DayOfWeek string `json:"day_of_week"`
	StartTime string `json:"start_time"`
	TrainerID int    `json:"trainer_id"`
}
