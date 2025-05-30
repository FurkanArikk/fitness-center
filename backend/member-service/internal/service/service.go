package service

import (
	"context"

	"github.com/FurkanArikk/fitness-center/backend/member-service/internal/model"
)

// MemberService, interface for member operations
type MemberService interface {
	Create(ctx context.Context, member *model.Member) error
	GetByID(ctx context.Context, id int64) (*model.Member, error)
	Update(ctx context.Context, member *model.Member) error
	Delete(ctx context.Context, id int64) error
	List(ctx context.Context, page, pageSize int) ([]*model.Member, int, error)
	GetByEmail(ctx context.Context, email string) (*model.Member, error)
}

// MembershipService, interface for membership operations
type MembershipService interface {
	Create(ctx context.Context, membership *model.Membership) error
	GetByID(ctx context.Context, id int64) (*model.Membership, error)
	Update(ctx context.Context, membership *model.Membership) error
	Delete(ctx context.Context, id int64) error
	List(ctx context.Context, page, pageSize int) ([]*model.Membership, int, error)
	GetActiveOnes(ctx context.Context) ([]*model.Membership, error)
	GetAll(ctx context.Context, activeOnly bool) ([]*model.Membership, error) // Add this method
	UpdateStatus(ctx context.Context, id int64, isActive bool) error          // Add this method
}

// BenefitService, interface for membership benefits operations
type BenefitService interface {
	Create(ctx context.Context, benefit *model.MembershipBenefit) error
	GetByID(ctx context.Context, id int64) (*model.MembershipBenefit, error)
	Update(ctx context.Context, benefit *model.MembershipBenefit) error
	Delete(ctx context.Context, id int64) error
	List(ctx context.Context, membershipID int64) ([]*model.MembershipBenefit, error)
	ListPaginated(ctx context.Context, membershipID int64, page, pageSize int) ([]*model.MembershipBenefit, int, error)
	ListAll(ctx context.Context) ([]*model.MembershipBenefit, error) // Add this method
	ListAllPaginated(ctx context.Context, page, pageSize int) ([]*model.MembershipBenefit, int, error)
}

// MemberMembershipService, interface for member-membership relationships operations
type MemberMembershipService interface {
	Create(ctx context.Context, memberMembership *model.MemberMembership) error
	GetByID(ctx context.Context, id int64) (*model.MemberMembership, error)
	Update(ctx context.Context, memberMembership *model.MemberMembership) error
	Delete(ctx context.Context, id int64) error
	ListByMemberID(ctx context.Context, memberID int64) ([]*model.MemberMembership, error)
	GetActiveMembership(ctx context.Context, memberID int64) (*model.MemberMembership, error)
}

// FitnessAssessmentService, interface for fitness assessments operations
type FitnessAssessmentService interface {
	Create(ctx context.Context, assessment *model.FitnessAssessment) error
	GetByID(ctx context.Context, id int64) (*model.FitnessAssessment, error)
	Update(ctx context.Context, assessment *model.FitnessAssessment) error
	Delete(ctx context.Context, id int64) error
	ListByMemberID(ctx context.Context, memberID int64) ([]*model.FitnessAssessment, error)
	GetLatestByMemberID(ctx context.Context, memberID int64) (*model.FitnessAssessment, error)
}
