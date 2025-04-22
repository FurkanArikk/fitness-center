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
	FirstName             string    `db:"first_name" json:"firstName"`
	LastName              string    `db:"last_name" json:"lastName"`
	Email                 string    `db:"email" json:"email"`
	Phone                 string    `db:"phone" json:"phone"`
	Address               string    `db:"address" json:"address"`
	DateOfBirth           time.Time `db:"date_of_birth" json:"dateOfBirth"`
	EmergencyContactName  string    `db:"emergency_contact_name" json:"emergencyContactName"`
	EmergencyContactPhone string    `db:"emergency_contact_phone" json:"emergencyContactPhone"`
	JoinDate              time.Time `db:"join_date" json:"joinDate"`
	Status                string    `db:"status" json:"status"`
	CreatedAt             time.Time `db:"created_at" json:"createdAt"`
	UpdatedAt             time.Time `db:"updated_at" json:"updatedAt"`
}
