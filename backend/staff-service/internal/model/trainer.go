package model

import (
	"context"
	"time"
)

// Trainer represents a trainer who provides fitness training sessions
type Trainer struct {
	TrainerID      int64     `json:"trainer_id" gorm:"column:trainer_id;primaryKey;autoIncrement"`
	StaffID        int64     `json:"staff_id" gorm:"column:staff_id;not null"`
	Specialization string    `json:"specialization" gorm:"column:specialization;type:varchar(100)"`
	Certification  string    `json:"certification" gorm:"column:certification;type:varchar(255)"`
	Experience     int       `json:"experience" gorm:"column:experience;default:0"` // in years
	Rating         float64   `json:"rating" gorm:"column:rating;type:decimal(3,2);default:0.0"`
	IsActive       bool      `json:"is_active" gorm:"column:is_active;default:true"`
	CreatedAt      time.Time `json:"created_at" gorm:"column:created_at;autoCreateTime"`
	UpdatedAt      time.Time `json:"updated_at" gorm:"column:updated_at;autoUpdateTime"`

	// Optional embedded staff details
	Staff *Staff `json:"staff,omitempty" gorm:"foreignKey:StaffID"`
}

// TableName specifies the table name for GORM
func (Trainer) TableName() string {
	return "trainers"
}

// TrainerRequest is used for creating or updating a trainer
type TrainerRequest struct {
	StaffID        int64   `json:"staff_id" binding:"required"`
	Specialization string  `json:"specialization"`
	Certification  string  `json:"certification"`
	Experience     int     `json:"experience" binding:"min=0"`
	Rating         float64 `json:"rating" binding:"min=0,max=5"`
	IsActive       bool    `json:"is_active"`
}

// TrainerRepository defines the methods to interact with trainer data
type TrainerRepository interface {
	GetAll(ctx context.Context) ([]Trainer, error)
	GetAllPaginated(ctx context.Context, offset, limit int) ([]Trainer, int, error)
	GetByID(ctx context.Context, id int64) (*Trainer, error)
	GetByStaffID(ctx context.Context, staffID int64) (*Trainer, error)
	Create(ctx context.Context, req *TrainerRequest) (*Trainer, error)
	Update(ctx context.Context, id int64, req *TrainerRequest) (*Trainer, error)
	Delete(ctx context.Context, id int64) error
	GetBySpecialization(ctx context.Context, specialization string) ([]Trainer, error)
	GetTopRated(ctx context.Context, limit int) ([]Trainer, error)
	GetWithStaffDetails(ctx context.Context) ([]Trainer, error)
}

// TrainerService defines the business logic for trainer operations
type TrainerService interface {
	GetAll(ctx context.Context) ([]Trainer, error)
	GetAllPaginated(ctx context.Context, offset, limit int) ([]Trainer, int, error)
	GetByID(ctx context.Context, id int64) (*Trainer, error)
	GetByStaffID(ctx context.Context, staffID int64) (*Trainer, error)
	Create(ctx context.Context, trainer *Trainer) (*Trainer, error)
	Update(ctx context.Context, trainer *Trainer) (*Trainer, error)
	Delete(ctx context.Context, id int64) error
	GetBySpecialization(ctx context.Context, specialization string) ([]Trainer, error)
	GetTopRated(ctx context.Context, limit int) ([]Trainer, error)
	GetWithStaffDetails(ctx context.Context) ([]Trainer, error)
}
