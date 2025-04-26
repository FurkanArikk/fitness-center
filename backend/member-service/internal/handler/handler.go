package handler

import (
	"net/http"
	"time"

	"github.com/FurkanArikk/fitness-center/backend/member-service/internal/db"
	"github.com/FurkanArikk/fitness-center/backend/member-service/internal/service"
	"github.com/gin-gonic/gin"
)

// MemberHandler handles member-related requests
type MemberHandler struct {
	db      *db.PostgresDB
	service service.MemberService
}

// MembershipHandler handles membership-related requests
type MembershipHandler struct {
	db             *db.PostgresDB
	service        service.MembershipService
	benefitService service.BenefitService // Add this field
}

// MemberMembershipHandler handles member-membership-related requests
type MemberMembershipHandler struct {
	db      *db.PostgresDB
	service service.MemberMembershipService
}

// AssessmentHandler handles assessment-related requests
type AssessmentHandler struct {
	db      *db.PostgresDB
	service service.FitnessAssessmentService
}

// BenefitHandler handles benefit-related requests
type BenefitHandler struct {
	db      *db.PostgresDB
	service service.BenefitService
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

// NewHandler creates a new handler instance with the given database connection and services
func NewHandler(
	db *db.PostgresDB,
	memberService service.MemberService,
	membershipService service.MembershipService,
	memberMembershipService service.MemberMembershipService,
	assessmentService service.FitnessAssessmentService,
	benefitService service.BenefitService,
) *Handler {
	handler := &Handler{
		db: db,
	}

	// Initialize sub-handlers with services
	handler.MemberHandler = &MemberHandler{db: db, service: memberService}
	handler.MembershipHandler = &MembershipHandler{
		db:             db,
		service:        membershipService,
		benefitService: benefitService, // Pass the benefit service
	}
	handler.MemberMembershipHandler = &MemberMembershipHandler{db: db, service: memberMembershipService}
	handler.AssessmentHandler = &AssessmentHandler{db: db, service: assessmentService}
	handler.BenefitHandler = &BenefitHandler{db: db, service: benefitService}

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
