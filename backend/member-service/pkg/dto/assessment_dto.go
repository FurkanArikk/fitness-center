package dto

import (
	"time"
)

// AssessmentRequest represents the incoming request for creating or updating an assessment
type AssessmentRequest struct {
	MemberID           int64     `json:"member_id"`
	TrainerID          int64     `json:"trainer_id"`
	AssessmentDate     time.Time `json:"assessment_date"`
	Height             float64   `json:"height,omitempty"`
	Weight             float64   `json:"weight,omitempty"`
	BodyFatPercentage  float64   `json:"body_fat_percentage,omitempty"`
	BMI                float64   `json:"bmi,omitempty"`
	Notes              string    `json:"notes,omitempty"`
	GoalsSet           string    `json:"goals_set,omitempty"`
	NextAssessmentDate time.Time `json:"next_assessment_date,omitempty"`
}

// AssessmentResponse represents the API response for an assessment
type AssessmentResponse struct {
	AssessmentID       int64     `json:"assessment_id"`
	MemberID           int64     `json:"member_id"`
	TrainerID          int64     `json:"trainer_id"`
	AssessmentDate     time.Time `json:"assessment_date"`
	Height             float64   `json:"height,omitempty"`
	Weight             float64   `json:"weight,omitempty"`
	BodyFatPercentage  float64   `json:"body_fat_percentage,omitempty"`
	BMI                float64   `json:"bmi,omitempty"`
	Notes              string    `json:"notes,omitempty"`
	GoalsSet           string    `json:"goals_set,omitempty"`
	NextAssessmentDate time.Time `json:"next_assessment_date,omitempty"`
	CreatedAt          time.Time `json:"created_at"`
	UpdatedAt          time.Time `json:"updated_at"`
}

// AssessmentListResponse represents a list of assessments in the API response
type AssessmentListResponse struct {
	Assessments []AssessmentResponse `json:"assessments"`
	Total       int                  `json:"total"`
}

// AssessmentHistoryResponse represents historical assessment data for comparison
type AssessmentHistoryResponse struct {
	Dates      []time.Time `json:"dates"`
	Weights    []float64   `json:"weights,omitempty"`
	BodyFats   []float64   `json:"body_fats,omitempty"`
	BMIs       []float64   `json:"bmis,omitempty"`
	MemberID   int64       `json:"member_id"`
	MemberName string      `json:"member_name"`
}
