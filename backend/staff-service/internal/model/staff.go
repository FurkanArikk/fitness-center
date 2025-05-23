package model

import (
	"time"
)

// Staff represents a staff member of the fitness center
type Staff struct {
	StaffID   int64     `json:"staff_id" db:"staff_id"`
	FirstName string    `json:"first_name" db:"first_name"`
	LastName  string    `json:"last_name" db:"last_name"`
	Email     string    `json:"email" db:"email"`
	Phone     string    `json:"phone" db:"phone"`
	Address   string    `json:"address" db:"address"`
	Position  string    `json:"position" db:"position"`
	HireDate  time.Time `json:"hire_date" db:"hire_date"`
	Salary    float64   `json:"salary" db:"salary"`
	Status    string    `json:"status" db:"status"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
	UpdatedAt time.Time `json:"updated_at" db:"updated_at"`
}

// StaffRepository defines the methods to interact with the staff data
type StaffRepository interface {
	GetAll() ([]Staff, error)
	GetAllPaginated(offset, limit int) ([]Staff, int, error)
	GetByID(id int64) (*Staff, error)
	Create(staff *Staff) (*Staff, error)
	Update(staff *Staff) (*Staff, error)
	Delete(id int64) error
	GetByEmail(email string) (*Staff, error)
	GetByPosition(position string) ([]Staff, error)
	GetByStatus(status string) ([]Staff, error)
}

// StaffService defines the business logic for staff operations
type StaffService interface {
	GetAll() ([]Staff, error)
	GetAllPaginated(offset, limit int) ([]Staff, int, error)
	GetByID(id int64) (*Staff, error)
	Create(staff *Staff) (*Staff, error)
	Update(staff *Staff) (*Staff, error)
	Delete(id int64) error
	GetByEmail(email string) (*Staff, error)
	GetByPosition(position string) ([]Staff, error)
	GetByStatus(status string) ([]Staff, error)
}
