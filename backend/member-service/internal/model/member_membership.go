package model

import (
	"time"
)

// MemberMembership, üye-üyelik ilişkilerini içeren model
type MemberMembership struct {
	ID             int64     `db:"member_membership_id" json:"id"`
	MemberID       int64     `db:"member_id" json:"member_id"`
	MembershipID   int64     `db:"membership_id" json:"membership_id"`
	StartDate      DateOnly  `db:"start_date" json:"start_date"`
	EndDate        DateOnly  `db:"end_date" json:"end_date"`
	PaymentStatus  string    `db:"payment_status" json:"payment_status"`
	ContractSigned bool      `db:"contract_signed" json:"contract_signed"`
	CreatedAt      time.Time `db:"created_at" json:"created_at"`
	UpdatedAt      time.Time `db:"updated_at" json:"updated_at"`
}
