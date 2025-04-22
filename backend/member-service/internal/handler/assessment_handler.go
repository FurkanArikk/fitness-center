package handler

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/FurkanArikk/fitness-center/backend/member-service/internal/model"
	"github.com/FurkanArikk/fitness-center/backend/member-service/internal/service"
	"github.com/gorilla/mux"
)

// AssessmentHandler handles HTTP requests for fitness assessments
type AssessmentHandler struct {
	service service.FitnessAssessmentService
}

// NewAssessmentHandler creates a new AssessmentHandler
func NewAssessmentHandler(service service.FitnessAssessmentService) *AssessmentHandler {
	return &AssessmentHandler{
		service: service,
	}
}

// GetAssessment retrieves a specific assessment by ID
func (h *AssessmentHandler) GetAssessment(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		http.Error(w, "Invalid assessment ID", http.StatusBadRequest)
		return
	}

	assessment, err := h.service.GetByID(r.Context(), id)
	if err != nil {
		http.Error(w, "Assessment not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(assessment)
}

// GetMemberAssessments retrieves all assessments for a specific member
func (h *AssessmentHandler) GetMemberAssessments(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	memberID, err := strconv.ParseInt(vars["memberID"], 10, 64)
	if err != nil {
		http.Error(w, "Invalid member ID", http.StatusBadRequest)
		return
	}

	assessments, err := h.service.ListByMemberID(r.Context(), memberID)
	if err != nil {
		http.Error(w, "Failed to retrieve assessments", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(assessments)
}

// CreateAssessment creates a new fitness assessment
func (h *AssessmentHandler) CreateAssessment(w http.ResponseWriter, r *http.Request) {
	var assessmentReq Assessment
	if err := json.NewDecoder(r.Body).Decode(&assessmentReq); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Convert to model
	assessment := &model.FitnessAssessment{
		MemberID:           assessmentReq.MemberID,
		TrainerID:          assessmentReq.TrainerID,
		AssessmentDate:     assessmentReq.AssessmentDate,
		Height:             assessmentReq.Height,
		Weight:             assessmentReq.Weight,
		BodyFatPercentage:  assessmentReq.BodyFatPercentage,
		BMI:                assessmentReq.BMI,
		Notes:              assessmentReq.Notes,
		GoalsSet:           assessmentReq.GoalsSet,
		NextAssessmentDate: assessmentReq.NextAssessmentDate,
	}

	if err := h.service.Create(r.Context(), assessment); err != nil {
		http.Error(w, "Failed to create assessment", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(assessment)
}

// UpdateAssessment updates an existing assessment
func (h *AssessmentHandler) UpdateAssessment(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		http.Error(w, "Invalid assessment ID", http.StatusBadRequest)
		return
	}

	var assessmentReq Assessment
	if err := json.NewDecoder(r.Body).Decode(&assessmentReq); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Convert to model
	assessment := &model.FitnessAssessment{
		ID:                 id,
		MemberID:           assessmentReq.MemberID,
		TrainerID:          assessmentReq.TrainerID,
		AssessmentDate:     assessmentReq.AssessmentDate,
		Height:             assessmentReq.Height,
		Weight:             assessmentReq.Weight,
		BodyFatPercentage:  assessmentReq.BodyFatPercentage,
		BMI:                assessmentReq.BMI,
		Notes:              assessmentReq.Notes,
		GoalsSet:           assessmentReq.GoalsSet,
		NextAssessmentDate: assessmentReq.NextAssessmentDate,
	}

	if err := h.service.Update(r.Context(), assessment); err != nil {
		http.Error(w, "Failed to update assessment", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(assessment)
}

// DeleteAssessment deletes an assessment
func (h *AssessmentHandler) DeleteAssessment(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		http.Error(w, "Invalid assessment ID", http.StatusBadRequest)
		return
	}

	if err := h.service.Delete(r.Context(), id); err != nil {
		http.Error(w, "Failed to delete assessment", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
