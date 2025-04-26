package model

import (
	"time"
)

// Equipment represents fitness equipment in the facility
type Equipment struct {
	EquipmentID         int       `json:"equipment_id" db:"equipment_id"`
	Name                string    `json:"name" db:"name"`
	Description         string    `json:"description" db:"description"`
	Category            string    `json:"category" db:"category"`
	PurchaseDate        time.Time `json:"purchase_date" db:"purchase_date"`
	PurchasePrice       float64   `json:"purchase_price" db:"purchase_price"`
	Manufacturer        string    `json:"manufacturer" db:"manufacturer"`
	ModelNumber         string    `json:"model_number" db:"model_number"`
	Status              string    `json:"status" db:"status"`
	LastMaintenanceDate time.Time `json:"last_maintenance_date" db:"last_maintenance_date"`
	NextMaintenanceDate time.Time `json:"next_maintenance_date" db:"next_maintenance_date"`
	CreatedAt           time.Time `json:"created_at" db:"created_at"`
	UpdatedAt           time.Time `json:"updated_at" db:"updated_at"`
}
