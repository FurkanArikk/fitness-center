package handler

import (
	"net/http"
	"time"

	"github.com/FurkanArikk/fitness-center/backend/staff-service/internal/db"
	"github.com/FurkanArikk/fitness-center/backend/staff-service/internal/model"
	"github.com/FurkanArikk/fitness-center/backend/staff-service/internal/service"
	"github.com/gin-gonic/gin"
)

// StaffHandler handles staff-related requests
type StaffHandler struct {
	db      *db.PostgresDB
	service model.StaffService
}

// QualificationHandler handles qualification-related requests
type QualificationHandler struct {
	db      *db.PostgresDB
	service model.QualificationService
}

// TrainerHandler handles trainer-related requests
type TrainerHandler struct {
	db      *db.PostgresDB
	service model.TrainerService
}

// TrainingHandler handles training session-related requests
type TrainingHandler struct {
	db      *db.PostgresDB
	service model.PersonalTrainingService
}

// Handler provides the interface to the handler functions
type Handler struct {
	db                   *db.PostgresDB
	StaffHandler         *StaffHandler
	QualificationHandler *QualificationHandler
	TrainerHandler       *TrainerHandler
	TrainingHandler      *TrainingHandler
}

// NewHandler creates a new handler instance with the given database connection
func NewHandler(db *db.PostgresDB, services *service.Service) *Handler {
	handler := &Handler{
		db: db,
	}

	// Initialize sub-handlers with services
	handler.StaffHandler = &StaffHandler{db: db, service: services.StaffService}
	handler.QualificationHandler = &QualificationHandler{db: db, service: services.QualificationService}
	handler.TrainerHandler = &TrainerHandler{db: db, service: services.TrainerService}
	handler.TrainingHandler = &TrainingHandler{db: db, service: services.TrainingService}

	return handler
}

// HealthCheck handles the health check endpoint
func (h *Handler) HealthCheck(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"service": "staff-service",
		"status":  "up",
		"time":    time.Now().Format(time.RFC3339),
	})
}
