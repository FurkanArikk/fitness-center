package handler

import (
	"database/sql"

	"github.com/gin-gonic/gin"
)

// Handler holds all HTTP handlers and their dependencies
type Handler struct {
	DB *sql.DB
}

// NewHandler creates a new handler with the given dependencies
func NewHandler(db *sql.DB) *Handler {
	return &Handler{
		DB: db,
	}
}

// SetupRoutes configures all routes for the API
func (h *Handler) SetupRoutes(router *gin.Engine) {
	api := router.Group("/api/v1")

	// Classes routes
	api.GET("/classes", h.GetClasses)
	api.GET("/classes/:id", h.GetClassByID)
	api.POST("/classes", h.CreateClass)
	api.PUT("/classes/:id", h.UpdateClass)
	api.DELETE("/classes/:id", h.DeleteClass)

	// Schedule routes
	api.GET("/schedules", h.GetSchedules)
	api.GET("/schedules/:id", h.GetScheduleByID)
	api.GET("/schedules/class/:classId", h.GetSchedulesByClassID)
	api.POST("/schedules", h.CreateSchedule)
	api.PUT("/schedules/:id", h.UpdateSchedule)
	api.DELETE("/schedules/:id", h.DeleteSchedule)

	// Booking routes
	api.GET("/bookings", h.GetBookings)
	api.GET("/bookings/:id", h.GetBookingByID)
	api.GET("/bookings/member/:memberId", h.GetBookingsByMemberID)
	api.POST("/bookings", h.CreateBooking)
	api.PUT("/bookings/:id/status", h.UpdateBookingStatus)
	api.POST("/bookings/:id/feedback", h.AddBookingFeedback)
	api.DELETE("/bookings/:id", h.CancelBooking)
}
