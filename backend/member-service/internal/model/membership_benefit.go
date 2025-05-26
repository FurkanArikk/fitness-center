package model

import (
	"time"
)

// MembershipBenefit, üyelik avantajlarını içeren model
type MembershipBenefit struct {
	ID                 int64     `db:"benefit_id" json:"id"`
	MembershipID       int64     `db:"membership_id" json:"membership_id"`
	BenefitName        string    `db:"benefit_name" json:"benefit_name"`
	BenefitDescription string    `db:"benefit_description" json:"benefit_description"`
	CreatedAt          time.Time `db:"created_at" json:"created_at"`
	UpdatedAt          time.Time `db:"updated_at" json:"updated_at"`
}
