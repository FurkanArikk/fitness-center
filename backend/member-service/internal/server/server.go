package server

import (
	"context"
	"log"
	"net/http"
	"time"

	"github.com/FurkanArikk/fitness-center/backend/member-service/internal/handler"
	"github.com/gin-gonic/gin"
)

// Server represents the HTTP server
type Server struct {
	router     *gin.Engine
	httpServer *http.Server
}

// NewServer creates a new server instance
func NewServer(h *handler.Handler, port string) *Server {
	router := gin.Default()

	// Health check endpoint with standardized response format
	router.GET("/health", h.HealthCheck)

	// API routes
	api := router.Group("/api/v1")
	{
		members := api.Group("/members")
		{
			members.GET("", h.MemberHandler.GetMembers)
			members.GET("/:id", h.MemberHandler.GetMemberByID)
			members.POST("", h.MemberHandler.CreateMember)
			members.PUT("/:id", h.MemberHandler.UpdateMember)
			members.DELETE("/:id", h.MemberHandler.DeleteMember)
		}

		// Move these routes outside of the members group to avoid conflicts
		api.GET("/members/:id/memberships", h.MemberMembershipHandler.GetMemberMemberships)
		api.GET("/members/:id/active-membership", h.MemberMembershipHandler.GetActiveMembership)
		api.GET("/members/:id/assessments", h.AssessmentHandler.GetMemberAssessments)

		memberships := api.Group("/memberships")
		{
			memberships.GET("", h.MembershipHandler.GetMemberships)
			memberships.GET("/:id", h.MembershipHandler.GetMembershipByID)
			memberships.POST("", h.MembershipHandler.CreateMembership)
			memberships.PUT("/:id", h.MembershipHandler.UpdateMembership)
			memberships.DELETE("/:id", h.MembershipHandler.DeleteMembership)
			memberships.PUT("/:id/status", h.MembershipHandler.ToggleMembershipStatus)
		}

		// Move this route outside of the memberships group to avoid parameter conflicts
		api.GET("/memberships/:id/benefits", h.MembershipHandler.GetMembershipBenefits)

		benefits := api.Group("/benefits")
		{
			benefits.GET("", h.BenefitHandler.GetBenefits)
			benefits.GET("/:id", h.BenefitHandler.GetBenefitByID)
			benefits.POST("", h.BenefitHandler.CreateBenefit)
			benefits.PUT("/:id", h.BenefitHandler.UpdateBenefit)
			benefits.DELETE("/:id", h.BenefitHandler.DeleteBenefit)
		}

		assessments := api.Group("/assessments")
		{
			assessments.GET("/:id", h.AssessmentHandler.GetAssessmentByID)
			assessments.POST("", h.AssessmentHandler.CreateAssessment)
			assessments.PUT("/:id", h.AssessmentHandler.UpdateAssessment)
			assessments.DELETE("/:id", h.AssessmentHandler.DeleteAssessment)
		}

		memberMemberships := api.Group("/member-memberships")
		{
			memberMemberships.GET("/:id", h.MemberMembershipHandler.GetMemberMembershipByID)
			memberMemberships.POST("", h.MemberMembershipHandler.CreateMemberMembership)
			memberMemberships.PUT("/:id", h.MemberMembershipHandler.UpdateMemberMembership)
			memberMemberships.DELETE("/:id", h.MemberMembershipHandler.DeleteMemberMembership)
		}
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
