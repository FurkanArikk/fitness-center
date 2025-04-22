package handler

import (
	"net/http"

	"github.com/FurkanArikk/fitness-center/backend/member-service/internal/service"
)

// Handler contains all HTTP handlers for the member service
type Handler struct {
	MemberHandler           *MemberHandler
	MembershipHandler       *MembershipHandler
	MemberMembershipHandler *MemberMembershipHandler
	BenefitHandler          *BenefitHandler
	AssessmentHandler       *AssessmentHandler
}

// NewHandler creates a new Handler with all required services
func NewHandler(
	memberService service.MemberService,
	membershipService service.MembershipService,
	memberMembershipService service.MemberMembershipService,
	benefitService service.BenefitService,
	assessmentService service.FitnessAssessmentService,
) *Handler {
	return &Handler{
		MemberHandler:           NewMemberHandler(memberService),
		MembershipHandler:       NewMembershipHandler(membershipService),
		MemberMembershipHandler: NewMemberMembershipHandler(memberMembershipService, memberService), // Pass memberService
		BenefitHandler:          NewBenefitHandler(benefitService),
		AssessmentHandler:       NewAssessmentHandler(assessmentService),
	}
}

// HealthCheck provides a simple health check endpoint
func (h *Handler) HealthCheck(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Member service is healthy"))
}
