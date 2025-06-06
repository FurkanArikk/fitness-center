package postgres

import (
	"context"
	"errors"
	"fmt"

	"github.com/FurkanArikk/fitness-center/backend/class-service/internal/model"
	"gorm.io/gorm"
)

// BookingRepository implements model.BookingRepository interface
type BookingRepository struct {
	db *gorm.DB
}

// NewBookingRepository creates a new BookingRepository
func NewBookingRepository(db *gorm.DB) model.BookingRepository {
	return &BookingRepository{db: db}
}

// GetAll returns all bookings, optionally filtered by status and date
func (r *BookingRepository) GetAll(ctx context.Context, status string, dateStr string) ([]model.BookingResponse, error) {
	var bookings []model.BookingResponse

	query := r.db.WithContext(ctx).Table("class_bookings cb").
		Select("cb.*, c.class_name, cs.day_of_week, cs.start_time, cs.trainer_id").
		Joins("JOIN class_schedule cs ON cb.schedule_id = cs.schedule_id").
		Joins("JOIN classes c ON cs.class_id = c.class_id")

	if status != "" {
		query = query.Where("cb.attendance_status = ?", status)
	}

	if dateStr != "" {
		query = query.Where("DATE(cb.booking_date) = ?", dateStr)
	}

	err := query.Order("cb.booking_date DESC").Find(&bookings).Error
	if err != nil {
		return nil, fmt.Errorf("failed to fetch bookings: %w", err)
	}

	return bookings, nil
}

// GetAllPaginated returns paginated bookings with total count
func (r *BookingRepository) GetAllPaginated(ctx context.Context, status string, dateStr string, offset, limit int) ([]model.BookingResponse, int, error) {
	var bookings []model.BookingResponse
	var total int64

	// Count query
	countQuery := r.db.WithContext(ctx).Table("class_bookings cb")
	if status != "" {
		countQuery = countQuery.Where("attendance_status = ?", status)
	}
	if dateStr != "" {
		countQuery = countQuery.Where("DATE(booking_date) = ?", dateStr)
	}

	err := countQuery.Count(&total).Error
	if err != nil {
		return nil, 0, fmt.Errorf("failed to count bookings: %w", err)
	}

	// Data query
	query := r.db.WithContext(ctx).Table("class_bookings cb").
		Select("cb.*, c.class_name, cs.day_of_week, cs.start_time, cs.trainer_id").
		Joins("JOIN class_schedule cs ON cb.schedule_id = cs.schedule_id").
		Joins("JOIN classes c ON cs.class_id = c.class_id")

	if status != "" {
		query = query.Where("cb.attendance_status = ?", status)
	}

	if dateStr != "" {
		query = query.Where("DATE(cb.booking_date) = ?", dateStr)
	}

	err = query.Order("cb.booking_date DESC").
		Limit(limit).Offset(offset).Find(&bookings).Error
	if err != nil {
		return nil, 0, fmt.Errorf("failed to fetch bookings: %w", err)
	}

	return bookings, int(total), nil
}

// GetByID returns a booking by its ID
func (r *BookingRepository) GetByID(ctx context.Context, id int) (model.BookingResponse, error) {
	var booking model.BookingResponse

	err := r.db.WithContext(ctx).Table("class_bookings cb").
		Select("cb.*, c.class_name, cs.day_of_week, cs.start_time, cs.trainer_id").
		Joins("JOIN class_schedule cs ON cb.schedule_id = cs.schedule_id").
		Joins("JOIN classes c ON cs.class_id = c.class_id").
		Where("cb.booking_id = ?", id).
		First(&booking).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return model.BookingResponse{}, errors.New("booking not found")
		}
		return model.BookingResponse{}, fmt.Errorf("failed to fetch booking: %w", err)
	}

	return booking, nil
}

// GetByMemberID returns all bookings for a specific member
func (r *BookingRepository) GetByMemberID(ctx context.Context, memberID int) ([]model.BookingResponse, error) {
	var bookings []model.BookingResponse

	err := r.db.WithContext(ctx).Table("class_bookings cb").
		Select("cb.*, c.class_name, cs.day_of_week, cs.start_time, cs.trainer_id").
		Joins("JOIN class_schedule cs ON cb.schedule_id = cs.schedule_id").
		Joins("JOIN classes c ON cs.class_id = c.class_id").
		Where("cb.member_id = ?", memberID).
		Order("cb.booking_date DESC").
		Find(&bookings).Error

	if err != nil {
		return nil, fmt.Errorf("failed to fetch member bookings: %w", err)
	}

	return bookings, nil
}

// Create adds a new booking
func (r *BookingRepository) Create(ctx context.Context, booking model.Booking) (model.Booking, error) {
	err := r.db.WithContext(ctx).Create(&booking).Error
	if err != nil {
		return model.Booking{}, fmt.Errorf("failed to create booking: %w", err)
	}

	return booking, nil
}

// UpdateStatus updates the attendance status of a booking
func (r *BookingRepository) UpdateStatus(ctx context.Context, id int, status string) (model.Booking, error) {
	var booking model.Booking

	err := r.db.WithContext(ctx).Model(&booking).
		Where("booking_id = ?", id).
		Update("attendance_status", status).Error

	if err != nil {
		return model.Booking{}, fmt.Errorf("failed to update booking status: %w", err)
	}

	// Fetch the updated booking
	err = r.db.WithContext(ctx).Where("booking_id = ?", id).First(&booking).Error
	if err != nil {
		return model.Booking{}, fmt.Errorf("failed to fetch updated booking: %w", err)
	}

	return booking, nil
}

// AddFeedback adds feedback to a booking
func (r *BookingRepository) AddFeedback(ctx context.Context, id int, rating int, comment string) (model.Booking, error) {
	var booking model.Booking

	err := r.db.WithContext(ctx).Model(&booking).
		Where("booking_id = ?", id).
		Updates(map[string]interface{}{
			"feedback_rating":  rating,
			"feedback_comment": comment,
		}).Error

	if err != nil {
		return model.Booking{}, fmt.Errorf("failed to add feedback: %w", err)
	}

	// Fetch the updated booking
	err = r.db.WithContext(ctx).Where("booking_id = ?", id).First(&booking).Error
	if err != nil {
		return model.Booking{}, fmt.Errorf("failed to fetch updated booking: %w", err)
	}

	return booking, nil
}

// Cancel cancels a booking
func (r *BookingRepository) Cancel(ctx context.Context, id int) (model.Booking, error) {
	var booking model.Booking

	err := r.db.WithContext(ctx).Model(&booking).
		Where("booking_id = ?", id).
		Update("attendance_status", "cancelled").Error

	if err != nil {
		return model.Booking{}, fmt.Errorf("failed to cancel booking: %w", err)
	}

	// Fetch the updated booking
	err = r.db.WithContext(ctx).Where("booking_id = ?", id).First(&booking).Error
	if err != nil {
		return model.Booking{}, fmt.Errorf("failed to fetch cancelled booking: %w", err)
	}

	return booking, nil
}

// CheckCapacity checks the current and maximum capacity for a schedule
func (r *BookingRepository) CheckCapacity(ctx context.Context, scheduleID int) (int, int, error) {
	var currentCount int64
	var maxCapacity int

	// Count current bookings
	err := r.db.WithContext(ctx).Table("class_bookings").
		Where("schedule_id = ? AND attendance_status IN (?)", scheduleID, []string{"booked", "attended"}).
		Count(&currentCount).Error

	if err != nil {
		return 0, 0, fmt.Errorf("failed to count current bookings: %w", err)
	}

	// Get max capacity
	err = r.db.WithContext(ctx).Table("class_schedule cs").
		Select("c.capacity").
		Joins("JOIN classes c ON cs.class_id = c.class_id").
		Where("cs.schedule_id = ?", scheduleID).
		Scan(&maxCapacity).Error

	if err != nil {
		return 0, 0, fmt.Errorf("failed to get class capacity: %w", err)
	}

	return int(currentCount), maxCapacity, nil
}
