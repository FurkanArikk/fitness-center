package repository

import (
	"github.com/FurkanArikk/fitness-center/backend/member-service/internal/model"
	"github.com/FurkanArikk/fitness-center/backend/member-service/internal/repository/postgres"
	"gorm.io/gorm"
)

// Repository is a factory for all repositories
type Repository struct {
	MemberRepo           model.MemberRepository
	MembershipRepo       model.MembershipRepository
	BenefitRepo          model.BenefitRepository
	MemberMembershipRepo model.MemberMembershipRepository
	AssessmentRepo       model.FitnessAssessmentRepository
}

// NewRepositories creates a new repository factory with all repositories
func NewRepositories(db *gorm.DB) *Repository {
	return &Repository{
		MemberRepo:           postgres.NewMemberRepository(db),
		MembershipRepo:       postgres.NewMembershipRepository(db),
		BenefitRepo:          postgres.NewBenefitRepository(db),
		MemberMembershipRepo: postgres.NewMemberMembershipRepository(db),
		AssessmentRepo:       postgres.NewAssessmentRepository(db),
	}
}

// NewMemberRepository creates a new member repository
func NewMemberRepository(db *gorm.DB) model.MemberRepository {
	return postgres.NewMemberRepository(db)
}

// NewMembershipRepository creates a new membership repository
func NewMembershipRepository(db *gorm.DB) model.MembershipRepository {
	return postgres.NewMembershipRepository(db)
}

// NewBenefitRepository creates a new benefit repository
func NewBenefitRepository(db *gorm.DB) model.BenefitRepository {
	return postgres.NewBenefitRepository(db)
}

// NewMemberMembershipRepository creates a new member membership repository
func NewMemberMembershipRepository(db *gorm.DB) model.MemberMembershipRepository {
	return postgres.NewMemberMembershipRepository(db)
}

// NewAssessmentRepository creates a new assessment repository
func NewAssessmentRepository(db *gorm.DB) model.FitnessAssessmentRepository {
	return postgres.NewAssessmentRepository(db)
}
