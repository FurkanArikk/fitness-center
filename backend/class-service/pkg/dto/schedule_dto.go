package dto

import (
	"time"

	"github.com/FurkanArikk/fitness-center/backend/class-service/internal/model"
)

// ScheduleResponse represents the response for schedule data
type ScheduleResponse struct {
	ScheduleID    int       `json:"schedule_id"`
	ClassID       int       `json:"class_id"`
	TrainerID     int       `json:"trainer_id"`
	RoomID        int       `json:"room_id"`
	StartTime     string    `json:"start_time"`
	EndTime       string    `json:"end_time"`
	DayOfWeek     string    `json:"day_of_week"`
	Status        string    `json:"status"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
	ClassName     string    `json:"class_name,omitempty"`
	ClassDuration int       `json:"class_duration,omitempty"`
}

// ScheduleCreateRequest represents the request for creating a schedule
type ScheduleCreateRequest struct {
	ClassID   int    `json:"class_id" binding:"required"`
	TrainerID int    `json:"trainer_id" binding:"required"`
	RoomID    int    `json:"room_id" binding:"required"`
	StartTime string `json:"start_time" binding:"required"`
	EndTime   string `json:"end_time" binding:"required"`
	DayOfWeek string `json:"day_of_week" binding:"required,oneof=Monday Tuesday Wednesday Thursday Friday Saturday Sunday"`
	Status    string `json:"status"`
}

// ScheduleUpdateRequest represents the request for updating a schedule
type ScheduleUpdateRequest struct {
	ClassID   int    `json:"class_id" binding:"required"`
	TrainerID int    `json:"trainer_id" binding:"required"`
	RoomID    int    `json:"room_id" binding:"required"`
	StartTime string `json:"start_time" binding:"required"`
	EndTime   string `json:"end_time" binding:"required"`
	DayOfWeek string `json:"day_of_week" binding:"required,oneof=Monday Tuesday Wednesday Thursday Friday Saturday Sunday"`
	Status    string `json:"status"`
}

// ToModel converts ScheduleCreateRequest to model.ScheduleRequest
func (r *ScheduleCreateRequest) ToModel() model.ScheduleRequest {
	return model.ScheduleRequest{
		ClassID:   r.ClassID,
		TrainerID: r.TrainerID,
		RoomID:    r.RoomID,
		StartTime: r.StartTime,
		EndTime:   r.EndTime,
		DayOfWeek: r.DayOfWeek,
		Status:    r.Status,
	}
}

// ToModel converts ScheduleUpdateRequest to model.ScheduleRequest
func (r *ScheduleUpdateRequest) ToModel() model.ScheduleRequest {
	return model.ScheduleRequest{
		ClassID:   r.ClassID,
		TrainerID: r.TrainerID,
		RoomID:    r.RoomID,
		StartTime: r.StartTime,
		EndTime:   r.EndTime,
		DayOfWeek: r.DayOfWeek,
		Status:    r.Status,
	}
}

// FromModel converts model.Schedule to ScheduleResponse
func ScheduleResponseFromModel(model model.Schedule) ScheduleResponse {
	return ScheduleResponse{
		ScheduleID: model.ScheduleID,
		ClassID:    model.ClassID,
		TrainerID:  model.TrainerID,
		RoomID:     model.RoomID,
		StartTime:  model.StartTime,
		EndTime:    model.EndTime,
		DayOfWeek:  model.DayOfWeek,
		Status:     model.Status,
		CreatedAt:  model.CreatedAt,
		UpdatedAt:  model.UpdatedAt,
	}
}

// FromScheduleResponse converts model.ScheduleResponse to ScheduleResponse
func ScheduleResponseFromScheduleResponse(model model.ScheduleResponse) ScheduleResponse {
	return ScheduleResponse{
		ScheduleID:    model.ScheduleID,
		ClassID:       model.ClassID,
		TrainerID:     model.TrainerID,
		RoomID:        model.RoomID,
		StartTime:     model.StartTime,
		EndTime:       model.EndTime,
		DayOfWeek:     model.DayOfWeek,
		Status:        model.Status,
		CreatedAt:     model.CreatedAt,
		UpdatedAt:     model.UpdatedAt,
		ClassName:     model.ClassName,
		ClassDuration: model.ClassDuration,
	}
}

// FromModelList converts a list of model.ScheduleResponse to a list of ScheduleResponse
func ScheduleResponseListFromModel(models []model.ScheduleResponse) []ScheduleResponse {
	responses := make([]ScheduleResponse, len(models))
	for i, model := range models {
		responses[i] = ScheduleResponseFromScheduleResponse(model)
	}
	return responses
}
