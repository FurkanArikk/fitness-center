package model

import (
	"context"
	"time"
)

// MembershipBenefit, üyelik avantajlarını içeren model
type MembershipBenefit struct {
	ID                 int64     `json:"id" gorm:"column:benefit_id;primaryKey"`
	MembershipID       int64     `json:"membership_id" gorm:"column:membership_id;not null;index"`
	BenefitName        string    `json:"benefit_name" gorm:"column:benefit_name;not null"`
	BenefitDescription string    `json:"benefit_description" gorm:"column:benefit_description"`
	CreatedAt          time.Time `json:"created_at" gorm:"column:created_at;autoCreateTime"`
	UpdatedAt          time.Time `json:"updated_at" gorm:"column:updated_at;autoUpdateTime"`

	// Foreign key relationship
	Membership *Membership `json:"membership,omitempty" gorm:"foreignKey:MembershipID;references:ID"`
}

// TableName specifies the table name for GORM
func (MembershipBenefit) TableName() string {
	return "membership_benefits"
}

// BenefitRepository defines the operations for membership benefit data access
type BenefitRepository interface {
	Create(ctx context.Context, benefit *MembershipBenefit) error
	GetByID(ctx context.Context, id int64) (*MembershipBenefit, error)
	Update(ctx context.Context, benefit *MembershipBenefit) error
	Delete(ctx context.Context, id int64) error
	List(ctx context.Context, membershipID int64) ([]*MembershipBenefit, error)
	ListPaginated(ctx context.Context, membershipID int64, offset, limit int) ([]*MembershipBenefit, error)
	GetByMembershipID(ctx context.Context, membershipID int64) ([]*MembershipBenefit, error)
	ListAll(ctx context.Context) ([]*MembershipBenefit, error)
	ListAllPaginated(ctx context.Context, offset, limit int) ([]*MembershipBenefit, error)
	Count(ctx context.Context) (int, error)
	CountByMembership(ctx context.Context, membershipID int64) (int, error)
}
