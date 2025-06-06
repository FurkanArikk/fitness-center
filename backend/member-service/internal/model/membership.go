package model

import (
	"context"
	"time"
)

// Membership, üyelik tiplerini içeren model
type Membership struct {
	ID             int64     `json:"id" gorm:"column:membership_id;primaryKey"`
	MembershipName string    `json:"membership_name" gorm:"column:membership_name;uniqueIndex;not null"`
	Description    string    `json:"description" gorm:"column:description"`
	Duration       int       `json:"duration" gorm:"column:duration;not null"` // in months
	Price          float64   `json:"price" gorm:"column:price;not null"`
	IsActive       bool      `json:"is_active" gorm:"column:is_active;default:true"`
	CreatedAt      time.Time `json:"created_at" gorm:"column:created_at;autoCreateTime"`
	UpdatedAt      time.Time `json:"updated_at" gorm:"column:updated_at;autoUpdateTime"`

	// One-to-many relationship - a membership can have many benefits
	Benefits []MembershipBenefit `json:"benefits,omitempty" gorm:"foreignKey:MembershipID"`
	// One-to-many relationship - a membership can have many member-memberships
	MemberMemberships []MemberMembership `json:"member_memberships,omitempty" gorm:"foreignKey:MembershipID"`
}

// TableName specifies the table name for GORM
func (Membership) TableName() string {
	return "memberships"
}

// MembershipRepository defines the operations for membership data access
type MembershipRepository interface {
	Create(ctx context.Context, membership *Membership) error
	GetByID(ctx context.Context, id int64) (*Membership, error)
	Update(ctx context.Context, membership *Membership) error
	Delete(ctx context.Context, id int64) error
	List(ctx context.Context, offset, limit int) ([]*Membership, error)
	Count(ctx context.Context) (int, error)
	GetActiveOnes(ctx context.Context) ([]*Membership, error)
	GetActive(ctx context.Context) ([]*Membership, error)
	GetByName(ctx context.Context, name string) (*Membership, error)
	GetAll(ctx context.Context) ([]*Membership, error)
	UpdateStatus(ctx context.Context, id int64, isActive bool) error
	IsMembershipInUse(ctx context.Context, id int64) (bool, error)
}
