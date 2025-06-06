package model

import (
	"context"
	"time"
)

// FitnessAssessment, fitness değerlendirmelerini içeren model
type FitnessAssessment struct {
	ID                 int64     `json:"id" gorm:"column:assessment_id;primaryKey"`
	MemberID           int64     `json:"member_id" gorm:"column:member_id;not null;index"`
	TrainerID          int64     `json:"trainer_id" gorm:"column:trainer_id;not null;index"`
	AssessmentDate     DateOnly  `json:"assessment_date" gorm:"column:assessment_date;not null"`
	Height             float64   `json:"height" gorm:"column:height"`
	Weight             float64   `json:"weight" gorm:"column:weight"`
	BodyFatPercentage  float64   `json:"body_fat_percentage" gorm:"column:body_fat_percentage"`
	BMI                float64   `json:"bmi" gorm:"column:bmi"`
	Notes              string    `json:"notes" gorm:"column:notes"`
	GoalsSet           string    `json:"goals_set" gorm:"column:goals_set"`
	NextAssessmentDate DateOnly  `json:"next_assessment_date" gorm:"column:next_assessment_date"`
	CreatedAt          time.Time `json:"created_at" gorm:"column:created_at;autoCreateTime"`
	UpdatedAt          time.Time `json:"updated_at" gorm:"column:updated_at;autoUpdateTime"`

	// Foreign key relationship
	Member *Member `json:"member,omitempty" gorm:"foreignKey:MemberID;references:ID"`
}

// TableName specifies the table name for GORM
func (FitnessAssessment) TableName() string {
	return "fitness_assessments"
}

// FitnessAssessmentRepository defines the operations for fitness assessment data access
type FitnessAssessmentRepository interface {
	Create(ctx context.Context, assessment *FitnessAssessment) error
	GetByID(ctx context.Context, id int64) (*FitnessAssessment, error)
	Update(ctx context.Context, assessment *FitnessAssessment) error
	Delete(ctx context.Context, id int64) error
	ListByMemberID(ctx context.Context, memberID int64) ([]*FitnessAssessment, error)
	GetLatestByMemberID(ctx context.Context, memberID int64) (*FitnessAssessment, error)
	GetByMemberID(ctx context.Context, memberID int64) ([]*FitnessAssessment, error)
}

// AssessmentRepository is an alias for FitnessAssessmentRepository
type AssessmentRepository = FitnessAssessmentRepository
