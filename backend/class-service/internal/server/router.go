package server

import (
	"github.com/FurkanArikk/fitness-center/backend/class-service/internal/handler"
	"github.com/gin-gonic/gin"
)

// setupRoutes configures all API routes for the application
func setupRoutes(router *gin.Engine, handler *handler.Handler) {
	// Health check endpoint
	router.GET("/health", handler.HealthCheck)

	// API v1 routes
	api := router.Group("/api/v1")
	{
		// Class routes
		classes := api.Group("/classes")
		{
			classes.GET("", handler.ClassHandler.GetClasses)
			classes.GET("/:id", handler.ClassHandler.GetClassByID)
			classes.POST("", handler.ClassHandler.CreateClass)
			classes.PUT("/:id", handler.ClassHandler.UpdateClass)
			classes.DELETE("/:id", handler.ClassHandler.DeleteClass)
		}

		// Schedule routes
		schedules := api.Group("/schedules")
		{
			schedules.GET("", handler.ScheduleHandler.GetSchedules)
			schedules.GET("/:id", handler.ScheduleHandler.GetScheduleByID)
			schedules.GET("/class/:class_id", handler.ScheduleHandler.GetSchedulesByClassID)
			schedules.POST("", handler.ScheduleHandler.CreateSchedule)
			schedules.PUT("/:id", handler.ScheduleHandler.UpdateSchedule)
			schedules.DELETE("/:id", handler.ScheduleHandler.DeleteSchedule)
		}

		// Booking routes
		bookings := api.Group("/bookings")
		{
			bookings.GET("", handler.BookingHandler.GetBookings)
			bookings.GET("/:id", handler.BookingHandler.GetBookingByID)
			bookings.POST("", handler.BookingHandler.CreateBooking)
			bookings.PUT("/:id", handler.BookingHandler.UpdateBooking)
			bookings.POST("/:id/feedback", handler.BookingHandler.AddFeedback)
			bookings.DELETE("/:id", handler.BookingHandler.DeleteBooking)
		}
	}
}
