package handler

import (
	"net/http"
	"time"

	"github.com/FurkanArikk/fitness-center/backend/member-service/internal/db"
	"github.com/gin-gonic/gin"
)

// MemberHandler handles member-related requests
type MemberHandler struct {
	db *db.PostgresDB
}

// MembershipHandler handles membership-related requests
type MembershipHandler struct {
	db *db.PostgresDB
}

// MemberMembershipHandler handles member-membership-related requests
type MemberMembershipHandler struct {
	db *db.PostgresDB
}

// AssessmentHandler handles assessment-related requests
type AssessmentHandler struct {
	db *db.PostgresDB
}

// BenefitHandler handles benefit-related requests
type BenefitHandler struct {
	db *db.PostgresDB
}

// Handler provides the interface to the handler functions
type Handler struct {
	db                      *db.PostgresDB
	MemberHandler           *MemberHandler
	MembershipHandler       *MembershipHandler
	MemberMembershipHandler *MemberMembershipHandler
	AssessmentHandler       *AssessmentHandler
	BenefitHandler          *BenefitHandler
}

// NewHandler creates a new handler instance with the given database connection
func NewHandler(db *db.PostgresDB) *Handler {
	handler := &Handler{
		db: db,
	}

	// Initialize sub-handlers
	handler.MemberHandler = &MemberHandler{db: db}
	handler.MembershipHandler = &MembershipHandler{db: db}
	handler.MemberMembershipHandler = &MemberMembershipHandler{db: db}
	handler.AssessmentHandler = &AssessmentHandler{db: db}
	handler.BenefitHandler = &BenefitHandler{db: db}

	return handler
}

// HealthCheck handles the health check endpoint
func (h *Handler) HealthCheck(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"service": "member-service",
		"status":  "up",
		"time":    time.Now().Format(time.RFC3339),
	})
}
