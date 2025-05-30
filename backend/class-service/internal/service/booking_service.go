package service

import (
	"context"
	"errors"
	"fmt"

	"github.com/FurkanArikk/fitness-center/backend/class-service/internal/model"
)

// BookingServiceImpl implements model.BookingService interface
type BookingServiceImpl struct {
	repo model.BookingRepository
}

// NewBookingService creates a new BookingService
func NewBookingService(repo model.BookingRepository) model.BookingService {
	return &BookingServiceImpl{repo: repo}
}

// GetBookings returns all bookings
func (s *BookingServiceImpl) GetBookings(ctx context.Context, status string, date string) ([]model.BookingResponse, error) {
	return s.repo.GetAll(ctx, status, date)
}

// GetBookingByID returns a booking by its ID
func (s *BookingServiceImpl) GetBookingByID(ctx context.Context, id int) (model.BookingResponse, error) {
	return s.repo.GetByID(ctx, id)
}

// GetBookingsByMemberID returns bookings for a specific member
func (s *BookingServiceImpl) GetBookingsByMemberID(ctx context.Context, memberID int) ([]model.BookingResponse, error) {
	return s.repo.GetByMemberID(ctx, memberID)
}

// GetBookingsPaginated returns paginated bookings
func (s *BookingServiceImpl) GetBookingsPaginated(ctx context.Context, status string, date string, offset, limit int) ([]model.BookingResponse, int, error) {
	return s.repo.GetAllPaginated(ctx, status, date, offset, limit)
}

// CreateBooking creates a new booking
func (s *BookingServiceImpl) CreateBooking(ctx context.Context, req model.BookingRequest) (model.Booking, error) {
	// Check capacity
	currentCount, capacity, err := s.repo.CheckCapacity(ctx, req.ScheduleID)
	if err != nil {
		return model.Booking{}, err
	}

	if currentCount >= capacity {
		return model.Booking{}, errors.New("class is already at full capacity")
	}

	booking := model.Booking{
		ScheduleID:  req.ScheduleID,
		MemberID:    req.MemberID,
		BookingDate: req.BookingDate,
	}

	return s.repo.Create(ctx, booking)
}

// UpdateBookingStatus updates a booking's attendance status
func (s *BookingServiceImpl) UpdateBookingStatus(ctx context.Context, id int, status string) (model.Booking, error) {
	// Validate status
	validStatuses := map[string]bool{
		"booked":    true,
		"attended":  true,
		"cancelled": true,
		"no_show":   true,
	}

	if !validStatuses[status] {
		return model.Booking{}, fmt.Errorf("invalid status: %s", status)
	}

	return s.repo.UpdateStatus(ctx, id, status)
}

// AddBookingFeedback adds feedback to a booking
func (s *BookingServiceImpl) AddBookingFeedback(ctx context.Context, id int, req model.FeedbackRequest) (model.Booking, error) {
	// Get the booking to check status
	booking, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return model.Booking{}, err
	}

	if booking.AttendanceStatus != "attended" {
		return model.Booking{}, errors.New("feedback can only be provided for attended classes")
	}

	return s.repo.AddFeedback(ctx, id, req.Rating, req.Comment)
}

// CancelBooking cancels a booking
func (s *BookingServiceImpl) CancelBooking(ctx context.Context, id int) (model.Booking, error) {
	// Get the booking to check status
	booking, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return model.Booking{}, err
	}

	if booking.AttendanceStatus != "booked" {
		return model.Booking{}, errors.New("only bookings with 'booked' status can be cancelled")
	}

	return s.repo.Cancel(ctx, id)
}
