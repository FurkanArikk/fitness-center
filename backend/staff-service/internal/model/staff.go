package model

import (
	"context"
	"time"
)

// Staff represents a staff member of the fitness center
type Staff struct {
	StaffID   int64     `json:"staff_id" gorm:"column:staff_id;primaryKey;autoIncrement"`
	FirstName string    `json:"first_name" gorm:"column:first_name;type:varchar(50);not null"`
	LastName  string    `json:"last_name" gorm:"column:last_name;type:varchar(50);not null"`
	Email     string    `json:"email" gorm:"column:email;type:varchar(100);unique;not null"`
	Phone     string    `json:"phone" gorm:"column:phone;type:varchar(20)"`
	Address   string    `json:"address" gorm:"column:address;type:text"`
	Position  string    `json:"position" gorm:"column:position;type:varchar(50);not null"`
	HireDate  time.Time `json:"hire_date" gorm:"column:hire_date;not null"`
	Salary    float64   `json:"salary" gorm:"column:salary;type:decimal(10,2)"`
	Status    string    `json:"status" gorm:"column:status;type:varchar(20);default:'active'"`
	CreatedAt time.Time `json:"created_at" gorm:"column:created_at;autoCreateTime"`
	UpdatedAt time.Time `json:"updated_at" gorm:"column:updated_at;autoUpdateTime"`
}

// TableName specifies the table name for GORM
func (Staff) TableName() string {
	return "staff"
}

// StaffRequest is used for creating or updating a staff member
type StaffRequest struct {
	FirstName string    `json:"first_name" binding:"required"`
	LastName  string    `json:"last_name" binding:"required"`
	Email     string    `json:"email" binding:"required,email"`
	Phone     string    `json:"phone"`
	Address   string    `json:"address"`
	Position  string    `json:"position" binding:"required"`
	HireDate  time.Time `json:"hire_date" binding:"required"`
	Salary    float64   `json:"salary" binding:"required,min=0"`
	Status    string    `json:"status"`
}

// StaffRepository defines the methods to interact with the staff data
type StaffRepository interface {
	GetAll(ctx context.Context) ([]Staff, error)
	GetAllPaginated(ctx context.Context, offset, limit int) ([]Staff, int, error)
	GetByID(ctx context.Context, id int64) (*Staff, error)
	Create(ctx context.Context, staff *Staff) (*Staff, error)
	Update(ctx context.Context, staff *Staff) (*Staff, error)
	Delete(ctx context.Context, id int64) error
	GetByEmail(ctx context.Context, email string) (*Staff, error)
	GetByPosition(ctx context.Context, position string) ([]Staff, error)
	GetByStatus(ctx context.Context, status string) ([]Staff, error)
}

// StaffService defines the business logic for staff operations
type StaffService interface {
	GetAll(ctx context.Context) ([]Staff, error)
	GetAllPaginated(ctx context.Context, offset, limit int) ([]Staff, int, error)
	GetByID(ctx context.Context, id int64) (*Staff, error)
	Create(ctx context.Context, staff *Staff) (*Staff, error)
	Update(ctx context.Context, staff *Staff) (*Staff, error)
	Delete(ctx context.Context, id int64) error
	GetByEmail(ctx context.Context, email string) (*Staff, error)
	GetByPosition(ctx context.Context, position string) ([]Staff, error)
	GetByStatus(ctx context.Context, status string) ([]Staff, error)
}
