package model

import (
	"time"
)

// FitnessAssessment, fitness değerlendirmelerini içeren model
type FitnessAssessment struct {
	ID                 int64     `db:"assessment_id" json:"id"`
	MemberID           int64     `db:"member_id" json:"member_id"`
	TrainerID          int64     `db:"trainer_id" json:"trainer_id"`
	AssessmentDate     DateOnly  `db:"assessment_date" json:"assessment_date"`
	Height             float64   `db:"height" json:"height"`
	Weight             float64   `db:"weight" json:"weight"`
	BodyFatPercentage  float64   `db:"body_fat_percentage" json:"body_fat_percentage"`
	BMI                float64   `db:"bmi" json:"bmi"`
	Notes              string    `db:"notes" json:"notes"`
	GoalsSet           string    `db:"goals_set" json:"goals_set"`
	NextAssessmentDate DateOnly  `db:"next_assessment_date" json:"next_assessment_date"`
	CreatedAt          time.Time `db:"created_at" json:"created_at"`
	UpdatedAt          time.Time `db:"updated_at" json:"updated_at"`
}
