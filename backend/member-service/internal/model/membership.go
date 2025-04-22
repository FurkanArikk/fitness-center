package model

import (
	"time"
)

// Membership, üyelik tiplerini içeren model
type Membership struct {
	ID             int64     `db:"membership_id" json:"id"`
	MembershipName string    `db:"membership_name" json:"membershipName"`
	Description    string    `db:"description" json:"description"`
	Duration       int       `db:"duration" json:"duration"` // in months
	Price          float64   `db:"price" json:"price"`
	IsActive       bool      `db:"is_active" json:"isActive"`
	CreatedAt      time.Time `db:"created_at" json:"createdAt"`
	UpdatedAt      time.Time `db:"updated_at" json:"updatedAt"`
}
