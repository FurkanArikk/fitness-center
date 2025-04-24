package postgres

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/FurkanArikk/fitness-center/backend/class-service/internal/model"
	"github.com/FurkanArikk/fitness-center/backend/class-service/internal/repository"
)

// BookingRepository implements repository.BookingRepository interface
type BookingRepository struct {
	db *sql.DB
}

// NewBookingRepository creates a new BookingRepository
func NewBookingRepository(db *sql.DB) repository.BookingRepository {
	return &BookingRepository{db: db}
}

// GetAll returns all bookings, optionally filtered by status and date
func (r *BookingRepository) GetAll(ctx context.Context, status string, dateStr string) ([]model.BookingResponse, error) {
	query := `
		SELECT b.*, s.day_of_week, s.start_time, s.trainer_id, c.class_name
		FROM class_bookings b
		JOIN class_schedule s ON b.schedule_id = s.schedule_id
		JOIN classes c ON s.class_id = c.class_id
	`

	var conditions []string
	var args []interface{}
	var argCount int

	if status != "" {
		argCount++
		conditions = append(conditions, fmt.Sprintf("b.attendance_status = $%d", argCount))
		args = append(args, status)
	}

	if dateStr != "" {
		date, err := time.Parse("2006-01-02", dateStr)
		if err != nil {
			return nil, fmt.Errorf("invalid date format, should be YYYY-MM-DD: %w", err)
		}
		argCount++
		conditions = append(conditions, fmt.Sprintf("DATE(b.booking_date) = $%d", argCount))
		args = append(args, date)
	}

	if len(conditions) > 0 {
		query += " WHERE " + strings.Join(conditions, " AND ")
	}

	query += " ORDER BY b.booking_date DESC"

	rows, err := r.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch bookings: %w", err)
	}
	defer rows.Close()

	var bookings []model.BookingResponse
	for rows.Next() {
		var b model.BookingResponse
		var feedbackRating sql.NullInt32
		var feedbackComment sql.NullString

		if err := rows.Scan(
			&b.BookingID, &b.ScheduleID, &b.MemberID, &b.BookingDate,
			&b.AttendanceStatus, &feedbackRating, &feedbackComment,
			&b.CreatedAt, &b.UpdatedAt, &b.DayOfWeek, &b.StartTime,
			&b.TrainerID, &b.ClassName,
		); err != nil {
			return nil, fmt.Errorf("failed to scan booking: %w", err)
		}

		if feedbackRating.Valid {
			rating := int(feedbackRating.Int32)
			b.FeedbackRating = &rating
		}

		if feedbackComment.Valid {
			b.FeedbackComment = feedbackComment.String
		}

		bookings = append(bookings, b)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating booking rows: %w", err)
	}

	return bookings, nil
}

// GetByID returns a booking by its ID
func (r *BookingRepository) GetByID(ctx context.Context, id int) (model.BookingResponse, error) {
	query := `
		SELECT b.*, s.day_of_week, s.start_time, s.trainer_id, c.class_name
		FROM class_bookings b
		JOIN class_schedule s ON b.schedule_id = s.schedule_id
		JOIN classes c ON s.class_id = c.class_id
		WHERE b.booking_id = $1
	`

	var b model.BookingResponse
	var feedbackRating sql.NullInt32
	var feedbackComment sql.NullString

	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&b.BookingID, &b.ScheduleID, &b.MemberID, &b.BookingDate,
		&b.AttendanceStatus, &feedbackRating, &feedbackComment,
		&b.CreatedAt, &b.UpdatedAt, &b.DayOfWeek, &b.StartTime,
		&b.TrainerID, &b.ClassName,
	)

	if err == sql.ErrNoRows {
		return model.BookingResponse{}, errors.New("booking not found")
	} else if err != nil {
		return model.BookingResponse{}, fmt.Errorf("failed to fetch booking: %w", err)
	}

	if feedbackRating.Valid {
		rating := int(feedbackRating.Int32)
		b.FeedbackRating = &rating
	}

	if feedbackComment.Valid {
		b.FeedbackComment = feedbackComment.String
	}

	return b, nil
}

// GetByMemberID returns bookings for a specific member
func (r *BookingRepository) GetByMemberID(ctx context.Context, memberID int) ([]model.BookingResponse, error) {
	query := `
		SELECT b.*, s.day_of_week, s.start_time, s.trainer_id, c.class_name
		FROM class_bookings b
		JOIN class_schedule s ON b.schedule_id = s.schedule_id
		JOIN classes c ON s.class_id = c.class_id
		WHERE b.member_id = $1
		ORDER BY b.booking_date DESC
	`

	rows, err := r.db.QueryContext(ctx, query, memberID)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch bookings: %w", err)
	}
	defer rows.Close()

	var bookings []model.BookingResponse
	for rows.Next() {
		var b model.BookingResponse
		var feedbackRating sql.NullInt32
		var feedbackComment sql.NullString

		if err := rows.Scan(
			&b.BookingID, &b.ScheduleID, &b.MemberID, &b.BookingDate,
			&b.AttendanceStatus, &feedbackRating, &feedbackComment,
			&b.CreatedAt, &b.UpdatedAt, &b.DayOfWeek, &b.StartTime,
			&b.TrainerID, &b.ClassName,
		); err != nil {
			return nil, fmt.Errorf("failed to scan booking: %w", err)
		}

		if feedbackRating.Valid {
			rating := int(feedbackRating.Int32)
			b.FeedbackRating = &rating
		}

		if feedbackComment.Valid {
			b.FeedbackComment = feedbackComment.String
		}

		bookings = append(bookings, b)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating booking rows: %w", err)
	}

	return bookings, nil
}

// Create adds a new booking
func (r *BookingRepository) Create(ctx context.Context, booking model.Booking) (model.Booking, error) {
	query := `
		INSERT INTO class_bookings (schedule_id, member_id, booking_date, attendance_status)
		VALUES ($1, $2, $3, 'booked')
		RETURNING booking_id, attendance_status, created_at, updated_at
	`

	err := r.db.QueryRowContext(
		ctx, query,
		booking.ScheduleID, booking.MemberID, booking.BookingDate,
	).Scan(
		&booking.BookingID, &booking.AttendanceStatus,
		&booking.CreatedAt, &booking.UpdatedAt,
	)

	if err != nil {
		return model.Booking{}, fmt.Errorf("failed to create booking: %w", err)
	}

	return booking, nil
}

// UpdateStatus updates a booking's attendance status
func (r *BookingRepository) UpdateStatus(ctx context.Context, id int, status string) (model.Booking, error) {
	query := `
		UPDATE class_bookings
		SET attendance_status = $1, updated_at = NOW()
		WHERE booking_id = $2
		RETURNING *
	`

	var booking model.Booking
	var feedbackRating sql.NullInt32
	var feedbackComment sql.NullString

	err := r.db.QueryRowContext(ctx, query, status, id).Scan(
		&booking.BookingID, &booking.ScheduleID, &booking.MemberID,
		&booking.BookingDate, &booking.AttendanceStatus, &feedbackRating,
		&feedbackComment, &booking.CreatedAt, &booking.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		return model.Booking{}, errors.New("booking not found")
	} else if err != nil {
		return model.Booking{}, fmt.Errorf("failed to update booking status: %w", err)
	}

	if feedbackRating.Valid {
		rating := int(feedbackRating.Int32)
		booking.FeedbackRating = &rating
	}

	if feedbackComment.Valid {
		booking.FeedbackComment = feedbackComment.String
	}

	return booking, nil
}

// AddFeedback adds feedback to a booking
func (r *BookingRepository) AddFeedback(ctx context.Context, id int, rating int, comment string) (model.Booking, error) {
	query := `
		UPDATE class_bookings
		SET feedback_rating = $1, feedback_comment = $2, updated_at = NOW()
		WHERE booking_id = $3
		RETURNING *
	`

	var booking model.Booking
	var feedbackRating sql.NullInt32
	var feedbackComment sql.NullString

	err := r.db.QueryRowContext(ctx, query, rating, comment, id).Scan(
		&booking.BookingID, &booking.ScheduleID, &booking.MemberID,
		&booking.BookingDate, &booking.AttendanceStatus, &feedbackRating,
		&feedbackComment, &booking.CreatedAt, &booking.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		return model.Booking{}, errors.New("booking not found")
	} else if err != nil {
		return model.Booking{}, fmt.Errorf("failed to add feedback: %w", err)
	}

	if feedbackRating.Valid {
		rating := int(feedbackRating.Int32)
		booking.FeedbackRating = &rating
	}

	if feedbackComment.Valid {
		booking.FeedbackComment = feedbackComment.String
	}

	return booking, nil
}

// Cancel cancels a booking
func (r *BookingRepository) Cancel(ctx context.Context, id int) (model.Booking, error) {
	return r.UpdateStatus(ctx, id, "cancelled")
}

// CheckCapacity returns the current booking count and capacity for a schedule
func (r *BookingRepository) CheckCapacity(ctx context.Context, scheduleID int) (int, int, error) {
	// Get the class capacity
	var capacity int
	err := r.db.QueryRowContext(
		ctx,
		`SELECT c.capacity 
		FROM class_schedule s 
		JOIN classes c ON s.class_id = c.class_id 
		WHERE s.schedule_id = $1`,
		scheduleID,
	).Scan(&capacity)

	if err == sql.ErrNoRows {
		return 0, 0, errors.New("schedule not found")
	} else if err != nil {
		return 0, 0, fmt.Errorf("failed to get class capacity: %w", err)
	}

	// Get the current booking count
	var bookingCount int
	err = r.db.QueryRowContext(
		ctx,
		"SELECT COUNT(*) FROM class_bookings WHERE schedule_id = $1 AND attendance_status != 'cancelled'",
		scheduleID,
	).Scan(&bookingCount)

	if err != nil {
		return 0, 0, fmt.Errorf("failed to get booking count: %w", err)
	}

	return bookingCount, capacity, nil
}
