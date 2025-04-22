package handler

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"

	"github.com/fitness-center/staff-service/internal/model"
)

// StaffHandler handles HTTP requests related to staff
type StaffHandler struct {
	staffService model.StaffService
}

// NewStaffHandler creates a new instance of StaffHandler
func NewStaffHandler(staffService model.StaffService) *StaffHandler {
	return &StaffHandler{
		staffService: staffService,
	}
}

// GetAll handles GET /staff requests
func (h *StaffHandler) GetAll(w http.ResponseWriter, r *http.Request) {
	staff, err := h.staffService.GetAll()
	if err != nil {
		http.Error(w, "Failed to get staff records", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(staff)
}

// GetByID handles GET /staff/{id} requests
func (h *StaffHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		http.Error(w, "Invalid staff ID", http.StatusBadRequest)
		return
	}

	staff, err := h.staffService.GetByID(id)
	if err != nil {
		http.Error(w, "Staff not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(staff)
}

// Create handles POST /staff requests
func (h *StaffHandler) Create(w http.ResponseWriter, r *http.Request) {
	var staff model.Staff
	if err := json.NewDecoder(r.Body).Decode(&staff); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	createdStaff, err := h.staffService.Create(&staff)
	if err != nil {
		http.Error(w, "Failed to create staff", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(createdStaff)
}

// Update handles PUT /staff/{id} requests
func (h *StaffHandler) Update(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		http.Error(w, "Invalid staff ID", http.StatusBadRequest)
		return
	}

	var staff model.Staff
	if err := json.NewDecoder(r.Body).Decode(&staff); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	staff.StaffID = id

	updatedStaff, err := h.staffService.Update(&staff)
	if err != nil {
		http.Error(w, "Failed to update staff", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(updatedStaff)
}

// Delete handles DELETE /staff/{id} requests
func (h *StaffHandler) Delete(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		http.Error(w, "Invalid staff ID", http.StatusBadRequest)
		return
	}

	if err := h.staffService.Delete(id); err != nil {
		http.Error(w, "Failed to delete staff", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// RegisterRoutes registers the routes for the staff handler
func (h *StaffHandler) RegisterRoutes(router *mux.Router) {
	router.HandleFunc("/staff", h.GetAll).Methods("GET")
	router.HandleFunc("/staff/{id}", h.GetByID).Methods("GET")
	router.HandleFunc("/staff", h.Create).Methods("POST")
	router.HandleFunc("/staff/{id}", h.Update).Methods("PUT")
	router.HandleFunc("/staff/{id}", h.Delete).Methods("DELETE")
}
