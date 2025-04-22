package handler

import (
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"github.com/gorilla/mux"

	"github.com/fitness-center/staff-service/internal/model"
)

// TrainingHandler handles HTTP requests related to personal training sessions
type TrainingHandler struct {
	trainingService model.PersonalTrainingService
}

// NewTrainingHandler creates a new instance of TrainingHandler
func NewTrainingHandler(trainingService model.PersonalTrainingService) *TrainingHandler {
	return &TrainingHandler{
		trainingService: trainingService,
	}
}

// GetAll handles GET /trainings requests
func (h *TrainingHandler) GetAll(w http.ResponseWriter, r *http.Request) {
	trainings, err := h.trainingService.GetAll()
	if err != nil {
		http.Error(w, "Failed to get training sessions", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(trainings)
}

// GetByID handles GET /trainings/{id} requests
func (h *TrainingHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		http.Error(w, "Invalid training session ID", http.StatusBadRequest)
		return
	}

	training, err := h.trainingService.GetByID(id)
	if err != nil {
		http.Error(w, "Training session not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(training)
}

// GetByMemberID handles GET /members/{id}/trainings requests
func (h *TrainingHandler) GetByMemberID(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	memberID, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		http.Error(w, "Invalid member ID", http.StatusBadRequest)
		return
	}

	trainings, err := h.trainingService.GetByMemberID(memberID)
	if err != nil {
		http.Error(w, "Failed to get training sessions", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(trainings)
}

// GetByTrainerID handles GET /trainers/{id}/trainings requests
func (h *TrainingHandler) GetByTrainerID(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	trainerID, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		http.Error(w, "Invalid trainer ID", http.StatusBadRequest)
		return
	}

	trainings, err := h.trainingService.GetByTrainerID(trainerID)
	if err != nil {
		http.Error(w, "Failed to get training sessions", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(trainings)
}

// Create handles POST /trainings requests
func (h *TrainingHandler) Create(w http.ResponseWriter, r *http.Request) {
	var training model.PersonalTraining
	if err := json.NewDecoder(r.Body).Decode(&training); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	createdTraining, err := h.trainingService.Create(&training)
	if err != nil {
		http.Error(w, "Failed to create training session", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(createdTraining)
}

// Update handles PUT /trainings/{id} requests
func (h *TrainingHandler) Update(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		http.Error(w, "Invalid training session ID", http.StatusBadRequest)
		return
	}

	var training model.PersonalTraining
	if err := json.NewDecoder(r.Body).Decode(&training); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	training.SessionID = id

	updatedTraining, err := h.trainingService.Update(&training)
	if err != nil {
		http.Error(w, "Failed to update training session", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(updatedTraining)
}

// Delete handles DELETE /trainings/{id} requests
func (h *TrainingHandler) Delete(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		http.Error(w, "Invalid training session ID", http.StatusBadRequest)
		return
	}

	if err := h.trainingService.Delete(id); err != nil {
		http.Error(w, "Failed to delete training session", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// GetByDateRange handles GET /trainings/date requests with query params
func (h *TrainingHandler) GetByDateRange(w http.ResponseWriter, r *http.Request) {
	startStr := r.URL.Query().Get("start")
	endStr := r.URL.Query().Get("end")

	var startDate, endDate time.Time
	var err error

	if startStr != "" {
		startDate, err = time.Parse("2006-01-02", startStr)
		if err != nil {
			http.Error(w, "Invalid start date format (use YYYY-MM-DD)", http.StatusBadRequest)
			return
		}
	} else {
		startDate = time.Now()
	}

	if endStr != "" {
		endDate, err = time.Parse("2006-01-02", endStr)
		if err != nil {
			http.Error(w, "Invalid end date format (use YYYY-MM-DD)", http.StatusBadRequest)
			return
		}
	} else {
		endDate = startDate.AddDate(0, 0, 7) // Default to 7 days from start
	}

	trainings, err := h.trainingService.GetByDateRange(startDate, endDate)
	if err != nil {
		http.Error(w, "Failed to get training sessions", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(trainings)
}

// ScheduleSession handles POST /trainings/schedule requests
func (h *TrainingHandler) ScheduleSession(w http.ResponseWriter, r *http.Request) {
	var training model.PersonalTraining
	if err := json.NewDecoder(r.Body).Decode(&training); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Set status to Scheduled
	training.Status = "Scheduled"

	scheduledTraining, err := h.trainingService.ScheduleSession(&training)
	if err != nil {
		http.Error(w, "Failed to schedule training session", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(scheduledTraining)
}

// CancelSession handles PUT /trainings/{id}/cancel requests
func (h *TrainingHandler) CancelSession(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		http.Error(w, "Invalid training session ID", http.StatusBadRequest)
		return
	}

	if err := h.trainingService.CancelSession(id); err != nil {
		http.Error(w, "Failed to cancel training session", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// CompleteSession handles PUT /trainings/{id}/complete requests
func (h *TrainingHandler) CompleteSession(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		http.Error(w, "Invalid training session ID", http.StatusBadRequest)
		return
	}

	if err := h.trainingService.CompleteSession(id); err != nil {
		http.Error(w, "Failed to complete training session", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// RegisterRoutes registers the routes for the training handler
func (h *TrainingHandler) RegisterRoutes(router *mux.Router) {
	router.HandleFunc("/trainings", h.GetAll).Methods("GET")
	router.HandleFunc("/trainings/{id}", h.GetByID).Methods("GET")
	router.HandleFunc("/members/{id}/trainings", h.GetByMemberID).Methods("GET")
	router.HandleFunc("/trainers/{id}/trainings", h.GetByTrainerID).Methods("GET")
	router.HandleFunc("/trainings", h.Create).Methods("POST")
	router.HandleFunc("/trainings/{id}", h.Update).Methods("PUT")
	router.HandleFunc("/trainings/{id}", h.Delete).Methods("DELETE")
	router.HandleFunc("/trainings/date", h.GetByDateRange).Methods("GET")
	router.HandleFunc("/trainings/schedule", h.ScheduleSession).Methods("POST")
	router.HandleFunc("/trainings/{id}/cancel", h.CancelSession).Methods("PUT")
	router.HandleFunc("/trainings/{id}/complete", h.CompleteSession).Methods("PUT")
}
