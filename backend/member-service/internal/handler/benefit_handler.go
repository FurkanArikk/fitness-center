package handler

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/FurkanArikk/fitness-center/backend/member-service/internal/model"
	"github.com/FurkanArikk/fitness-center/backend/member-service/internal/service"
	"github.com/gorilla/mux"
)

// BenefitHandler handles HTTP requests for membership benefits
type BenefitHandler struct {
	service service.BenefitService
}

// NewBenefitHandler creates a new BenefitHandler
func NewBenefitHandler(service service.BenefitService) *BenefitHandler {
	return &BenefitHandler{
		service: service,
	}
}

// GetBenefit retrieves a specific benefit by ID
func (h *BenefitHandler) GetBenefit(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		http.Error(w, "Invalid benefit ID", http.StatusBadRequest)
		return
	}

	benefit, err := h.service.GetByID(r.Context(), id)
	if err != nil {
		http.Error(w, "Benefit not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(benefit)
}

// GetAllBenefits retrieves all benefits
func (h *BenefitHandler) GetAllBenefits(w http.ResponseWriter, r *http.Request) {
	benefits, err := h.service.ListAll(r.Context())
	if err != nil {
		http.Error(w, "Failed to retrieve benefits", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(benefits)
}

// GetMembershipBenefits retrieves all benefits for a specific membership
func (h *BenefitHandler) GetMembershipBenefits(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	membershipID, err := strconv.ParseInt(vars["membershipID"], 10, 64)
	if err != nil {
		http.Error(w, "Invalid membership ID", http.StatusBadRequest)
		return
	}

	benefits, err := h.service.List(r.Context(), membershipID)
	if err != nil {
		http.Error(w, "Failed to retrieve benefits", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(benefits)
}

// CreateBenefit creates a new membership benefit
func (h *BenefitHandler) CreateBenefit(w http.ResponseWriter, r *http.Request) {
	var benefitReq Benefit
	if err := json.NewDecoder(r.Body).Decode(&benefitReq); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Convert to model
	benefit := &model.MembershipBenefit{
		MembershipID:       benefitReq.MembershipID,
		BenefitName:        benefitReq.BenefitName,
		BenefitDescription: benefitReq.BenefitDescription,
	}

	if err := h.service.Create(r.Context(), benefit); err != nil {
		http.Error(w, "Failed to create benefit", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(benefit)
}

// UpdateBenefit updates an existing benefit
func (h *BenefitHandler) UpdateBenefit(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		http.Error(w, "Invalid benefit ID", http.StatusBadRequest)
		return
	}

	var benefitReq Benefit
	if err := json.NewDecoder(r.Body).Decode(&benefitReq); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Convert to model
	benefit := &model.MembershipBenefit{
		ID:                 id,
		MembershipID:       benefitReq.MembershipID,
		BenefitName:        benefitReq.BenefitName,
		BenefitDescription: benefitReq.BenefitDescription,
	}

	if err := h.service.Update(r.Context(), benefit); err != nil {
		http.Error(w, "Failed to update benefit", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(benefit)
}

// DeleteBenefit deletes a benefit
func (h *BenefitHandler) DeleteBenefit(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		http.Error(w, "Invalid benefit ID", http.StatusBadRequest)
		return
	}

	if err := h.service.Delete(r.Context(), id); err != nil {
		http.Error(w, "Failed to delete benefit", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
