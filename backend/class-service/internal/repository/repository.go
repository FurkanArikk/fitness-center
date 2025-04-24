package repository

import (
	"context"

	"github.com/FurkanArikk/fitness-center/backend/class-service/internal/model"
)

// ClassRepository defines the operations for class data access
type ClassRepository interface {
	GetAll(ctx context.Context, activeOnly bool) ([]model.Class, error)
	GetByID(ctx context.Context, id int) (model.Class, error)
	Create(ctx context.Context, class model.Class) (model.Class, error)
	Update(ctx context.Context, id int, class model.Class) (model.Class, error)
	Delete(ctx context.Context, id int) error
	ExistsInSchedule(ctx context.Context, id int) (bool, error)
}

// ScheduleRepository defines the operations for schedule data access
type ScheduleRepository interface {
	GetAll(ctx context.Context, status string) ([]model.ScheduleResponse, error)
	GetByID(ctx context.Context, id int) (model.ScheduleResponse, error)
	GetByClassID(ctx context.Context, classID int) ([]model.ScheduleResponse, error)
	Create(ctx context.Context, schedule model.Schedule) (model.Schedule, error)
	Update(ctx context.Context, id int, schedule model.Schedule) (model.Schedule, error)
	Delete(ctx context.Context, id int) error
	HasBookings(ctx context.Context, id int) (bool, error)
}

// BookingRepository defines the operations for booking data access
type BookingRepository interface {
	GetAll(ctx context.Context, status string, date string) ([]model.BookingResponse, error)
	GetByID(ctx context.Context, id int) (model.BookingResponse, error)
	GetByMemberID(ctx context.Context, memberID int) ([]model.BookingResponse, error)
	Create(ctx context.Context, booking model.Booking) (model.Booking, error)
	UpdateStatus(ctx context.Context, id int, status string) (model.Booking, error)
	AddFeedback(ctx context.Context, id int, rating int, comment string) (model.Booking, error)
	Cancel(ctx context.Context, id int) (model.Booking, error)
	CheckCapacity(ctx context.Context, scheduleID int) (int, int, error)
}

// Repository wraps all repositories
type Repository struct {
	Class    ClassRepository
	Schedule ScheduleRepository
	Booking  BookingRepository
}
