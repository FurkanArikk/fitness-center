package dto

import (
	"time"

	"github.com/FurkanArikk/fitness-center/backend/class-service/internal/model"
)

// BookingResponse represents the response for booking data
type BookingResponse struct {
	BookingID        int       `json:"booking_id"`
	ScheduleID       int       `json:"schedule_id"`
	MemberID         int       `json:"member_id"`
	BookingDate      time.Time `json:"booking_date"`
	AttendanceStatus string    `json:"attendance_status"`
	FeedbackRating   *int      `json:"feedback_rating,omitempty"`
	FeedbackComment  string    `json:"feedback_comment,omitempty"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
	ClassName        string    `json:"class_name,omitempty"`
	DayOfWeek        string    `json:"day_of_week,omitempty"`
	StartTime        string    `json:"start_time,omitempty"`
	TrainerID        int       `json:"trainer_id,omitempty"`
}

// BookingCreateRequest represents the request for creating a booking
type BookingCreateRequest struct {
	ScheduleID  int       `json:"schedule_id" binding:"required"`
	MemberID    int       `json:"member_id" binding:"required"`
	BookingDate time.Time `json:"booking_date" binding:"required"`
}

// BookingStatusUpdateRequest represents the request for updating a booking status
type BookingStatusUpdateRequest struct {
	AttendanceStatus string `json:"attendance_status" binding:"required,oneof=booked attended cancelled no_show"`
}

// BookingFeedbackRequest represents the request for adding feedback to a booking
type BookingFeedbackRequest struct {
	Rating  int    `json:"rating" binding:"required,min=1,max=5"`
	Comment string `json:"comment"`
}

// ToModel converts BookingCreateRequest to model.BookingRequest
func (r *BookingCreateRequest) ToModel() model.BookingRequest {
	return model.BookingRequest{
		ScheduleID:  r.ScheduleID,
		MemberID:    r.MemberID,
		BookingDate: r.BookingDate,
	}
}

// ToModel converts BookingStatusUpdateRequest to model.BookingStatusUpdate
func (r *BookingStatusUpdateRequest) ToModel() model.BookingStatusUpdate {
	return model.BookingStatusUpdate{
		AttendanceStatus: r.AttendanceStatus,
	}
}

// ToModel converts BookingFeedbackRequest to model.FeedbackRequest
func (r *BookingFeedbackRequest) ToModel() model.FeedbackRequest {
	return model.FeedbackRequest{
		Rating:  r.Rating,
		Comment: r.Comment,
	}
}

// FromModel converts model.Booking to BookingResponse
func BookingResponseFromModel(model model.Booking) BookingResponse {
	return BookingResponse{
		BookingID:        model.BookingID,
		ScheduleID:       model.ScheduleID,
		MemberID:         model.MemberID,
		BookingDate:      model.BookingDate,
		AttendanceStatus: model.AttendanceStatus,
		FeedbackRating:   model.FeedbackRating,
		FeedbackComment:  model.FeedbackComment,
		CreatedAt:        model.CreatedAt,
		UpdatedAt:        model.UpdatedAt,
	}
}

// FromBookingResponse converts model.BookingResponse to BookingResponse
func BookingResponseFromBookingResponse(model model.BookingResponse) BookingResponse {
	return BookingResponse{
		BookingID:        model.BookingID,
		ScheduleID:       model.ScheduleID,
		MemberID:         model.MemberID,
		BookingDate:      model.BookingDate,
		AttendanceStatus: model.AttendanceStatus,
		FeedbackRating:   model.FeedbackRating,
		FeedbackComment:  model.FeedbackComment,
		CreatedAt:        model.CreatedAt,
		UpdatedAt:        model.UpdatedAt,
		ClassName:        model.ClassName,
		DayOfWeek:        model.DayOfWeek,
		StartTime:        model.StartTime,
		TrainerID:        model.TrainerID,
	}
}

// FromModelList converts a list of model.BookingResponse to a list of BookingResponse
func BookingResponseListFromModel(models []model.BookingResponse) []BookingResponse {
	responses := make([]BookingResponse, len(models))
	for i, model := range models {
		responses[i] = BookingResponseFromBookingResponse(model)
	}
	return responses
}
