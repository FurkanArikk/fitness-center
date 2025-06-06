package model

import (
	"context"
	"time"
)

// Qualification represents a professional qualification of a staff member
type Qualification struct {
	QualificationID   int64     `json:"qualification_id" gorm:"column:qualification_id;primaryKey;autoIncrement"`
	StaffID           int64     `json:"staff_id" gorm:"column:staff_id;not null"`
	QualificationName string    `json:"qualification_name" gorm:"column:qualification_name;type:varchar(100);not null"`
	IssueDate         time.Time `json:"issue_date" gorm:"column:issue_date;not null"`
	ExpiryDate        time.Time `json:"expiry_date" gorm:"column:expiry_date"`
	IssuingAuthority  string    `json:"issuing_authority" gorm:"column:issuing_authority;type:varchar(100)"`
	CreatedAt         time.Time `json:"created_at" gorm:"column:created_at;autoCreateTime"`
	UpdatedAt         time.Time `json:"updated_at" gorm:"column:updated_at;autoUpdateTime"`
}

// TableName specifies the table name for GORM
func (Qualification) TableName() string {
	return "staff_qualifications"
}

// QualificationRequest is used for creating or updating a qualification
type QualificationRequest struct {
	StaffID           int64     `json:"staff_id" binding:"required"`
	QualificationName string    `json:"qualification_name" binding:"required"`
	IssueDate         time.Time `json:"issue_date" binding:"required"`
	ExpiryDate        time.Time `json:"expiry_date"`
	IssuingAuthority  string    `json:"issuing_authority"`
}

// QualificationRepository defines the methods to interact with qualification data
type QualificationRepository interface {
	GetAll(ctx context.Context) ([]Qualification, error)
	GetAllPaginated(ctx context.Context, offset, limit int) ([]Qualification, int, error)
	GetByID(ctx context.Context, id int64) (*Qualification, error)
	GetByStaffID(ctx context.Context, staffID int64) ([]Qualification, error)
	GetByStaffIDPaginated(ctx context.Context, staffID int64, offset, limit int) ([]Qualification, int, error)
	Create(ctx context.Context, req *QualificationRequest) (*Qualification, error)
	Update(ctx context.Context, id int64, req *QualificationRequest) (*Qualification, error)
	Delete(ctx context.Context, id int64) error
	GetExpiringSoon(ctx context.Context, days int) ([]Qualification, error)
}

// QualificationService defines the business logic for qualification operations
type QualificationService interface {
	GetAll(ctx context.Context) ([]Qualification, error)
	GetAllPaginated(ctx context.Context, offset, limit int) ([]Qualification, int, error)
	GetByID(ctx context.Context, id int64) (*Qualification, error)
	GetByStaffID(ctx context.Context, staffID int64) ([]Qualification, error)
	GetByStaffIDPaginated(ctx context.Context, staffID int64, offset, limit int) ([]Qualification, int, error)
	Create(ctx context.Context, qualification *Qualification) (*Qualification, error)
	Update(ctx context.Context, qualification *Qualification) (*Qualification, error)
	Delete(ctx context.Context, id int64) error
	GetExpiringSoon(ctx context.Context, days int) ([]Qualification, error)
}
