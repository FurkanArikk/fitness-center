package model

import (
	"time"
)

// Status constants for Member
const (
	StatusActive   = "active"
	StatusDeActive = "de_active"
	StatusHoldOn   = "hold_on"
)

// IsValidStatus checks if a status value is valid
func IsValidStatus(status string) bool {
	return status == StatusActive || status == StatusDeActive || status == StatusHoldOn
}

// Member, üye bilgilerini içeren model
type Member struct {
	ID                    int64     `db:"member_id" json:"id"`
	FirstName             string    `db:"first_name" json:"first_name"`
	LastName              string    `db:"last_name" json:"last_name"`
	Email                 string    `db:"email" json:"email"`
	Phone                 string    `db:"phone" json:"phone"`
	Address               string    `db:"address" json:"address"`
	DateOfBirth           DateOnly  `db:"date_of_birth" json:"date_of_birth"`
	EmergencyContactName  string    `db:"emergency_contact_name" json:"emergency_contact_name"`
	EmergencyContactPhone string    `db:"emergency_contact_phone" json:"emergency_contact_phone"`
	JoinDate              DateOnly  `db:"join_date" json:"join_date"`
	Status                string    `db:"status" json:"status"`
	CreatedAt             time.Time `db:"created_at" json:"created_at"`
	UpdatedAt             time.Time `db:"updated_at" json:"updated_at"`
}
