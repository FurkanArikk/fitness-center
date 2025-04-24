package dto

import (
	"time"

	"github.com/FurkanArikk/fitness-center/backend/class-service/internal/model"
)

// ClassResponse represents the response for class data
type ClassResponse struct {
	ClassID     int       `json:"class_id"`
	ClassName   string    `json:"class_name"`
	Description string    `json:"description"`
	Duration    int       `json:"duration"`
	Capacity    int       `json:"capacity"`
	Difficulty  string    `json:"difficulty"`
	IsActive    bool      `json:"is_active"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// ClassCreateRequest represents the request for creating a class
type ClassCreateRequest struct {
	ClassName   string `json:"class_name" binding:"required"`
	Description string `json:"description"`
	Duration    int    `json:"duration" binding:"required,min=5"`
	Capacity    int    `json:"capacity" binding:"required,min=1"`
	Difficulty  string `json:"difficulty"`
	IsActive    bool   `json:"is_active"`
}

// ClassUpdateRequest represents the request for updating a class
type ClassUpdateRequest struct {
	ClassName   string `json:"class_name" binding:"required"`
	Description string `json:"description"`
	Duration    int    `json:"duration" binding:"required,min=5"`
	Capacity    int    `json:"capacity" binding:"required,min=1"`
	Difficulty  string `json:"difficulty"`
	IsActive    bool   `json:"is_active"`
}

// ToModel converts ClassCreateRequest to model.ClassRequest
func (r *ClassCreateRequest) ToModel() model.ClassRequest {
	return model.ClassRequest{
		ClassName:   r.ClassName,
		Description: r.Description,
		Duration:    r.Duration,
		Capacity:    r.Capacity,
		Difficulty:  r.Difficulty,
		IsActive:    r.IsActive,
	}
}

// ToModel converts ClassUpdateRequest to model.ClassRequest
func (r *ClassUpdateRequest) ToModel() model.ClassRequest {
	return model.ClassRequest{
		ClassName:   r.ClassName,
		Description: r.Description,
		Duration:    r.Duration,
		Capacity:    r.Capacity,
		Difficulty:  r.Difficulty,
		IsActive:    r.IsActive,
	}
}

// FromModel converts model.Class to ClassResponse
func ClassResponseFromModel(model model.Class) ClassResponse {
	return ClassResponse{
		ClassID:     model.ClassID,
		ClassName:   model.ClassName,
		Description: model.Description,
		Duration:    model.Duration,
		Capacity:    model.Capacity,
		Difficulty:  model.Difficulty,
		IsActive:    model.IsActive,
		CreatedAt:   model.CreatedAt,
		UpdatedAt:   model.UpdatedAt,
	}
}

// FromModelList converts a list of model.Class to a list of ClassResponse
func ClassResponseListFromModel(models []model.Class) []ClassResponse {
	responses := make([]ClassResponse, len(models))
	for i, model := range models {
		responses[i] = ClassResponseFromModel(model)
	}
	return responses
}
