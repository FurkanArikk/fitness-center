package handler

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"

	"github.com/fitness-center/staff-service/internal/model"
)

// TrainerHandler handles HTTP requests related to trainers
type TrainerHandler struct {
	trainerService model.TrainerService
}

// NewTrainerHandler creates a new instance of TrainerHandler
func NewTrainerHandler(trainerService model.TrainerService) *TrainerHandler {
	return &TrainerHandler{
		trainerService: trainerService,
	}
}

// GetAll handles GET /trainers requests
func (h *TrainerHandler) GetAll(w http.ResponseWriter, r *http.Request) {
	trainers, err := h.trainerService.GetAll()
	if err != nil {
		http.Error(w, "Failed to get trainers", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(trainers)
}

// GetByID handles GET /trainers/{id} requests
func (h *TrainerHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		http.Error(w, "Invalid trainer ID", http.StatusBadRequest)
		return
	}

	trainer, err := h.trainerService.GetByID(id)
	if err != nil {
		http.Error(w, "Trainer not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(trainer)
}

// GetByStaffID handles GET /staff/{id}/trainer requests
func (h *TrainerHandler) GetByStaffID(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	staffID, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		http.Error(w, "Invalid staff ID", http.StatusBadRequest)
		return
	}

	trainer, err := h.trainerService.GetByStaffID(staffID)
	if err != nil {
		http.Error(w, "Trainer not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(trainer)
}

// Create handles POST /trainers requests
func (h *TrainerHandler) Create(w http.ResponseWriter, r *http.Request) {
	var trainer model.Trainer
	if err := json.NewDecoder(r.Body).Decode(&trainer); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	createdTrainer, err := h.trainerService.Create(&trainer)
	if err != nil {
		http.Error(w, "Failed to create trainer", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(createdTrainer)
}

// Update handles PUT /trainers/{id} requests
func (h *TrainerHandler) Update(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		http.Error(w, "Invalid trainer ID", http.StatusBadRequest)
		return
	}

	var trainer model.Trainer
	if err := json.NewDecoder(r.Body).Decode(&trainer); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	trainer.TrainerID = id

	updatedTrainer, err := h.trainerService.Update(&trainer)
	if err != nil {
		http.Error(w, "Failed to update trainer", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(updatedTrainer)
}

// Delete handles DELETE /trainers/{id} requests
func (h *TrainerHandler) Delete(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		http.Error(w, "Invalid trainer ID", http.StatusBadRequest)
		return
	}

	if err := h.trainerService.Delete(id); err != nil {
		http.Error(w, "Failed to delete trainer", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// GetBySpecialization handles GET /trainers/specialization/{spec} requests
func (h *TrainerHandler) GetBySpecialization(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	specialization := vars["spec"]

	trainers, err := h.trainerService.GetBySpecialization(specialization)
	if err != nil {
		http.Error(w, "Failed to get trainers", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(trainers)
}

// GetTopRated handles GET /trainers/top/{limit} requests
func (h *TrainerHandler) GetTopRated(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	limit, err := strconv.Atoi(vars["limit"])
	if err != nil {
		limit = 5 // Default limit
	}

	trainers, err := h.trainerService.GetTopRated(limit)
	if err != nil {
		http.Error(w, "Failed to get top rated trainers", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(trainers)
}

// RegisterRoutes registers the routes for the trainer handler
func (h *TrainerHandler) RegisterRoutes(router *mux.Router) {
	router.HandleFunc("/trainers", h.GetAll).Methods("GET")
	router.HandleFunc("/trainers/{id}", h.GetByID).Methods("GET")
	router.HandleFunc("/staff/{id}/trainer", h.GetByStaffID).Methods("GET")
	router.HandleFunc("/trainers", h.Create).Methods("POST")
	router.HandleFunc("/trainers/{id}", h.Update).Methods("PUT")
	router.HandleFunc("/trainers/{id}", h.Delete).Methods("DELETE")
	router.HandleFunc("/trainers/specialization/{spec}", h.GetBySpecialization).Methods("GET")
	router.HandleFunc("/trainers/top/{limit}", h.GetTopRated).Methods("GET")
}
