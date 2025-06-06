package model

import (
	"context"
	"time"
)

// MemberMembership, üye-üyelik ilişkilerini içeren model
type MemberMembership struct {
	ID             int64     `json:"id" gorm:"column:member_membership_id;primaryKey"`
	MemberID       int64     `json:"member_id" gorm:"column:member_id;not null;index"`
	MembershipID   int64     `json:"membership_id" gorm:"column:membership_id;not null;index"`
	StartDate      DateOnly  `json:"start_date" gorm:"column:start_date;not null"`
	EndDate        DateOnly  `json:"end_date" gorm:"column:end_date;not null"`
	PaymentStatus  string    `json:"payment_status" gorm:"column:payment_status;default:'pending'"`
	ContractSigned bool      `json:"contract_signed" gorm:"column:contract_signed;default:false"`
	CreatedAt      time.Time `json:"created_at" gorm:"column:created_at;autoCreateTime"`
	UpdatedAt      time.Time `json:"updated_at" gorm:"column:updated_at;autoUpdateTime"`

	// Foreign key relationships
	Member     *Member     `json:"member,omitempty" gorm:"foreignKey:MemberID;references:ID"`
	Membership *Membership `json:"membership,omitempty" gorm:"foreignKey:MembershipID;references:ID"`
}

// TableName specifies the table name for GORM
func (MemberMembership) TableName() string {
	return "member_memberships"
}

// MemberMembershipRepository defines the operations for member-membership relationship data access
type MemberMembershipRepository interface {
	Create(ctx context.Context, memberMembership *MemberMembership) error
	GetByID(ctx context.Context, id int64) (*MemberMembership, error)
	Update(ctx context.Context, memberMembership *MemberMembership) error
	Delete(ctx context.Context, id int64) error
	ListByMemberID(ctx context.Context, memberID int64) ([]*MemberMembership, error)
	GetActiveMembership(ctx context.Context, memberID int64) (*MemberMembership, error)
	GetByMemberID(ctx context.Context, memberID int64) ([]*MemberMembership, error)
}
