package model

import (
	"context"
	"time"
)

// Booking represents a member booking for a scheduled class
type Booking struct {
	BookingID        int       `json:"booking_id" gorm:"column:booking_id;primaryKey;autoIncrement"`
	ScheduleID       int       `json:"schedule_id" gorm:"column:schedule_id;not null"`
	MemberID         int       `json:"member_id" gorm:"column:member_id;not null"`
	BookingDate      time.Time `json:"booking_date" gorm:"column:booking_date;not null"`
	AttendanceStatus string    `json:"attendance_status" gorm:"column:attendance_status;type:varchar(20);default:'booked'"`
	FeedbackRating   *int      `json:"feedback_rating,omitempty" gorm:"column:feedback_rating"`
	FeedbackComment  string    `json:"feedback_comment,omitempty" gorm:"column:feedback_comment;type:varchar(255)"`
	CreatedAt        time.Time `json:"created_at" gorm:"column:created_at;autoCreateTime"`
	UpdatedAt        time.Time `json:"updated_at" gorm:"column:updated_at;autoUpdateTime"`

	// Relations (optional, for joining data)
	Schedule *Schedule `json:"schedule,omitempty" gorm:"foreignKey:ScheduleID;references:ScheduleID"`
}

// TableName specifies the table name for GORM
func (Booking) TableName() string {
	return "class_bookings"
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

// BookingRepository defines the operations for booking data access
type BookingRepository interface {
	GetAll(ctx context.Context, status string, date string) ([]BookingResponse, error)
	GetAllPaginated(ctx context.Context, status string, date string, offset, limit int) ([]BookingResponse, int, error)
	GetByID(ctx context.Context, id int) (BookingResponse, error)
	GetByMemberID(ctx context.Context, memberID int) ([]BookingResponse, error)
	Create(ctx context.Context, booking Booking) (Booking, error)
	UpdateStatus(ctx context.Context, id int, status string) (Booking, error)
	AddFeedback(ctx context.Context, id int, rating int, comment string) (Booking, error)
	Cancel(ctx context.Context, id int) (Booking, error)
	CheckCapacity(ctx context.Context, scheduleID int) (int, int, error)
}

// BookingService defines operations for managing bookings
type BookingService interface {
	GetBookings(ctx context.Context, status string, date string) ([]BookingResponse, error)
	GetBookingsPaginated(ctx context.Context, status string, date string, offset, limit int) ([]BookingResponse, int, error)
	GetBookingByID(ctx context.Context, id int) (BookingResponse, error)
	CreateBooking(ctx context.Context, req BookingRequest) (Booking, error)
	UpdateBookingStatus(ctx context.Context, id int, status string) (Booking, error)
	AddBookingFeedback(ctx context.Context, id int, req FeedbackRequest) (Booking, error)
	CancelBooking(ctx context.Context, id int) (Booking, error)
}
