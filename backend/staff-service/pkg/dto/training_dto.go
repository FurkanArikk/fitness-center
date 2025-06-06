package dto

import (
	"time"

	"github.com/FurkanArikk/fitness-center/backend/staff-service/internal/model"
)

// TrainingResponse represents a personal training session response to the client
type TrainingResponse struct {
	ID          int64            `json:"id"`
	MemberID    int64            `json:"member_id"`
	TrainerID   int64            `json:"trainer_id"`
	SessionDate string           `json:"session_date"`
	StartTime   string           `json:"start_time"`
	EndTime     string           `json:"end_time"`
	Notes       string           `json:"notes"`
	Status      string           `json:"status"`
	Price       float64          `json:"price"`
	CreatedAt   time.Time        `json:"created_at"`
	UpdatedAt   time.Time        `json:"updated_at"`
	Trainer     *TrainerResponse `json:"trainer,omitempty"`
}

// TrainingRequest represents a personal training session request from the client
type TrainingRequest struct {
	MemberID    int64   `json:"member_id" validate:"required"`
	TrainerID   int64   `json:"trainer_id" validate:"required"`
	SessionDate string  `json:"session_date" validate:"required,datetime=2006-01-02"`
	StartTime   string  `json:"start_time" validate:"required"`
	EndTime     string  `json:"end_time" validate:"required"`
	Notes       string  `json:"notes"`
	Status      string  `json:"status" validate:"required,oneof=Scheduled Completed Cancelled"`
	Price       float64 `json:"price" validate:"required,gte=0"`
}

// ToModel converts a TrainingRequest to a PersonalTraining model
func (r *TrainingRequest) ToModel() (*model.PersonalTraining, error) {
	sessionDate, err := time.Parse("2006-01-02", r.SessionDate)
	if err != nil {
		return nil, err
	}

	return &model.PersonalTraining{
		MemberID:    r.MemberID,
		TrainerID:   r.TrainerID,
		SessionDate: sessionDate,
		StartTime:   r.StartTime,
		EndTime:     r.EndTime,
		Notes:       r.Notes,
		Status:      r.Status,
		Price:       r.Price,
	}, nil
}

// FromModel creates a TrainingResponse from a PersonalTraining model
func TrainingFromModel(t *model.PersonalTraining) *TrainingResponse {
	response := &TrainingResponse{
		ID:          t.SessionID,
		MemberID:    t.MemberID,
		TrainerID:   t.TrainerID,
		SessionDate: t.SessionDate.Format("2006-01-02"),
		StartTime:   t.StartTime, // HH:MM:SS
		EndTime:     t.EndTime,   // HH:MM:SS
		Notes:       t.Notes,
		Status:      t.Status,
		Price:       t.Price,
		CreatedAt:   t.CreatedAt,
		UpdatedAt:   t.UpdatedAt,
	}

	// Include trainer details if available
	if t.Trainer != nil {
		response.Trainer = TrainerFromModel(t.Trainer)
	}

	return response
}

// TrainingListFromModel creates TrainingResponses from PersonalTraining models
func TrainingListFromModel(trainings []model.PersonalTraining) []TrainingResponse {
	result := make([]TrainingResponse, len(trainings))
	for i, t := range trainings {
		result[i] = *TrainingFromModel(&t)
	}
	return result
}
