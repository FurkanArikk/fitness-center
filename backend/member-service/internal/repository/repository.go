package repository

import (
	"context"

	"github.com/FurkanArikk/fitness-center/backend/member-service/internal/model"
)

// MemberRepository, üye veritabanı işlemleri için arayüz
type MemberRepository interface {
	Create(ctx context.Context, member *model.Member) error
	GetByID(ctx context.Context, id int64) (*model.Member, error)
	Update(ctx context.Context, member *model.Member) error
	Delete(ctx context.Context, id int64) error
	List(ctx context.Context, offset, limit int) ([]*model.Member, error)
	Count(ctx context.Context) (int, error)
	GetByEmail(ctx context.Context, email string) (*model.Member, error)
}

// MembershipRepository, üyelik tipleri veritabanı işlemleri için arayüz
type MembershipRepository interface {
	Create(ctx context.Context, membership *model.Membership) error
	GetByID(ctx context.Context, id int64) (*model.Membership, error)
	Update(ctx context.Context, membership *model.Membership) error
	Delete(ctx context.Context, id int64) error
	List(ctx context.Context, offset, limit int) ([]*model.Membership, error)
	Count(ctx context.Context) (int, error)
	GetActiveOnes(ctx context.Context) ([]*model.Membership, error)
	GetActive(ctx context.Context) ([]*model.Membership, error)            // Add this method
	GetByName(ctx context.Context, name string) (*model.Membership, error) // Add this method
	GetAll(ctx context.Context) ([]*model.Membership, error)               // Add this method
	UpdateStatus(ctx context.Context, id int64, isActive bool) error       // Add this method
	IsMembershipInUse(ctx context.Context, id int64) (bool, error)         // Add this method
}

// BenefitRepository, üyelik avantajları veritabanı işlemleri için arayüz
type BenefitRepository interface {
	Create(ctx context.Context, benefit *model.MembershipBenefit) error
	GetByID(ctx context.Context, id int64) (*model.MembershipBenefit, error)
	Update(ctx context.Context, benefit *model.MembershipBenefit) error
	Delete(ctx context.Context, id int64) error
	List(ctx context.Context, membershipID int64) ([]*model.MembershipBenefit, error)
	GetByMembershipID(ctx context.Context, membershipID int64) ([]*model.MembershipBenefit, error)
	ListAll(ctx context.Context) ([]*model.MembershipBenefit, error) // Add this method
}

// MemberMembershipRepository, üye-üyelik ilişkileri veritabanı işlemleri için arayüz
type MemberMembershipRepository interface {
	Create(ctx context.Context, memberMembership *model.MemberMembership) error
	GetByID(ctx context.Context, id int64) (*model.MemberMembership, error)
	Update(ctx context.Context, memberMembership *model.MemberMembership) error
	Delete(ctx context.Context, id int64) error
	ListByMemberID(ctx context.Context, memberID int64) ([]*model.MemberMembership, error)
	GetActiveMembership(ctx context.Context, memberID int64) (*model.MemberMembership, error)
	GetByMemberID(ctx context.Context, memberID int64) ([]*model.MemberMembership, error) // Add this method
}

// FitnessAssessmentRepository, fitness değerlendirmeleri veritabanı işlemleri için arayüz
type FitnessAssessmentRepository interface {
	Create(ctx context.Context, assessment *model.FitnessAssessment) error
	GetByID(ctx context.Context, id int64) (*model.FitnessAssessment, error)
	Update(ctx context.Context, assessment *model.FitnessAssessment) error
	Delete(ctx context.Context, id int64) error
	ListByMemberID(ctx context.Context, memberID int64) ([]*model.FitnessAssessment, error)
	GetLatestByMemberID(ctx context.Context, memberID int64) (*model.FitnessAssessment, error)
	GetByMemberID(ctx context.Context, memberID int64) ([]*model.FitnessAssessment, error) // Add this method
}

// Define AssessmentRepository as an alias for FitnessAssessmentRepository
type AssessmentRepository = FitnessAssessmentRepository
