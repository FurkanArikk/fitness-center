package model

import (
	"time"
)

// Trainer represents a trainer who provides fitness training sessions
type Trainer struct {
	TrainerID      int64     `json:"trainer_id" db:"trainer_id"`
	StaffID        int64     `json:"staff_id" db:"staff_id"`
	Specialization string    `json:"specialization" db:"specialization"`
	Certification  string    `json:"certification" db:"certification"`
	Experience     int       `json:"experience" db:"experience"` // in years
	Rating         float64   `json:"rating" db:"rating"`
	IsActive       bool      `json:"is_active" db:"is_active"`
	CreatedAt      time.Time `json:"created_at" db:"created_at"`
	UpdatedAt      time.Time `json:"updated_at" db:"updated_at"`

	// Optional embedded staff details
	Staff *Staff `json:"staff,omitempty" db:"-"`
}

// TrainerRepository defines the methods to interact with trainer data
type TrainerRepository interface {
	GetAll() ([]Trainer, error)
	GetAllPaginated(offset, limit int) ([]Trainer, int, error)
	GetByID(id int64) (*Trainer, error)
	GetByStaffID(staffID int64) (*Trainer, error)
	Create(trainer *Trainer) (*Trainer, error)
	Update(trainer *Trainer) (*Trainer, error)
	Delete(id int64) error
	GetBySpecialization(specialization string) ([]Trainer, error)
	GetTopRated(limit int) ([]Trainer, error)
	GetWithStaffDetails() ([]Trainer, error)
}

// TrainerService defines the business logic for trainer operations
type TrainerService interface {
	GetAll() ([]Trainer, error)
	GetAllPaginated(offset, limit int) ([]Trainer, int, error)
	GetByID(id int64) (*Trainer, error)
	GetByStaffID(staffID int64) (*Trainer, error)
	Create(trainer *Trainer) (*Trainer, error)
	Update(trainer *Trainer) (*Trainer, error)
	Delete(id int64) error
	GetBySpecialization(specialization string) ([]Trainer, error)
	GetTopRated(limit int) ([]Trainer, error)
	GetWithStaffDetails() ([]Trainer, error)
}
