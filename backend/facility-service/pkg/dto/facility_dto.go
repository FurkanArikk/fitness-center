package dto

import (
	"time"

	"github.com/furkan/fitness-center/backend/facility-service/internal/model"
)

// FacilityResponse represents the response for facility data
type FacilityResponse struct {
	FacilityID  int       `json:"facility_id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	Capacity    int       `json:"capacity"`
	Status      string    `json:"status"`
	OpeningHour time.Time `json:"opening_hour"`
	ClosingHour time.Time `json:"closing_hour"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// FacilityCreateRequest represents the request for creating a facility
type FacilityCreateRequest struct {
	Name        string    `json:"name" binding:"required"`
	Description string    `json:"description"`
	Capacity    int       `json:"capacity" binding:"required,min=1"`
	Status      string    `json:"status" binding:"required"`
	OpeningHour time.Time `json:"opening_hour" binding:"required"`
	ClosingHour time.Time `json:"closing_hour" binding:"required"`
}

// FacilityUpdateRequest represents the request for updating a facility
type FacilityUpdateRequest struct {
	Name        string    `json:"name" binding:"required"`
	Description string    `json:"description"`
	Capacity    int       `json:"capacity" binding:"required,min=1"`
	Status      string    `json:"status" binding:"required"`
	OpeningHour time.Time `json:"opening_hour" binding:"required"`
	ClosingHour time.Time `json:"closing_hour" binding:"required"`
}

// ToModel converts FacilityCreateRequest to model.Facility
func (r *FacilityCreateRequest) ToModel() model.Facility {
	return model.Facility{
		Name:        r.Name,
		Description: r.Description,
		Capacity:    r.Capacity,
		Status:      r.Status,
		OpeningHour: r.OpeningHour,
		ClosingHour: r.ClosingHour,
	}
}

// ToModel converts FacilityUpdateRequest to model.Facility
func (r *FacilityUpdateRequest) ToModel() model.Facility {
	return model.Facility{
		Name:        r.Name,
		Description: r.Description,
		Capacity:    r.Capacity,
		Status:      r.Status,
		OpeningHour: r.OpeningHour,
		ClosingHour: r.ClosingHour,
	}
}

// FromModel converts model.Facility to FacilityResponse
func FacilityResponseFromModel(model model.Facility) FacilityResponse {
	return FacilityResponse{
		FacilityID:  model.FacilityID,
		Name:        model.Name,
		Description: model.Description,
		Capacity:    model.Capacity,
		Status:      model.Status,
		OpeningHour: model.OpeningHour,
		ClosingHour: model.ClosingHour,
		CreatedAt:   model.CreatedAt,
		UpdatedAt:   model.UpdatedAt,
	}
}

// FromModelList converts a list of model.Facility to a list of FacilityResponse
func FacilityResponseListFromModel(models []*model.Facility) []FacilityResponse {
	responses := make([]FacilityResponse, len(models))
	for i, model := range models {
		responses[i] = FacilityResponseFromModel(*model)
	}
	return responses
}
