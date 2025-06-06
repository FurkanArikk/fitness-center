package dto

import (
	"time"

	"github.com/FurkanArikk/fitness-center/backend/facility-service/internal/model"
)

// EquipmentResponse represents the response for equipment data
type EquipmentResponse struct {
	EquipmentID         int       `json:"equipment_id"`
	Name                string    `json:"name"`
	Description         string    `json:"description"`
	Category            string    `json:"category"`
	PurchaseDate        DateOnly  `json:"purchase_date"`
	PurchasePrice       float64   `json:"purchase_price"`
	Manufacturer        string    `json:"manufacturer"`
	ModelNumber         string    `json:"model_number"`
	Status              string    `json:"status"`
	LastMaintenanceDate DateOnly  `json:"last_maintenance_date"`
	NextMaintenanceDate DateOnly  `json:"next_maintenance_date"`
	CreatedAt           time.Time `json:"created_at"`
	UpdatedAt           time.Time `json:"updated_at"`
}

// EquipmentCreateRequest represents the request for creating equipment
type EquipmentCreateRequest struct {
	Name                string   `json:"name" binding:"required"`
	Description         string   `json:"description"`
	Category            string   `json:"category" binding:"required"`
	PurchaseDate        DateOnly `json:"purchase_date"`
	PurchasePrice       float64  `json:"purchase_price"`
	Manufacturer        string   `json:"manufacturer"`
	ModelNumber         string   `json:"model_number"`
	Status              string   `json:"status" binding:"required"`
	LastMaintenanceDate DateOnly `json:"last_maintenance_date"`
	NextMaintenanceDate DateOnly `json:"next_maintenance_date"`
}

// EquipmentUpdateRequest represents the request for updating equipment
type EquipmentUpdateRequest struct {
	Name                string   `json:"name" binding:"required"`
	Description         string   `json:"description"`
	Category            string   `json:"category" binding:"required"`
	PurchaseDate        DateOnly `json:"purchase_date"`
	PurchasePrice       float64  `json:"purchase_price"`
	Manufacturer        string   `json:"manufacturer"`
	ModelNumber         string   `json:"model_number"`
	Status              string   `json:"status" binding:"required"`
	LastMaintenanceDate DateOnly `json:"last_maintenance_date"`
	NextMaintenanceDate DateOnly `json:"next_maintenance_date"`
}

// ToModel converts EquipmentCreateRequest to model.Equipment
func (r *EquipmentCreateRequest) ToModel() model.Equipment {
	return model.Equipment{
		Name:                r.Name,
		Description:         r.Description,
		Category:            r.Category,
		PurchaseDate:        time.Time(r.PurchaseDate),
		PurchasePrice:       r.PurchasePrice,
		Manufacturer:        r.Manufacturer,
		ModelNumber:         r.ModelNumber,
		Status:              r.Status,
		LastMaintenanceDate: time.Time(r.LastMaintenanceDate),
		NextMaintenanceDate: time.Time(r.NextMaintenanceDate),
	}
}

// ToModel converts EquipmentUpdateRequest to model.Equipment
func (r *EquipmentUpdateRequest) ToModel() model.Equipment {
	return model.Equipment{
		Name:                r.Name,
		Description:         r.Description,
		Category:            r.Category,
		PurchaseDate:        time.Time(r.PurchaseDate),
		PurchasePrice:       r.PurchasePrice,
		Manufacturer:        r.Manufacturer,
		ModelNumber:         r.ModelNumber,
		Status:              r.Status,
		LastMaintenanceDate: time.Time(r.LastMaintenanceDate),
		NextMaintenanceDate: time.Time(r.NextMaintenanceDate),
	}
}

// FromModel converts model.Equipment to EquipmentResponse
func EquipmentResponseFromModel(model model.Equipment) EquipmentResponse {
	return EquipmentResponse{
		EquipmentID:         model.EquipmentID,
		Name:                model.Name,
		Description:         model.Description,
		Category:            model.Category,
		PurchaseDate:        DateOnly(model.PurchaseDate),
		PurchasePrice:       model.PurchasePrice,
		Manufacturer:        model.Manufacturer,
		ModelNumber:         model.ModelNumber,
		Status:              model.Status,
		LastMaintenanceDate: DateOnly(model.LastMaintenanceDate),
		NextMaintenanceDate: DateOnly(model.NextMaintenanceDate),
		CreatedAt:           model.CreatedAt,
		UpdatedAt:           model.UpdatedAt,
	}
}

// FromModelList converts a list of model.Equipment to a list of EquipmentResponse
func EquipmentResponseListFromModel(models []*model.Equipment) []EquipmentResponse {
	responses := make([]EquipmentResponse, len(models))
	for i, model := range models {
		responses[i] = EquipmentResponseFromModel(*model)
	}
	return responses
}
