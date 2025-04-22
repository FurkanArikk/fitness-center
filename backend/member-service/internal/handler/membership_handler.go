package handler

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/FurkanArikk/fitness-center/backend/member-service/internal/model"
	"github.com/FurkanArikk/fitness-center/backend/member-service/internal/service"
	"github.com/gorilla/mux"
)

// MembershipHandler handles HTTP requests for membership operations
type MembershipHandler struct {
	service service.MembershipService
}

// NewMembershipHandler creates a new MembershipHandler
func NewMembershipHandler(service service.MembershipService) *MembershipHandler {
	return &MembershipHandler{
		service: service,
	}
}

// GetMembership retrieves a specific membership by ID
func (h *MembershipHandler) GetMembership(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		http.Error(w, "Invalid membership ID", http.StatusBadRequest)
		return
	}

	membership, err := h.service.GetByID(r.Context(), id)
	if err != nil {
		http.Error(w, "Membership not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(membership)
}

// GetAllMemberships retrieves all available memberships
func (h *MembershipHandler) GetAllMemberships(w http.ResponseWriter, r *http.Request) {
	activeOnly := r.URL.Query().Get("active") == "true"

	memberships, err := h.service.GetAll(r.Context(), activeOnly)
	if err != nil {
		http.Error(w, "Failed to retrieve memberships", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(memberships)
}

// CreateMembership creates a new membership plan
func (h *MembershipHandler) CreateMembership(w http.ResponseWriter, r *http.Request) {
	var membershipReq model.Membership
	if err := json.NewDecoder(r.Body).Decode(&membershipReq); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	membership := &model.Membership{
		MembershipName: membershipReq.MembershipName,
		Description:    membershipReq.Description,
		Duration:       membershipReq.Duration,
		Price:          membershipReq.Price,
		IsActive:       membershipReq.IsActive,
	}

	if err := h.service.Create(r.Context(), membership); err != nil {
		http.Error(w, "Failed to create membership", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(membership)
}

// UpdateMembership updates an existing membership plan
func (h *MembershipHandler) UpdateMembership(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		http.Error(w, "Invalid membership ID", http.StatusBadRequest)
		return
	}

	var membershipReq model.Membership
	if err := json.NewDecoder(r.Body).Decode(&membershipReq); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	membership := &model.Membership{
		ID:             id, // Changed from MembershipID to ID to match the model structure
		MembershipName: membershipReq.MembershipName,
		Description:    membershipReq.Description,
		Duration:       membershipReq.Duration,
		Price:          membershipReq.Price,
		IsActive:       membershipReq.IsActive,
	}

	if err := h.service.Update(r.Context(), membership); err != nil {
		http.Error(w, "Failed to update membership", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(membership)
}

// DeleteMembership deletes a membership plan
func (h *MembershipHandler) DeleteMembership(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		http.Error(w, "Invalid membership ID", http.StatusBadRequest)
		return
	}

	if err := h.service.Delete(r.Context(), id); err != nil {
		http.Error(w, "Failed to delete membership", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// ToggleMembershipStatus activates or deactivates a membership plan
func (h *MembershipHandler) ToggleMembershipStatus(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		http.Error(w, "Invalid membership ID", http.StatusBadRequest)
		return
	}

	var statusUpdate struct {
		IsActive bool `json:"is_active"`
	}

	if err := json.NewDecoder(r.Body).Decode(&statusUpdate); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if err := h.service.UpdateStatus(r.Context(), id, statusUpdate.IsActive); err != nil {
		http.Error(w, "Failed to update membership status", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
