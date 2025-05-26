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

	_, err = h.service.CancelBooking(c.Request.Context(), id)
	if err != nil {
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

	var req dto.BookingFeedbackRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Convert DTO to model
	modelReq := req.ToModel()

	booking, err := h.service.AddBookingFeedback(c.Request.Context(), id, modelReq)
	if err != nil {
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
