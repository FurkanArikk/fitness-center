package server

import (
	"github.com/FurkanArikk/fitness-center/backend/staff-service/internal/handler"
	"github.com/gin-gonic/gin"
)

// setupRoutes configures all API routes for the application
func setupRoutes(router *gin.Engine, handler *handler.Handler) {
	// Health check endpoint
	router.GET("/health", handler.HealthCheck)

	// API v1 routes
	api := router.Group("/api/v1")
	{
		// Staff routes
		staff := api.Group("/staff")
		{
			staff.GET("", handler.StaffHandler.GetAll)
			staff.GET("/:id", handler.StaffHandler.GetByID)
			staff.POST("", handler.StaffHandler.Create)
			staff.PUT("/:id", handler.StaffHandler.Update)
			staff.DELETE("/:id", handler.StaffHandler.Delete)
			// Get staff qualifications
			staff.GET("/:id/qualifications", handler.QualificationHandler.GetByStaffID)
		}

		// Qualification routes
		qualifications := api.Group("/qualifications")
		{
			qualifications.GET("", handler.QualificationHandler.GetAll)
			qualifications.GET("/:id", handler.QualificationHandler.GetByID)
			qualifications.POST("", handler.QualificationHandler.Create)
			qualifications.PUT("/:id", handler.QualificationHandler.Update)
			qualifications.DELETE("/:id", handler.QualificationHandler.Delete)
		}

		// Trainer routes
		trainers := api.Group("/trainers")
		{
			trainers.GET("", handler.TrainerHandler.GetAll)
			trainers.GET("/:id", handler.TrainerHandler.GetByID)
			trainers.POST("", handler.TrainerHandler.Create)
			trainers.PUT("/:id", handler.TrainerHandler.Update)
			trainers.DELETE("/:id", handler.TrainerHandler.Delete)
			trainers.GET("/top-rated", handler.TrainerHandler.GetTopRated)
			// Use the documented method name for specialization
			trainers.GET("/specialization/:spec", handler.TrainerHandler.GetAll) // This will filter by specialization
		}

		// Training session routes
		trainingSessions := api.Group("/training-sessions")
		{
			trainingSessions.GET("", handler.TrainingHandler.GetTrainingSessions)
			trainingSessions.GET("/:id", handler.TrainingHandler.GetTrainingSessionByID)
			trainingSessions.POST("", handler.TrainingHandler.CreateTrainingSession)
			trainingSessions.PUT("/:id", handler.TrainingHandler.UpdateTrainingSession)
			trainingSessions.DELETE("/:id", handler.TrainingHandler.DeleteTrainingSession)
			trainingSessions.PUT("/:id/cancel", handler.TrainingHandler.CancelTrainingSession)
			trainingSessions.PUT("/:id/complete", handler.TrainingHandler.CompleteTrainingSession)
			// Add route for trainer's sessions using GetTrainingSessions (will use query parameter)
			trainingSessions.GET("/trainer/:id", handler.TrainingHandler.GetTrainingSessions)
		}
	}
}
