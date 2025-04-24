package handler

import (
	"database/sql"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"

	"github.com/FurkanArikk/fitness-center/backend/class-service/internal/model"
)

// GetBookings handles the request to get all bookings
func (h *Handler) GetBookings(c *gin.Context) {
	status := c.Query("status")
	dateStr := c.Query("date")

	query := `
		SELECT b.*, s.day_of_week, s.start_time, s.trainer_id, c.class_name
		FROM class_bookings b
		JOIN class_schedule s ON b.schedule_id = s.schedule_id
		JOIN classes c ON s.class_id = c.class_id
	`

	whereAdded := false
	var args []interface{}
	var argCount int

	if status != "" {
		query += " WHERE b.attendance_status = $1"
		args = append(args, status)
		argCount++
		whereAdded = true
	}

	if dateStr != "" {
		date, err := time.Parse("2006-01-02", dateStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date format. Use YYYY-MM-DD"})
			return
		}

		if whereAdded {
			argCount++
			query += " AND DATE(b.booking_date) = $" + strconv.Itoa(argCount)
		} else {
			query += " WHERE DATE(b.booking_date) = $1"
			argCount++
			whereAdded = true
		}
		args = append(args, date)
	}

	query += " ORDER BY b.booking_date DESC"

	var rows *sql.Rows
	var err error

	if len(args) > 0 {
		rows, err = h.DB.Query(query, args...)
	} else {
		rows, err = h.DB.Query(query)
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch bookings"})
		return
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
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to scan booking"})
			return
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

	c.JSON(http.StatusOK, bookings)
}

// GetBookingByID handles the request to get a specific booking
func (h *Handler) GetBookingByID(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid booking ID"})
		return
	}

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

	err = h.DB.QueryRow(query, id).Scan(
		&b.BookingID, &b.ScheduleID, &b.MemberID, &b.BookingDate,
		&b.AttendanceStatus, &feedbackRating, &feedbackComment,
		&b.CreatedAt, &b.UpdatedAt, &b.DayOfWeek, &b.StartTime,
		&b.TrainerID, &b.ClassName,
	)

	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "Booking not found"})
		return
	} else if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch booking"})
		return
	}

	if feedbackRating.Valid {
		rating := int(feedbackRating.Int32)
		b.FeedbackRating = &rating
	}

	if feedbackComment.Valid {
		b.FeedbackComment = feedbackComment.String
	}

	c.JSON(http.StatusOK, b)
}

// GetBookingsByMemberID handles the request to get bookings for a specific member
func (h *Handler) GetBookingsByMemberID(c *gin.Context) {
	memberID, err := strconv.Atoi(c.Param("memberId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid member ID"})
		return
	}

	query := `
		SELECT b.*, s.day_of_week, s.start_time, s.trainer_id, c.class_name
		FROM class_bookings b
		JOIN class_schedule s ON b.schedule_id = s.schedule_id
		JOIN classes c ON s.class_id = c.class_id
		WHERE b.member_id = $1
		ORDER BY b.booking_date DESC
	`

	rows, err := h.DB.Query(query, memberID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch bookings"})
		return
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
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to scan booking"})
			return
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

	c.JSON(http.StatusOK, bookings)
}

// CreateBooking handles the request to create a new booking
func (h *Handler) CreateBooking(c *gin.Context) {
	var req model.BookingRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Check if schedule exists and is active
	var scheduleStatus string
	var classCapacity int
	var classID int
	err := h.DB.QueryRow(
		`SELECT s.status, c.capacity, c.class_id 
		FROM class_schedule s 
		JOIN classes c ON s.class_id = c.class_id 
		WHERE s.schedule_id = $1`,
		req.ScheduleID,
	).Scan(&scheduleStatus, &classCapacity, &classID)

	if err == sql.ErrNoRows {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Schedule not found"})
		return
	} else if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check schedule"})
		return
	}

	if scheduleStatus != "active" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cannot book an inactive schedule"})
		return
	}

	// Check capacity
	var bookingCount int
	err = h.DB.QueryRow(
		"SELECT COUNT(*) FROM class_bookings WHERE schedule_id = $1 AND attendance_status != 'cancelled'",
		req.ScheduleID,
	).Scan(&bookingCount)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check capacity"})
		return
	}

	if bookingCount >= classCapacity {
		c.JSON(http.StatusConflict, gin.H{"error": "Class is already at full capacity"})
		return
	}

	query := `
		INSERT INTO class_bookings (schedule_id, member_id, booking_date, attendance_status)
		VALUES ($1, $2, $3, 'booked')
		RETURNING booking_id, attendance_status, created_at, updated_at
	`

	var booking model.Booking
	booking.ScheduleID = req.ScheduleID
	booking.MemberID = req.MemberID
	booking.BookingDate = req.BookingDate

	err = h.DB.QueryRow(
		query,
		booking.ScheduleID, booking.MemberID, booking.BookingDate,
	).Scan(
		&booking.BookingID, &booking.AttendanceStatus,
		&booking.CreatedAt, &booking.UpdatedAt,
	)

	if err != nil {
		// Check if it's a unique constraint violation (duplicate booking)
		if err.Error() == "pq: duplicate key value violates unique constraint \"idx_unique_booking\"" {
			c.JSON(http.StatusConflict, gin.H{"error": "Member already has a booking for this class"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create booking"})
		return
	}

	c.JSON(http.StatusCreated, booking)
}

// UpdateBookingStatus handles the request to update a booking's attendance status
func (h *Handler) UpdateBookingStatus(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid booking ID"})
		return
	}

	var req model.BookingStatusUpdate
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	query := `
		UPDATE class_bookings
		SET attendance_status = $1, updated_at = NOW()
		WHERE booking_id = $2
		RETURNING *
	`

	var booking model.Booking
	var feedbackRating sql.NullInt32
	var feedbackComment sql.NullString

	err = h.DB.QueryRow(
		query, req.AttendanceStatus, id,
	).Scan(
		&booking.BookingID, &booking.ScheduleID, &booking.MemberID,
		&booking.BookingDate, &booking.AttendanceStatus, &feedbackRating,
		&feedbackComment, &booking.CreatedAt, &booking.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "Booking not found"})
		return
	} else if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update booking status"})
		return
	}

	if feedbackRating.Valid {
		rating := int(feedbackRating.Int32)
		booking.FeedbackRating = &rating
	}

	if feedbackComment.Valid {
		booking.FeedbackComment = feedbackComment.String
	}

	c.JSON(http.StatusOK, booking)
}

// AddBookingFeedback handles the request to add feedback to a booking
func (h *Handler) AddBookingFeedback(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid booking ID"})
		return
	}

	var req model.FeedbackRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Check if booking exists and status is attended
	var status string
	err = h.DB.QueryRow("SELECT attendance_status FROM class_bookings WHERE booking_id = $1", id).Scan(&status)
	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "Booking not found"})
		return
	} else if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check booking"})
		return
	}

	if status != "attended" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Feedback can only be provided for attended classes"})
		return
	}

	query := `
		UPDATE class_bookings
		SET feedback_rating = $1, feedback_comment = $2, updated_at = NOW()
		WHERE booking_id = $3
		RETURNING *
	`

	var booking model.Booking
	var feedbackRating sql.NullInt32
	var feedbackComment sql.NullString

	err = h.DB.QueryRow(
		query, req.Rating, req.Comment, id,
	).Scan(
		&booking.BookingID, &booking.ScheduleID, &booking.MemberID,
		&booking.BookingDate, &booking.AttendanceStatus, &feedbackRating,
		&feedbackComment, &booking.CreatedAt, &booking.UpdatedAt,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add feedback"})
		return
	}

	if feedbackRating.Valid {
		rating := int(feedbackRating.Int32)
		booking.FeedbackRating = &rating
	}

	if feedbackComment.Valid {
		booking.FeedbackComment = feedbackComment.String
	}

	c.JSON(http.StatusOK, booking)
}

// CancelBooking handles the request to cancel a booking
func (h *Handler) CancelBooking(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid booking ID"})
		return
	}

	// Check if booking exists and can be cancelled
	var status string
	err = h.DB.QueryRow("SELECT attendance_status FROM class_bookings WHERE booking_id = $1", id).Scan(&status)
	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "Booking not found"})
		return
	} else if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check booking"})
		return
	}

	if status != "booked" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Only bookings with 'booked' status can be cancelled"})
		return
	}

	query := `
		UPDATE class_bookings
		SET attendance_status = 'cancelled', updated_at = NOW()
		WHERE booking_id = $1
		RETURNING *
	`

	var booking model.Booking
	var feedbackRating sql.NullInt32
	var feedbackComment sql.NullString

	err = h.DB.QueryRow(query, id).Scan(
		&booking.BookingID, &booking.ScheduleID, &booking.MemberID,
		&booking.BookingDate, &booking.AttendanceStatus, &feedbackRating,
		&feedbackComment, &booking.CreatedAt, &booking.UpdatedAt,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to cancel booking"})
		return
	}

	c.JSON(http.StatusOK, booking)
}
