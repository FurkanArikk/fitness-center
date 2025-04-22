package model

import (
	"time"
)

// MembershipBenefit, üyelik avantajlarını içeren model
type MembershipBenefit struct {
	ID                 int64     `db:"benefit_id" json:"id"`
	MembershipID       int64     `db:"membership_id" json:"membershipId"`
	BenefitName        string    `db:"benefit_name" json:"benefitName"`
	BenefitDescription string    `db:"benefit_description" json:"benefitDescription"`
	CreatedAt          time.Time `db:"created_at" json:"createdAt"`
	UpdatedAt          time.Time `db:"updated_at" json:"updatedAt"`
}
