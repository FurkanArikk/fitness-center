package model

import (
	"time"
)

// Qualification represents a professional qualification of a staff member
type Qualification struct {
	QualificationID   int64     `json:"qualification_id" db:"qualification_id"`
	StaffID           int64     `json:"staff_id" db:"staff_id"`
	QualificationName string    `json:"qualification_name" db:"qualification_name"`
	IssueDate         time.Time `json:"issue_date" db:"issue_date"`
	ExpiryDate        time.Time `json:"expiry_date" db:"expiry_date"`
	IssuingAuthority  string    `json:"issuing_authority" db:"issuing_authority"`
	CreatedAt         time.Time `json:"created_at" db:"created_at"`
	UpdatedAt         time.Time `json:"updated_at" db:"updated_at"`
}

// QualificationRepository defines the methods to interact with qualification data
type QualificationRepository interface {
	GetAll() ([]Qualification, error)
	GetAllPaginated(offset, limit int) ([]Qualification, int, error)
	GetByID(id int64) (*Qualification, error)
	GetByStaffID(staffID int64) ([]Qualification, error)
	GetByStaffIDPaginated(staffID int64, offset, limit int) ([]Qualification, int, error)
	Create(qualification *Qualification) (*Qualification, error)
	Update(qualification *Qualification) (*Qualification, error)
	Delete(id int64) error
	GetExpiringSoon(days int) ([]Qualification, error)
}

// QualificationService defines the business logic for qualification operations
type QualificationService interface {
	GetAll() ([]Qualification, error)
	GetAllPaginated(offset, limit int) ([]Qualification, int, error)
	GetByID(id int64) (*Qualification, error)
	GetByStaffID(staffID int64) ([]Qualification, error)
	GetByStaffIDPaginated(staffID int64, offset, limit int) ([]Qualification, int, error)
	Create(qualification *Qualification) (*Qualification, error)
	Update(qualification *Qualification) (*Qualification, error)
	Delete(id int64) error
	GetExpiringSoon(days int) ([]Qualification, error)
}
