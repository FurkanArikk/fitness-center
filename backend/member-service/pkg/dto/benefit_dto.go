package dto

import (
	"time"
)

// BenefitRequest represents the incoming request for creating or updating a benefit
type BenefitRequest struct {
	MembershipID       int64  `json:"membership_id"`
	BenefitName        string `json:"benefit_name"`
	BenefitDescription string `json:"benefit_description,omitempty"`
}

// BenefitResponse represents the API response for a membership benefit
type BenefitResponse struct {
	BenefitID          int64     `json:"benefit_id"`
	MembershipID       int64     `json:"membership_id"`
	BenefitName        string    `json:"benefit_name"`
	BenefitDescription string    `json:"benefit_description,omitempty"`
	CreatedAt          time.Time `json:"created_at"`
	UpdatedAt          time.Time `json:"updated_at"`
}

// BenefitListResponse represents a list of benefits in the API response
type BenefitListResponse struct {
	Benefits []BenefitResponse `json:"benefits"`
	Total    int               `json:"total"`
}

// MembershipWithBenefitsResponse represents a membership with its benefits
type MembershipWithBenefitsResponse struct {
	MembershipResponse MembershipResponse `json:"membership"`
	Benefits           []BenefitResponse  `json:"benefits"`
}
