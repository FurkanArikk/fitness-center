package handler

import (
	"github.com/furkan/fitness-center/backend/facility-service/internal/repository"
	"github.com/furkan/fitness-center/backend/facility-service/internal/service"
	"github.com/gin-gonic/gin"
)

// Handler manages HTTP requests
type Handler struct {
	repo repository.Repository
	svc  service.Service
}

// New creates a new handler
func New(repo repository.Repository) *Handler {
	return &Handler{
		repo: repo,
	}
}

// SetService sets the service for the handler
func (h *Handler) SetService(svc service.Service) {
	h.svc = svc
}

// RegisterRoutes registers API routes
func (h *Handler) RegisterRoutes(router *gin.Engine) {
	api := router.Group("/api/v1")

	// Equipment endpoints
	equipment := api.Group("/equipment")
	{
		equipment.POST("", h.CreateEquipment)
		equipment.GET("", h.ListEquipment)
		equipment.GET("/:id", h.GetEquipment)
		equipment.PUT("/:id", h.UpdateEquipment)
		equipment.DELETE("/:id", h.DeleteEquipment)
		equipment.GET("/category/:category", h.ListEquipmentByCategory)
		equipment.GET("/status/:status", h.ListEquipmentByStatus)
		equipment.GET("/maintenance", h.ListEquipmentByMaintenance)
	}

	// Facility endpoints
	facilities := api.Group("/facilities")
	{
		facilities.POST("", h.CreateFacility)
		facilities.GET("", h.ListFacilities)
		facilities.GET("/:id", h.GetFacility)
		facilities.PUT("/:id", h.UpdateFacility)
		facilities.DELETE("/:id", h.DeleteFacility)
		facilities.GET("/status/:status", h.ListFacilitiesByStatus)
	}

	// Attendance endpoints
	attendance := api.Group("/attendance")
	{
		attendance.POST("", h.CreateAttendance)
		attendance.GET("", h.ListAttendance)
		attendance.GET("/:id", h.GetAttendance)
		attendance.PUT("/:id", h.UpdateAttendance)
		attendance.DELETE("/:id", h.DeleteAttendance)
		attendance.POST("/:id/checkout", h.CheckoutAttendance)
		attendance.GET("/member/:memberID", h.ListAttendanceByMember)
		attendance.GET("/facility/:facilityID", h.ListAttendanceByFacility)
		attendance.GET("/date/:date", h.ListAttendanceByDate)
	}
}
