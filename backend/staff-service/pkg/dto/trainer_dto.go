package dto

import (
	"time"

	"github.com/fitness-center/staff-service/internal/model"
)

// TrainerResponse represents a trainer response to the client
type TrainerResponse struct {
	ID             int64          `json:"id"`
	StaffID        int64          `json:"staff_id"`
	Specialization string         `json:"specialization"`
	Certification  string         `json:"certification"`
	Experience     int            `json:"experience"`
	Rating         float64        `json:"rating"`
	CreatedAt      time.Time      `json:"created_at"`
	UpdatedAt      time.Time      `json:"updated_at"`
	Staff          *StaffResponse `json:"staff,omitempty"`
}

// TrainerRequest represents a trainer request from the client
type TrainerRequest struct {
	StaffID        int64   `json:"staff_id" validate:"required"`
	Specialization string  `json:"specialization" validate:"required"`
	Certification  string  `json:"certification" validate:"required"`
	Experience     int     `json:"experience" validate:"required,gte=0"`
	Rating         float64 `json:"rating" validate:"required,gte=0,lte=5"`
}

// ToModel converts a TrainerRequest to a Trainer model
func (r *TrainerRequest) ToModel() *model.Trainer {
	return &model.Trainer{
		StaffID:        r.StaffID,
		Specialization: r.Specialization,
		Certification:  r.Certification,
		Experience:     r.Experience,
		Rating:         r.Rating,
	}
}

// FromModel creates a TrainerResponse from a Trainer model
func TrainerFromModel(t *model.Trainer) *TrainerResponse {
	response := &TrainerResponse{
		ID:             t.TrainerID,
		StaffID:        t.StaffID,
		Specialization: t.Specialization,
		Certification:  t.Certification,
		Experience:     t.Experience,
		Rating:         t.Rating,
		CreatedAt:      t.CreatedAt,
		UpdatedAt:      t.UpdatedAt,
	}

	// Include staff details if available
	if t.Staff != nil {
		response.Staff = StaffFromModel(t.Staff)
	}

	return response
}

// TrainerListFromModel creates TrainerResponses from Trainer models
func TrainerListFromModel(trainers []model.Trainer) []TrainerResponse {
	result := make([]TrainerResponse, len(trainers))
	for i, t := range trainers {
		result[i] = *TrainerFromModel(&t)
	}
	return result
}
