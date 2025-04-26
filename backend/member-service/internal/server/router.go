package server

import (
	"github.com/FurkanArikk/fitness-center/backend/member-service/internal/handler"
	"github.com/gin-gonic/gin"
)

// setupRoutes configures all API routes for the application
func setupRoutes(router *gin.Engine, handler *handler.Handler) {
	// Health check endpoint
	router.GET("/health", handler.HealthCheck)

	// API v1 routes
	api := router.Group("/api/v1")
	{
		// Member routes
		members := api.Group("/members")
		{
			members.GET("", handler.MemberHandler.GetMembers)
			members.GET("/:id", handler.MemberHandler.GetMemberByID)
			members.POST("", handler.MemberHandler.CreateMember)
			members.PUT("/:id", handler.MemberHandler.UpdateMember)
			members.DELETE("/:id", handler.MemberHandler.DeleteMember)
			// Use :id instead of :memberID to avoid param conflicts
			members.GET("/:id/memberships", handler.MemberMembershipHandler.GetMemberMemberships)
			members.GET("/:id/active-membership", handler.MemberMembershipHandler.GetActiveMembership)
			members.GET("/:id/assessments", handler.AssessmentHandler.GetMemberAssessments)
		}

		// Membership routes
		memberships := api.Group("/memberships")
		{
			memberships.GET("", handler.MembershipHandler.GetMemberships)
			memberships.GET("/:id", handler.MembershipHandler.GetMembershipByID)
			memberships.POST("", handler.MembershipHandler.CreateMembership)
			memberships.PUT("/:id", handler.MembershipHandler.UpdateMembership)
			memberships.DELETE("/:id", handler.MembershipHandler.DeleteMembership)
			memberships.PUT("/:id/status", handler.MembershipHandler.ToggleMembershipStatus)
			// Use :id to be consistent with other routes
			memberships.GET("/:id/benefits", handler.MembershipHandler.GetMembershipBenefits)
		}

		// Benefit routes
		benefits := api.Group("/benefits")
		{
			benefits.GET("", handler.BenefitHandler.GetBenefits)
			benefits.GET("/:id", handler.BenefitHandler.GetBenefitByID)
			benefits.POST("", handler.BenefitHandler.CreateBenefit)
			benefits.PUT("/:id", handler.BenefitHandler.UpdateBenefit)
			benefits.DELETE("/:id", handler.BenefitHandler.DeleteBenefit)
		}

		// Assessment routes
		assessments := api.Group("/assessments")
		{
			assessments.GET("/:id", handler.AssessmentHandler.GetAssessmentByID)
			assessments.POST("", handler.AssessmentHandler.CreateAssessment)
			assessments.PUT("/:id", handler.AssessmentHandler.UpdateAssessment)
			assessments.DELETE("/:id", handler.AssessmentHandler.DeleteAssessment)
		}

		// Member-Membership routes
		memberMemberships := api.Group("/member-memberships")
		{
			memberMemberships.GET("/:id", handler.MemberMembershipHandler.GetMemberMembershipByID)
			memberMemberships.POST("", handler.MemberMembershipHandler.CreateMemberMembership)
			memberMemberships.PUT("/:id", handler.MemberMembershipHandler.UpdateMemberMembership)
			memberMemberships.DELETE("/:id", handler.MemberMembershipHandler.DeleteMemberMembership)
		}
	}
}
