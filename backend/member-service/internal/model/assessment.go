package model

import (
	"time"
)

// FitnessAssessment, fitness değerlendirmelerini içeren model
type FitnessAssessment struct {
	ID                 int64     `db:"assessment_id" json:"id"`
	MemberID           int64     `db:"member_id" json:"memberId"`
	TrainerID          int64     `db:"trainer_id" json:"trainerId"`
	AssessmentDate     time.Time `db:"assessment_date" json:"assessmentDate"`
	Height             float64   `db:"height" json:"height"`
	Weight             float64   `db:"weight" json:"weight"`
	BodyFatPercentage  float64   `db:"body_fat_percentage" json:"bodyFatPercentage"`
	BMI                float64   `db:"bmi" json:"bmi"`
	Notes              string    `db:"notes" json:"notes"`
	GoalsSet           string    `db:"goals_set" json:"goalsSet"`
	NextAssessmentDate time.Time `db:"next_assessment_date" json:"nextAssessmentDate"`
	CreatedAt          time.Time `db:"created_at" json:"createdAt"`
	UpdatedAt          time.Time `db:"updated_at" json:"updatedAt"`
}
