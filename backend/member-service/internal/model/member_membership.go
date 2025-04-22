package model

import (
	"time"
)

// MemberMembership, üye-üyelik ilişkilerini içeren model
type MemberMembership struct {
	ID             int64     `db:"member_membership_id" json:"id"`
	MemberID       int64     `db:"member_id" json:"memberId"`
	MembershipID   int64     `db:"membership_id" json:"membershipId"`
	StartDate      time.Time `db:"start_date" json:"startDate"`
	EndDate        time.Time `db:"end_date" json:"endDate"`
	PaymentStatus  string    `db:"payment_status" json:"paymentStatus"`
	ContractSigned bool      `db:"contract_signed" json:"contractSigned"`
	CreatedAt      time.Time `db:"created_at" json:"createdAt"`
	UpdatedAt      time.Time `db:"updated_at" json:"updatedAt"`
}
