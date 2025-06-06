package model

import (
	"context"
	"time"
)

// Status constants for Member
const (
	StatusActive   = "active"
	StatusDeActive = "de_active"
	StatusHoldOn   = "hold_on"
)

// IsValidStatus checks if a status value is valid
func IsValidStatus(status string) bool {
	return status == StatusActive || status == StatusDeActive || status == StatusHoldOn
}

// Member, üye bilgilerini içeren model
type Member struct {
	ID                    int64     `json:"id" gorm:"column:member_id;primaryKey"`
	FirstName             string    `json:"first_name" gorm:"column:first_name;not null"`
	LastName              string    `json:"last_name" gorm:"column:last_name;not null"`
	Email                 string    `json:"email" gorm:"column:email;uniqueIndex;not null"`
	Phone                 string    `json:"phone" gorm:"column:phone"`
	Address               string    `json:"address" gorm:"column:address"`
	DateOfBirth           DateOnly  `json:"date_of_birth" gorm:"column:date_of_birth"`
	EmergencyContactName  string    `json:"emergency_contact_name" gorm:"column:emergency_contact_name"`
	EmergencyContactPhone string    `json:"emergency_contact_phone" gorm:"column:emergency_contact_phone"`
	JoinDate              DateOnly  `json:"join_date" gorm:"column:join_date"`
	Status                string    `json:"status" gorm:"column:status;default:'active'"`
	CreatedAt             time.Time `json:"created_at" gorm:"column:created_at;autoCreateTime"`
	UpdatedAt             time.Time `json:"updated_at" gorm:"column:updated_at;autoUpdateTime"`

	// One-to-many relationship - a member can have many member-memberships
	MemberMemberships []MemberMembership `json:"member_memberships,omitempty" gorm:"foreignKey:MemberID"`
	// One-to-many relationship - a member can have many assessments
	Assessments []FitnessAssessment `json:"assessments,omitempty" gorm:"foreignKey:MemberID"`
}

// TableName specifies the table name for GORM
func (Member) TableName() string {
	return "members"
}

// MemberRepository defines the operations for member data access
type MemberRepository interface {
	Create(ctx context.Context, member *Member) error
	GetByID(ctx context.Context, id int64) (*Member, error)
	Update(ctx context.Context, member *Member) error
	Delete(ctx context.Context, id int64) error
	List(ctx context.Context, offset, limit int) ([]*Member, error)
	Count(ctx context.Context) (int, error)
	GetByEmail(ctx context.Context, email string) (*Member, error)
}
