package model

import (
	"context"
	"time"
)

// Facility represents a fitness facility or area
type Facility struct {
	FacilityID  int       `json:"facility_id" gorm:"column:facility_id;primaryKey;autoIncrement"`
	Name        string    `json:"name" gorm:"column:name;type:varchar(100);not null"`
	Description string    `json:"description" gorm:"column:description;type:varchar(255)"`
	Capacity    int       `json:"capacity" gorm:"column:capacity;not null"`
	Status      string    `json:"status" gorm:"column:status;type:varchar(20);default:'active'"`
	OpeningHour string    `json:"opening_hour" gorm:"column:opening_hour;type:time;not null"`
	ClosingHour string    `json:"closing_hour" gorm:"column:closing_hour;type:time;not null"`
	IsDeleted   bool      `json:"is_deleted" gorm:"column:is_deleted;default:false"`
	CreatedAt   time.Time `json:"created_at" gorm:"column:created_at;autoCreateTime"`
	UpdatedAt   time.Time `json:"updated_at" gorm:"column:updated_at;autoUpdateTime"`
}

// TableName specifies the table name for GORM
func (Facility) TableName() string {
	return "facilities"
}

// FacilityRepository defines the operations for facility data access
type FacilityRepository interface {
	GetAll(ctx context.Context) ([]Facility, error)
	GetAllPaginated(ctx context.Context, offset, limit int) ([]Facility, int, error)
	GetByID(ctx context.Context, id int) (*Facility, error)
	Create(ctx context.Context, facility *Facility) (*Facility, error)
	Update(ctx context.Context, id int, facility *Facility) (*Facility, error)
	Delete(ctx context.Context, id int) error
	GetByStatus(ctx context.Context, status string) ([]Facility, error)
}
