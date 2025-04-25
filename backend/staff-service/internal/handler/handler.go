package handler

import (
	"net/http"
	"time"

	"github.com/FurkanArikk/fitness-center/backend/staff-service/internal/db"
	"github.com/gin-gonic/gin"
)

// StaffHandler handles staff-related requests
type StaffHandler struct {
	db *db.PostgresDB
}

// QualificationHandler handles qualification-related requests
type QualificationHandler struct {
	db *db.PostgresDB
}

// TrainerHandler handles trainer-related requests
type TrainerHandler struct {
	db *db.PostgresDB
}

// TrainingHandler handles training session-related requests
type TrainingHandler struct {
	db *db.PostgresDB
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
func NewHandler(db *db.PostgresDB) *Handler {
	handler := &Handler{
		db: db,
	}

	// Initialize sub-handlers
	handler.StaffHandler = &StaffHandler{db: db}
	handler.QualificationHandler = &QualificationHandler{db: db}
	handler.TrainerHandler = &TrainerHandler{db: db}
	handler.TrainingHandler = &TrainingHandler{db: db}

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
