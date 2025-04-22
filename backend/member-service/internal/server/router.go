package server

import (
	"net/http"

	"github.com/FurkanArikk/fitness-center/backend/member-service/internal/handler"
	"github.com/gorilla/mux"
)

// SetupRoutes configures the router for the member service
func SetupRoutes(handler *handler.Handler) *mux.Router {
	router := mux.NewRouter()

	// Health check endpoint
	router.HandleFunc("/health", handler.HealthCheck).Methods(http.MethodGet)

	// API version prefix
	apiRouter := router.PathPrefix("/api/v1").Subrouter()

	// Member routes
	members := apiRouter.PathPrefix("/members").Subrouter()
	members.HandleFunc("", handler.MemberHandler.CreateMember).Methods(http.MethodPost)
	members.HandleFunc("", handler.MemberHandler.ListMembers).Methods(http.MethodGet)
	members.HandleFunc("/{id:[0-9]+}", handler.MemberHandler.GetMember).Methods(http.MethodGet)
	members.HandleFunc("/{id:[0-9]+}", handler.MemberHandler.UpdateMember).Methods(http.MethodPut)
	members.HandleFunc("/{id:[0-9]+}", handler.MemberHandler.DeleteMember).Methods(http.MethodDelete)
	members.HandleFunc("/{memberID:[0-9]+}/memberships", handler.MemberMembershipHandler.GetMemberMemberships).Methods(http.MethodGet)
	members.HandleFunc("/{memberID:[0-9]+}/active-membership", handler.MemberMembershipHandler.GetActiveMemberMembership).Methods(http.MethodGet)
	members.HandleFunc("/{memberID:[0-9]+}/assessments", handler.AssessmentHandler.GetMemberAssessments).Methods(http.MethodGet)

	// Membership routes
	memberships := apiRouter.PathPrefix("/memberships").Subrouter()
	memberships.HandleFunc("", handler.MembershipHandler.CreateMembership).Methods(http.MethodPost)
	memberships.HandleFunc("", handler.MembershipHandler.GetAllMemberships).Methods(http.MethodGet)
	memberships.HandleFunc("/{id:[0-9]+}", handler.MembershipHandler.GetMembership).Methods(http.MethodGet)
	memberships.HandleFunc("/{id:[0-9]+}", handler.MembershipHandler.UpdateMembership).Methods(http.MethodPut)
	memberships.HandleFunc("/{id:[0-9]+}", handler.MembershipHandler.DeleteMembership).Methods(http.MethodDelete)
	memberships.HandleFunc("/{id:[0-9]+}/status", handler.MembershipHandler.ToggleMembershipStatus).Methods(http.MethodPut)
	memberships.HandleFunc("/{membershipID:[0-9]+}/benefits", handler.BenefitHandler.GetMembershipBenefits).Methods(http.MethodGet)

	// Benefit routes
	benefits := apiRouter.PathPrefix("/benefits").Subrouter()
	benefits.HandleFunc("", handler.BenefitHandler.CreateBenefit).Methods(http.MethodPost)
	benefits.HandleFunc("", handler.BenefitHandler.GetAllBenefits).Methods(http.MethodGet)
	benefits.HandleFunc("/{id:[0-9]+}", handler.BenefitHandler.GetBenefit).Methods(http.MethodGet)
	benefits.HandleFunc("/{id:[0-9]+}", handler.BenefitHandler.UpdateBenefit).Methods(http.MethodPut)
	benefits.HandleFunc("/{id:[0-9]+}", handler.BenefitHandler.DeleteBenefit).Methods(http.MethodDelete)

	// Assessment routes
	assessments := apiRouter.PathPrefix("/assessments").Subrouter()
	assessments.HandleFunc("", handler.AssessmentHandler.CreateAssessment).Methods(http.MethodPost)
	assessments.HandleFunc("/{id:[0-9]+}", handler.AssessmentHandler.GetAssessment).Methods(http.MethodGet)
	assessments.HandleFunc("/{id:[0-9]+}", handler.AssessmentHandler.UpdateAssessment).Methods(http.MethodPut)
	assessments.HandleFunc("/{id:[0-9]+}", handler.AssessmentHandler.DeleteAssessment).Methods(http.MethodDelete)

	// Member-Membership routes
	memberMemberships := apiRouter.PathPrefix("/member-memberships").Subrouter()
	memberMemberships.HandleFunc("", handler.MemberMembershipHandler.CreateMemberMembership).Methods(http.MethodPost)
	memberMemberships.HandleFunc("/{id:[0-9]+}", handler.MemberMembershipHandler.GetMemberMembership).Methods(http.MethodGet)
	memberMemberships.HandleFunc("/{id:[0-9]+}", handler.MemberMembershipHandler.UpdateMemberMembership).Methods(http.MethodPut)
	memberMemberships.HandleFunc("/{id:[0-9]+}", handler.MemberMembershipHandler.DeleteMemberMembership).Methods(http.MethodDelete)

	return router
}
