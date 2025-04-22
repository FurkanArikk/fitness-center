package handler

import "time"

// Assessment represents the data structure for assessment requests
type Assessment struct {
	AssessmentID       int64     `json:"id"`
	MemberID           int64     `json:"memberId"`
	TrainerID          int64     `json:"trainerId"`
	AssessmentDate     time.Time `json:"assessmentDate"`
	Height             float64   `json:"height"`
	Weight             float64   `json:"weight"`
	BodyFatPercentage  float64   `json:"bodyFatPercentage"`
	BMI                float64   `json:"bmi"`
	Notes              string    `json:"notes"`
	GoalsSet           string    `json:"goalsSet"`
	NextAssessmentDate time.Time `json:"nextAssessmentDate"`
}

// Benefit represents the data structure for benefit requests
type Benefit struct {
	BenefitID          int64  `json:"id"`
	MembershipID       int64  `json:"membershipId"`
	BenefitName        string `json:"benefitName"`
	BenefitDescription string `json:"benefitDescription"`
}

// MemberMembership represents the data structure for member-membership requests
type MemberMembership struct {
	MemberMembershipID int64     `json:"id"`
	MemberID           int64     `json:"memberId"`
	MembershipID       int64     `json:"membershipId"`
	StartDate          time.Time `json:"startDate"`
	EndDate            time.Time `json:"endDate"`
	PaymentStatus      string    `json:"paymentStatus"`
	ContractSigned     bool      `json:"contractSigned"`
}

// Membership represents the data structure for membership requests
type Membership struct {
	MembershipID   int64   `json:"id"`
	MembershipName string  `json:"membershipName"`
	Description    string  `json:"description"`
	Duration       int     `json:"duration"`
	Price          float64 `json:"price"`
	IsActive       bool    `json:"isActive"`
}
