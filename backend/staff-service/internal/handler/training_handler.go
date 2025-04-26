package handler

import (
	"net/http"
	"strconv"
	"time"

	"github.com/FurkanArikk/fitness-center/backend/staff-service/internal/model"
	"github.com/gin-gonic/gin"
)

// GetTrainingSessions returns all training sessions with optional filtering
func (h *TrainingHandler) GetTrainingSessions(c *gin.Context) {
	// Parse query parameters for filtering
	status := c.Query("status")
	dateStr := c.Query("date")
	trainerIDStr := c.Query("trainer_id") // Changed from trainerId to trainer_id to match endpoint docs
	memberIDStr := c.Query("member_id")   // Changed from memberId to member_id to match endpoint docs

	// Handle date parameter
	var date time.Time
	var err error
	if dateStr != "" {
		date, err = time.Parse("2006-01-02", dateStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date format. Use YYYY-MM-DD"})
			return
		}
	}

	// Handle trainer ID parameter
	var trainerID int64
	if trainerIDStr != "" {
		trainerID, err = strconv.ParseInt(trainerIDStr, 10, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid trainer ID"})
			return
		}
	}

	// Handle member ID parameter
	var memberID int64
	if memberIDStr != "" {
		memberID, err = strconv.ParseInt(memberIDStr, 10, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid member ID"})
			return
		}
	}

	// Get training sessions based on filters
	var trainingSessions []model.PersonalTraining
	var fetchErr error

	if status != "" {
		trainingSessions, fetchErr = h.service.GetByStatus(status)
	} else if !date.IsZero() {
		// Use appropriate service method for date filtering
		trainingSessions, fetchErr = h.service.GetByDateRange(date, date.AddDate(0, 0, 1))
	} else if trainerID > 0 {
		trainingSessions, fetchErr = h.service.GetByTrainerID(trainerID)
	} else if memberID > 0 {
		trainingSessions, fetchErr = h.service.GetByMemberID(memberID)
	} else {
		trainingSessions, fetchErr = h.service.GetAll()
	}

	if fetchErr != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fetchErr.Error()})
		return
	}

	// Return an empty array instead of null when no sessions are found
	if trainingSessions == nil {
		trainingSessions = []model.PersonalTraining{}
	}

	c.JSON(http.StatusOK, trainingSessions)
}

// GetTrainingSessionByID returns a specific training session
func (h *TrainingHandler) GetTrainingSessionByID(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid training session ID"})
		return
	}

	trainingSession, err := h.service.GetByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, trainingSession)
}

// CreateTrainingSession creates a new training session
func (h *TrainingHandler) CreateTrainingSession(c *gin.Context) {
	var trainingSession model.PersonalTraining
	if err := c.ShouldBindJSON(&trainingSession); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Use ScheduleSession for appropriate business logic
	result, err := h.service.ScheduleSession(&trainingSession)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, result)
}

// UpdateTrainingSession updates an existing training session
func (h *TrainingHandler) UpdateTrainingSession(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid training session ID"})
		return
	}

	// Get the existing training session first
	existingSession, err := h.service.GetByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Training session not found: " + err.Error()})
		return
	}

	// Bind the updated data from JSON request
	if err := c.ShouldBindJSON(existingSession); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Now update the session
	result, err := h.service.Update(existingSession)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, result)
}

// DeleteTrainingSession deletes a training session
func (h *TrainingHandler) DeleteTrainingSession(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid training session ID"})
		return
	}

	if err := h.service.Delete(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Training session deleted successfully"})
}

// CancelTrainingSession cancels a training session
func (h *TrainingHandler) CancelTrainingSession(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid training session ID"})
		return
	}

	if err := h.service.CancelSession(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Training session cancelled successfully"})
}

// CompleteTrainingSession marks a training session as completed
func (h *TrainingHandler) CompleteTrainingSession(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid training session ID"})
		return
	}

	if err := h.service.CompleteSession(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Training session marked as completed"})
}

// GetTrainingSessionsByDate returns all training sessions for a specific date
func (h *TrainingHandler) GetTrainingSessionsByDate(c *gin.Context) {
	dateStr := c.Query("date")
	if dateStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Date parameter is required"})
		return
	}

	date, err := time.Parse("2006-01-02", dateStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date format. Use YYYY-MM-DD"})
		return
	}

	// Use next day to get all sessions on the specified date
	nextDay := date.AddDate(0, 0, 1)
	trainingSessions, err := h.service.GetByDateRange(date, nextDay)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, trainingSessions)
}
