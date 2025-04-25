package dto

import (
	"time"

	"github.com/FurkanArikk/fitness-center/backend/staff-service/internal/model"
)

// StaffResponse represents a staff response to the client
type StaffResponse struct {
	ID        int64     `json:"id"`
	FirstName string    `json:"first_name"`
	LastName  string    `json:"last_name"`
	Email     string    `json:"email"`
	Phone     string    `json:"phone"`
	Address   string    `json:"address"`
	Position  string    `json:"position"`
	HireDate  string    `json:"hire_date"`
	Salary    float64   `json:"salary"`
	Status    string    `json:"status"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// StaffRequest represents a staff request from the client
type StaffRequest struct {
	FirstName string  `json:"first_name" validate:"required"`
	LastName  string  `json:"last_name" validate:"required"`
	Email     string  `json:"email" validate:"required,email"`
	Phone     string  `json:"phone" validate:"required"`
	Address   string  `json:"address" validate:"required"`
	Position  string  `json:"position" validate:"required"`
	HireDate  string  `json:"hire_date" validate:"required,datetime=2006-01-02"`
	Salary    float64 `json:"salary" validate:"required,gt=0"`
	Status    string  `json:"status" validate:"required,oneof=Active Inactive Leave Terminated"`
}

// ToModel converts a StaffRequest to a Staff model
func (r *StaffRequest) ToModel() (*model.Staff, error) {
	hireDate, err := time.Parse("2006-01-02", r.HireDate)
	if err != nil {
		return nil, err
	}

	return &model.Staff{
		FirstName: r.FirstName,
		LastName:  r.LastName,
		Email:     r.Email,
		Phone:     r.Phone,
		Address:   r.Address,
		Position:  r.Position,
		HireDate:  hireDate,
		Salary:    r.Salary,
		Status:    r.Status,
	}, nil
}

// FromModel creates a StaffResponse from a Staff model
func StaffFromModel(s *model.Staff) *StaffResponse {
	return &StaffResponse{
		ID:        s.StaffID,
		FirstName: s.FirstName,
		LastName:  s.LastName,
		Email:     s.Email,
		Phone:     s.Phone,
		Address:   s.Address,
		Position:  s.Position,
		HireDate:  s.HireDate.Format("2006-01-02"),
		Salary:    s.Salary,
		Status:    s.Status,
		CreatedAt: s.CreatedAt,
		UpdatedAt: s.UpdatedAt,
	}
}

// StaffListResponse creates StaffResponses from Staff models
func StaffListFromModel(staff []model.Staff) []StaffResponse {
	result := make([]StaffResponse, len(staff))
	for i, s := range staff {
		result[i] = *StaffFromModel(&s)
	}
	return result
}
