package model

import (
	"context"
	"time"
)

// Equipment represents fitness equipment in the facility
type Equipment struct {
	EquipmentID         int       `json:"equipment_id" gorm:"column:equipment_id;primaryKey;autoIncrement"`
	Name                string    `json:"name" gorm:"column:name;type:varchar(100);not null"`
	Description         string    `json:"description" gorm:"column:description;type:varchar(255)"`
	Category            string    `json:"category" gorm:"column:category;type:varchar(50);not null"`
	PurchaseDate        time.Time `json:"purchase_date" gorm:"column:purchase_date;type:date;not null"`
	PurchasePrice       float64   `json:"purchase_price" gorm:"column:purchase_price;type:decimal(10,2);not null"`
	Manufacturer        string    `json:"manufacturer" gorm:"column:manufacturer;type:varchar(100)"`
	ModelNumber         string    `json:"model_number" gorm:"column:model_number;type:varchar(50)"`
	Status              string    `json:"status" gorm:"column:status;type:varchar(20);default:'active'"`
	LastMaintenanceDate time.Time `json:"last_maintenance_date" gorm:"column:last_maintenance_date;type:date"`
	NextMaintenanceDate time.Time `json:"next_maintenance_date" gorm:"column:next_maintenance_date;type:date"`
	CreatedAt           time.Time `json:"created_at" gorm:"column:created_at;autoCreateTime"`
	UpdatedAt           time.Time `json:"updated_at" gorm:"column:updated_at;autoUpdateTime"`
}

// TableName specifies the table name for GORM
func (Equipment) TableName() string {
	return "equipment"
}

// EquipmentRepository defines the operations for equipment data access
type EquipmentRepository interface {
	GetAll(ctx context.Context) ([]Equipment, error)
	GetAllPaginated(ctx context.Context, offset, limit int) ([]Equipment, int, error)
	GetByID(ctx context.Context, id int) (*Equipment, error)
	Create(ctx context.Context, equipment *Equipment) (*Equipment, error)
	Update(ctx context.Context, id int, equipment *Equipment) (*Equipment, error)
	Delete(ctx context.Context, id int) error
	GetByCategory(ctx context.Context, category string) ([]Equipment, error)
	GetByStatus(ctx context.Context, status string) ([]Equipment, error)
	GetMaintenanceDue(ctx context.Context) ([]Equipment, error)
}
