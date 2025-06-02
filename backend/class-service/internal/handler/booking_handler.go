package handler

import (
	"net/http"
	"strconv"

	"github.com/FurkanArikk/fitness-center/backend/class-service/pkg/dto"
	"github.com/gin-gonic/gin"
)

// GetBookings handles GET /bookings
func (h *BookingHandler) GetBookings(c *gin.Context) {
	// Get query parameters
	status := c.Query("status")
	date := c.Query("date")

	// Parse pagination parameters
	params := ParsePaginationParams(c)

	bookings, total, err := h.service.GetBookingsPaginated(c.Request.Context(), status, date, params.Offset, params.PageSize)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Convert model.BookingResponse to dto.BookingResponse
	dtoBookings := dto.BookingResponseListFromModel(bookings)

	response := CreatePaginatedResponse(dtoBookings, params, total)
	c.JSON(http.StatusOK, response)
}

// GetBookingByID handles GET /bookings/:id
func (h *BookingHandler) GetBookingByID(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid booking ID"})
		return
	}

	booking, err := h.service.GetBookingByID(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Booking not found"})
		return
	}

	// Convert model.BookingResponse to dto.BookingResponse
	dtoBooking := dto.BookingResponseFromBookingResponse(booking)

	c.JSON(http.StatusOK, gin.H{
		"data": dtoBooking,
	})
}

// CreateBooking handles POST /bookings
func (h *BookingHandler) CreateBooking(c *gin.Context) {
	var req dto.BookingCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Convert DTO to model
	modelReq := req.ToModel()

	booking, err := h.service.CreateBooking(c.Request.Context(), modelReq)
	if err != nil {
		if err.Error() == "class is already at full capacity" {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		} else if err.Error() == "invalid schedule ID" {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		} else if err.Error() == "member already has a booking for this schedule" ||
			err.Error() == "ERROR: duplicate key value violates unique constraint \"unique_booking\" (SQLSTATE 23505)" ||
			err.Error() == "failed to create booking: ERROR: duplicate key value violates unique constraint \"unique_booking\" (SQLSTATE 23505)" {
			c.JSON(http.StatusConflict, gin.H{"error": "Member already has a booking for this schedule"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Convert model.Booking to dto.BookingResponse
	dtoBooking := dto.BookingResponseFromModel(booking)

	c.JSON(http.StatusCreated, gin.H{
		"data":    dtoBooking,
		"message": "Booking created successfully",
	})
}

// UpdateBooking handles PUT /bookings/:id
func (h *BookingHandler) UpdateBooking(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid booking ID"})
		return
	}

	var req dto.BookingStatusUpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	booking, err := h.service.UpdateBookingStatus(c.Request.Context(), id, req.AttendanceStatus)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Convert model.Booking to dto.BookingResponse
	dtoBooking := dto.BookingResponseFromModel(booking)

	c.JSON(http.StatusOK, gin.H{
		"data":    dtoBooking,
		"message": "Booking updated successfully",
	})
}

// DeleteBooking handles DELETE /bookings/:id
func (h *BookingHandler) DeleteBooking(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid booking ID"})
		return
	}

	// First check if booking exists
	_, err = h.service.GetBookingByID(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Booking not found"})
		return
	}

	_, err = h.service.CancelBooking(c.Request.Context(), id)
	if err != nil {
		if err.Error() == "only bookings with 'booked' status can be cancelled" {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Booking cancelled successfully",
	})
}

// AddFeedback handles POST /bookings/:id/feedback
func (h *BookingHandler) AddFeedback(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid booking ID"})
		return
	}

	// Check if booking exists
	_, err = h.service.GetBookingByID(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Booking not found"})
		return
	}

	var req dto.BookingFeedbackRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Convert DTO to model
	modelReq := req.ToModel()

	booking, err := h.service.AddBookingFeedback(c.Request.Context(), id, modelReq)
	if err != nil {
		if err.Error() == "feedback can only be provided for attended classes" {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Convert model.Booking to dto.BookingResponse
	dtoBooking := dto.BookingResponseFromModel(booking)

	c.JSON(http.StatusOK, gin.H{
		"data":    dtoBooking,
		"message": "Feedback added successfully",
	})
}
