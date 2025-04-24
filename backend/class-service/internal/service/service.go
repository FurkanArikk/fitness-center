package service

import (
	"context"

	"github.com/FurkanArikk/fitness-center/backend/class-service/internal/model"
	"github.com/FurkanArikk/fitness-center/backend/class-service/internal/repository"
)

// ClassService defines operations for managing classes
type ClassService interface {
	GetClasses(ctx context.Context, activeOnly bool) ([]model.Class, error)
	GetClassByID(ctx context.Context, id int) (model.Class, error)
	CreateClass(ctx context.Context, req model.ClassRequest) (model.Class, error)
	UpdateClass(ctx context.Context, id int, req model.ClassRequest) (model.Class, error)
	DeleteClass(ctx context.Context, id int) error
}

// ScheduleService defines operations for managing schedules
type ScheduleService interface {
	GetSchedules(ctx context.Context, status string) ([]model.ScheduleResponse, error)
	GetScheduleByID(ctx context.Context, id int) (model.ScheduleResponse, error)
	GetSchedulesByClassID(ctx context.Context, classID int) ([]model.ScheduleResponse, error)
	CreateSchedule(ctx context.Context, req model.ScheduleRequest) (model.Schedule, error)
	UpdateSchedule(ctx context.Context, id int, req model.ScheduleRequest) (model.Schedule, error)
	DeleteSchedule(ctx context.Context, id int) error
}

// BookingService defines operations for managing bookings
type BookingService interface {
	GetBookings(ctx context.Context, status string, date string) ([]model.BookingResponse, error)
	GetBookingByID(ctx context.Context, id int) (model.BookingResponse, error)
	GetBookingsByMemberID(ctx context.Context, memberID int) ([]model.BookingResponse, error)
	CreateBooking(ctx context.Context, req model.BookingRequest) (model.Booking, error)
	UpdateBookingStatus(ctx context.Context, id int, status string) (model.Booking, error)
	AddBookingFeedback(ctx context.Context, id int, req model.FeedbackRequest) (model.Booking, error)
	CancelBooking(ctx context.Context, id int) (model.Booking, error)
}

// Service combines all services
type Service struct {
	Class    ClassService
	Schedule ScheduleService
	Booking  BookingService
}

// NewService creates a new service with all required services
func NewService(repos *repository.Repository) *Service {
	return &Service{
		Class:    NewClassService(repos.Class),
		Schedule: NewScheduleService(repos.Schedule, repos.Class),
		Booking:  NewBookingService(repos.Booking),
	}
}
