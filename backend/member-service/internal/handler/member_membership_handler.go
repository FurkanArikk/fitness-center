package handler

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/FurkanArikk/fitness-center/backend/member-service/internal/model"
	"github.com/FurkanArikk/fitness-center/backend/member-service/internal/service"
	"github.com/gorilla/mux"
)

// MemberMembershipHandler handles HTTP requests for member-membership relationships
type MemberMembershipHandler struct {
	service       service.MemberMembershipService
	memberService service.MemberService // Add member service reference
}

// NewMemberMembershipHandler creates a new MemberMembershipHandler
func NewMemberMembershipHandler(service service.MemberMembershipService, memberService service.MemberService) *MemberMembershipHandler {
	return &MemberMembershipHandler{
		service:       service,
		memberService: memberService,
	}
}

// GetMemberMembership retrieves a member membership by ID
func (h *MemberMembershipHandler) GetMemberMembership(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		http.Error(w, "Invalid member membership ID", http.StatusBadRequest)
		return
	}

	memberMembership, err := h.service.GetByID(r.Context(), id)
	if err != nil {
		http.Error(w, "Member membership not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(memberMembership)
}

// GetMemberMemberships retrieves all memberships for a specific member
func (h *MemberMembershipHandler) GetMemberMemberships(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	memberID, err := strconv.ParseInt(vars["memberID"], 10, 64)
	if err != nil {
		http.Error(w, "Invalid member ID", http.StatusBadRequest)
		return
	}

	memberships, err := h.service.ListByMemberID(r.Context(), memberID)
	if err != nil {
		http.Error(w, "Failed to retrieve memberships", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(memberships)
}

// CreateMemberMembership creates a new member-membership relationship
func (h *MemberMembershipHandler) CreateMemberMembership(w http.ResponseWriter, r *http.Request) {
	var mmReq MemberMembership
	if err := json.NewDecoder(r.Body).Decode(&mmReq); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Convert to model
	memberMembership := &model.MemberMembership{
		MemberID:       mmReq.MemberID,
		MembershipID:   mmReq.MembershipID,
		StartDate:      mmReq.StartDate,
		EndDate:        mmReq.EndDate,
		PaymentStatus:  mmReq.PaymentStatus,
		ContractSigned: mmReq.ContractSigned,
	}

	if err := h.service.Create(r.Context(), memberMembership); err != nil {
		http.Error(w, "Failed to create member membership", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(memberMembership)
}

// UpdateMemberMembership updates an existing member-membership relationship
func (h *MemberMembershipHandler) UpdateMemberMembership(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		http.Error(w, "Invalid member membership ID", http.StatusBadRequest)
		return
	}

	var mmReq MemberMembership
	if err := json.NewDecoder(r.Body).Decode(&mmReq); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Convert to model
	memberMembership := &model.MemberMembership{
		ID:             id,
		MemberID:       mmReq.MemberID,
		MembershipID:   mmReq.MembershipID,
		StartDate:      mmReq.StartDate,
		EndDate:        mmReq.EndDate,
		PaymentStatus:  mmReq.PaymentStatus,
		ContractSigned: mmReq.ContractSigned,
	}

	if err := h.service.Update(r.Context(), memberMembership); err != nil {
		http.Error(w, "Failed to update member membership", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(memberMembership)
}

// DeleteMemberMembership deletes a member-membership relationship
func (h *MemberMembershipHandler) DeleteMemberMembership(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		http.Error(w, "Invalid member membership ID", http.StatusBadRequest)
		return
	}

	if err := h.service.Delete(r.Context(), id); err != nil {
		http.Error(w, "Failed to delete member membership", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// GetActiveMemberMembership retrieves the active membership for a member
func (h *MemberMembershipHandler) GetActiveMemberMembership(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	memberID, err := strconv.ParseInt(vars["memberID"], 10, 64)
	if err != nil {
		http.Error(w, "Invalid member ID", http.StatusBadRequest)
		return
	}

	// First check if the member exists and is active using the injected service
	member, err := h.memberService.GetByID(r.Context(), memberID)
	if err != nil {
		http.Error(w, fmt.Sprintf("Member ID %d not found", memberID), http.StatusNotFound)
		return
	}

	if member.Status != model.StatusActive {
		http.Error(w, fmt.Sprintf("Member ID %d is not active (current status: %s)",
			memberID, member.Status), http.StatusBadRequest)
		return
	}

	// Then check if member has any memberships at all
	memberships, err := h.service.ListByMemberID(r.Context(), memberID)
	if err != nil || len(memberships) == 0 {
		http.Error(w, fmt.Sprintf("Member ID %d has no memberships assigned", memberID), http.StatusNotFound)
		return
	}

	memberMembership, err := h.service.GetActiveMembership(r.Context(), memberID)
	if err != nil {
		// Check if there are expired memberships
		hasExpired := false
		for _, m := range memberships {
			if m.EndDate.Before(time.Now()) {
				hasExpired = true
				break
			}
		}

		if hasExpired {
			http.Error(w, fmt.Sprintf("Member ID %d has memberships, but they have all expired", memberID), http.StatusNotFound)
		} else {
			http.Error(w, fmt.Sprintf("No active membership found for member ID %d", memberID), http.StatusNotFound)
		}
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(memberMembership)
}
