package server

import (
	"github.com/furkan/fitness-center/backend/facility-service/internal/handler"
	"github.com/gin-gonic/gin"
)

// setupRoutes configures all API routes for the facility service
func setupRoutes(router *gin.Engine, handler *handler.Handler) {
	// Health check endpoint
	router.GET("/health", handler.HealthCheck)

	// API v1 routes
	api := router.Group("/api/v1")
	{
		// Equipment routes
		equipment := api.Group("/equipment")
		{
			equipment.POST("", handler.CreateEquipment)
			equipment.GET("", handler.ListEquipment)
			equipment.GET("/:id", handler.GetEquipment)
			equipment.PUT("/:id", handler.UpdateEquipment)
			equipment.DELETE("/:id", handler.DeleteEquipment)
			equipment.GET("/category/:category", handler.ListEquipmentByCategory)
			equipment.GET("/status/:status", handler.ListEquipmentByStatus)
			equipment.GET("/maintenance", handler.ListEquipmentByMaintenance)
		}

		// Facility routes
		facilities := api.Group("/facilities")
		{
			facilities.POST("", handler.CreateFacility)
			facilities.GET("", handler.ListFacilities)
			facilities.GET("/:id", handler.GetFacility)
			facilities.PUT("/:id", handler.UpdateFacility)
			facilities.DELETE("/:id", handler.DeleteFacility)
			facilities.GET("/status/:status", handler.ListFacilitiesByStatus)
		}

		// Attendance routes
		attendance := api.Group("/attendance")
		{
			attendance.POST("", handler.CreateAttendance)
			attendance.GET("", handler.ListAttendance)
			attendance.GET("/:id", handler.GetAttendance)
			attendance.PUT("/:id", handler.UpdateAttendance)
			attendance.DELETE("/:id", handler.DeleteAttendance)
			attendance.POST("/:id/checkout", handler.CheckoutAttendance)
			attendance.GET("/member/:memberID", handler.ListAttendanceByMember)
			attendance.GET("/facility/:facilityID", handler.ListAttendanceByFacility)
			attendance.GET("/date/:date", handler.ListAttendanceByDate)
		}
	}
}
