package server

import (
	"context"
	"log"
	"net/http"
	"time"

	"github.com/FurkanArikk/fitness-center/backend/staff-service/internal/handler"
	"github.com/gin-gonic/gin"
)

// Server represents the HTTP server
type Server struct {
	router     *gin.Engine
	httpServer *http.Server
}

// NewServer creates a new server instance
func NewServer(h *handler.Handler, port string) *Server {
	// Initialize router without registering the health endpoint
	router := gin.New()

	// Add middleware
	router.Use(gin.Logger())
	router.Use(gin.Recovery())
	router.Use(corsMiddleware())
	router.Use(contentTypeMiddleware())

	// Health check endpoint with standardized response format
	// Registered only once here
	router.GET("/health", h.HealthCheck)

	// API routes
	api := router.Group("/api/v1")
	{
		// Staff routes
		staff := api.Group("/staff")
		{
			staff.GET("", h.StaffHandler.GetAll)
			staff.GET("/:id", h.StaffHandler.GetByID)
			staff.POST("", h.StaffHandler.Create)
			staff.PUT("/:id", h.StaffHandler.Update)
			staff.DELETE("/:id", h.StaffHandler.Delete)
		}

		// Separate route group for staff relationships to avoid path conflicts
		api.GET("/staff/:id/qualifications", h.QualificationHandler.GetByStaffID)
		api.GET("/staff/:id/trainer", h.TrainerHandler.GetByStaffID)

		// Qualification routes
		qualifications := api.Group("/qualifications")
		{
			qualifications.GET("", h.QualificationHandler.GetAll)
			qualifications.GET("/:id", h.QualificationHandler.GetByID)
			qualifications.POST("", h.QualificationHandler.Create)
			qualifications.PUT("/:id", h.QualificationHandler.Update)
			qualifications.DELETE("/:id", h.QualificationHandler.Delete)
		}

		// Trainer routes
		trainers := api.Group("/trainers")
		{
			trainers.GET("", h.TrainerHandler.GetAll)
			trainers.GET("/:id", h.TrainerHandler.GetByID)
			trainers.POST("", h.TrainerHandler.Create)
			trainers.PUT("/:id", h.TrainerHandler.Update)
			trainers.DELETE("/:id", h.TrainerHandler.Delete)
		}

		// Separate routes to avoid path conflicts
		api.GET("/trainers/specialization/:spec", h.TrainerHandler.GetBySpecialization)
		api.GET("/trainers/top/:limit", h.TrainerHandler.GetTopRated)
		api.GET("/trainers/:id/trainings", h.TrainingHandler.GetByTrainerID)

		// Training session routes
		trainings := api.Group("/trainings")
		{
			trainings.GET("", h.TrainingHandler.GetAll)
			trainings.GET("/:id", h.TrainingHandler.GetByID)
			trainings.POST("", h.TrainingHandler.Create)
			trainings.PUT("/:id", h.TrainingHandler.Update)
			trainings.DELETE("/:id", h.TrainingHandler.Delete)
		}

		// Separate routes to avoid path conflicts
		api.GET("/members/:id/trainings", h.TrainingHandler.GetByMemberID)
		api.GET("/trainings/date", h.TrainingHandler.GetByDateRange)
		api.POST("/trainings/schedule", h.TrainingHandler.ScheduleSession)
		api.PUT("/trainings/:id/cancel", h.TrainingHandler.CancelSession)
		api.PUT("/trainings/:id/complete", h.TrainingHandler.CompleteSession)
	}

	srv := &Server{
		router: router,
		httpServer: &http.Server{
			Addr:    ":" + port,
			Handler: router,
		},
	}

	return srv
}

// Start starts the HTTP server
func (s *Server) Start() error {
	log.Printf("Server listening on port %s", s.httpServer.Addr[1:])
	return s.httpServer.ListenAndServe()
}

// Shutdown gracefully shuts down the server
func (s *Server) Shutdown() error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	return s.httpServer.Shutdown(ctx)
}
