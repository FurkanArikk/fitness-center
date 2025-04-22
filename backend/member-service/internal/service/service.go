package service

import (
	"context"

	"github.com/FurkanArikk/fitness-center/backend/member-service/internal/model"
)

// MemberService, üye işlemleri için servis arayüzü
type MemberService interface {
	Create(ctx context.Context, member *model.Member) error
	GetByID(ctx context.Context, id int64) (*model.Member, error)
	Update(ctx context.Context, member *model.Member) error
	Delete(ctx context.Context, id int64) error
	List(ctx context.Context, page, pageSize int) ([]*model.Member, error)
	GetByEmail(ctx context.Context, email string) (*model.Member, error)
}

// MembershipService, üyelik tipleri işlemleri için servis arayüzü
type MembershipService interface {
	Create(ctx context.Context, membership *model.Membership) error
	GetByID(ctx context.Context, id int64) (*model.Membership, error)
	Update(ctx context.Context, membership *model.Membership) error
	Delete(ctx context.Context, id int64) error
	List(ctx context.Context, page, pageSize int) ([]*model.Membership, error)
	GetActiveOnes(ctx context.Context) ([]*model.Membership, error)
	GetAll(ctx context.Context, activeOnly bool) ([]*model.Membership, error) // Add this method
	UpdateStatus(ctx context.Context, id int64, isActive bool) error          // Add this method
}

// BenefitService, üyelik avantajları işlemleri için servis arayüzü
type BenefitService interface {
	Create(ctx context.Context, benefit *model.MembershipBenefit) error
	GetByID(ctx context.Context, id int64) (*model.MembershipBenefit, error)
	Update(ctx context.Context, benefit *model.MembershipBenefit) error
	Delete(ctx context.Context, id int64) error
	List(ctx context.Context, membershipID int64) ([]*model.MembershipBenefit, error)
	ListAll(ctx context.Context) ([]*model.MembershipBenefit, error) // Add this method
}

// MemberMembershipService, üye-üyelik ilişkileri işlemleri için servis arayüzü
type MemberMembershipService interface {
	Create(ctx context.Context, memberMembership *model.MemberMembership) error
	GetByID(ctx context.Context, id int64) (*model.MemberMembership, error)
	Update(ctx context.Context, memberMembership *model.MemberMembership) error
	Delete(ctx context.Context, id int64) error
	ListByMemberID(ctx context.Context, memberID int64) ([]*model.MemberMembership, error)
	GetActiveMembership(ctx context.Context, memberID int64) (*model.MemberMembership, error)
}

// FitnessAssessmentService, fitness değerlendirmeleri işlemleri için servis arayüzü
type FitnessAssessmentService interface {
	Create(ctx context.Context, assessment *model.FitnessAssessment) error
	GetByID(ctx context.Context, id int64) (*model.FitnessAssessment, error)
	Update(ctx context.Context, assessment *model.FitnessAssessment) error
	Delete(ctx context.Context, id int64) error
	ListByMemberID(ctx context.Context, memberID int64) ([]*model.FitnessAssessment, error)
	GetLatestByMemberID(ctx context.Context, memberID int64) (*model.FitnessAssessment, error)
}

// PaymentService interface removed as it will be implemented in the payment-service
