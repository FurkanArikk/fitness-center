package handler

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"

	"github.com/fitness-center/staff-service/internal/model"
)

// QualificationHandler handles HTTP requests related to staff qualifications
type QualificationHandler struct {
	qualificationService model.QualificationService
}

// NewQualificationHandler creates a new instance of QualificationHandler
func NewQualificationHandler(qualificationService model.QualificationService) *QualificationHandler {
	return &QualificationHandler{
		qualificationService: qualificationService,
	}
}

// GetAll handles GET /qualifications requests
func (h *QualificationHandler) GetAll(w http.ResponseWriter, r *http.Request) {
	qualifications, err := h.qualificationService.GetAll()
	if err != nil {
		http.Error(w, "Failed to get qualifications", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(qualifications)
}

// GetByID handles GET /qualifications/{id} requests
func (h *QualificationHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		http.Error(w, "Invalid qualification ID", http.StatusBadRequest)
		return
	}

	qualification, err := h.qualificationService.GetByID(id)
	if err != nil {
		http.Error(w, "Qualification not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(qualification)
}

// GetByStaffID handles GET /staff/{id}/qualifications requests
func (h *QualificationHandler) GetByStaffID(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	staffID, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		http.Error(w, "Invalid staff ID", http.StatusBadRequest)
		return
	}

	qualifications, err := h.qualificationService.GetByStaffID(staffID)
	if err != nil {
		http.Error(w, "Failed to get qualifications", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(qualifications)
}

// Create handles POST /qualifications requests
func (h *QualificationHandler) Create(w http.ResponseWriter, r *http.Request) {
	var qualification model.Qualification
	if err := json.NewDecoder(r.Body).Decode(&qualification); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	createdQualification, err := h.qualificationService.Create(&qualification)
	if err != nil {
		http.Error(w, "Failed to create qualification", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(createdQualification)
}

// Update handles PUT /qualifications/{id} requests
func (h *QualificationHandler) Update(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		http.Error(w, "Invalid qualification ID", http.StatusBadRequest)
		return
	}

	var qualification model.Qualification
	if err := json.NewDecoder(r.Body).Decode(&qualification); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	qualification.QualificationID = id

	updatedQualification, err := h.qualificationService.Update(&qualification)
	if err != nil {
		http.Error(w, "Failed to update qualification", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(updatedQualification)
}

// Delete handles DELETE /qualifications/{id} requests
func (h *QualificationHandler) Delete(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		http.Error(w, "Invalid qualification ID", http.StatusBadRequest)
		return
	}

	if err := h.qualificationService.Delete(id); err != nil {
		http.Error(w, "Failed to delete qualification", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// RegisterRoutes registers the routes for the qualification handler
func (h *QualificationHandler) RegisterRoutes(router *mux.Router) {
	router.HandleFunc("/qualifications", h.GetAll).Methods("GET")
	router.HandleFunc("/qualifications/{id}", h.GetByID).Methods("GET")
	router.HandleFunc("/staff/{id}/qualifications", h.GetByStaffID).Methods("GET")
	router.HandleFunc("/qualifications", h.Create).Methods("POST")
	router.HandleFunc("/qualifications/{id}", h.Update).Methods("PUT")
	router.HandleFunc("/qualifications/{id}", h.Delete).Methods("DELETE")
}
