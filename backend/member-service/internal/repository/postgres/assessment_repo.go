package postgres

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"time"

	"github.com/FurkanArikk/fitness-center/backend/member-service/internal/model"
	"github.com/FurkanArikk/fitness-center/backend/member-service/internal/repository"
)

// FitnessAssessmentRepo handles fitness assessment database operations
type FitnessAssessmentRepo struct {
	db *sql.DB
}

// NewFitnessAssessmentRepo creates a new FitnessAssessmentRepo instance
func NewFitnessAssessmentRepo(db *sql.DB) repository.FitnessAssessmentRepository {
	return &FitnessAssessmentRepo{
		db: db,
	}
}

// Create adds a new fitness assessment to the database
func (r *FitnessAssessmentRepo) Create(ctx context.Context, assessment *model.FitnessAssessment) error {
	query := `
		INSERT INTO fitness_assessments (
			member_id, trainer_id, assessment_date, height, weight, body_fat_percentage, 
			bmi, notes, goals_set, next_assessment_date, created_at, updated_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
		RETURNING assessment_id
	`

	now := time.Now()
	assessment.CreatedAt = now
	assessment.UpdatedAt = now

	err := r.db.QueryRowContext(
		ctx,
		query,
		assessment.MemberID,
		assessment.TrainerID,
		assessment.AssessmentDate,
		assessment.Height,
		assessment.Weight,
		assessment.BodyFatPercentage,
		assessment.BMI,
		assessment.Notes,
		assessment.GoalsSet,
		assessment.NextAssessmentDate,
		assessment.CreatedAt,
		assessment.UpdatedAt,
	).Scan(&assessment.ID)

	if err != nil {
		return fmt.Errorf("failed to create fitness assessment: %v", err)
	}

	return nil
}

// GetByID retrieves a fitness assessment by its ID
func (r *FitnessAssessmentRepo) GetByID(ctx context.Context, id int64) (*model.FitnessAssessment, error) {
	query := `
		SELECT 
			assessment_id, member_id, trainer_id, assessment_date, height, weight, 
			body_fat_percentage, bmi, notes, goals_set, next_assessment_date, created_at, updated_at
		FROM fitness_assessments
		WHERE assessment_id = $1
	`

	var assessment model.FitnessAssessment
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&assessment.ID,
		&assessment.MemberID,
		&assessment.TrainerID,
		&assessment.AssessmentDate,
		&assessment.Height,
		&assessment.Weight,
		&assessment.BodyFatPercentage,
		&assessment.BMI,
		&assessment.Notes,
		&assessment.GoalsSet,
		&assessment.NextAssessmentDate,
		&assessment.CreatedAt,
		&assessment.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, fmt.Errorf("fitness assessment not found: %v", err)
		}
		return nil, fmt.Errorf("failed to get fitness assessment: %v", err)
	}

	return &assessment, nil
}

// Update updates a fitness assessment's information
func (r *FitnessAssessmentRepo) Update(ctx context.Context, assessment *model.FitnessAssessment) error {
	query := `
		UPDATE fitness_assessments
		SET 
			member_id = $1,
			trainer_id = $2,
			assessment_date = $3,
			height = $4,
			weight = $5,
			body_fat_percentage = $6,
			bmi = $7,
			notes = $8,
			goals_set = $9,
			next_assessment_date = $10,
			updated_at = $11
		WHERE assessment_id = $12
	`

	assessment.UpdatedAt = time.Now()

	result, err := r.db.ExecContext(
		ctx,
		query,
		assessment.MemberID,
		assessment.TrainerID,
		assessment.AssessmentDate,
		assessment.Height,
		assessment.Weight,
		assessment.BodyFatPercentage,
		assessment.BMI,
		assessment.Notes,
		assessment.GoalsSet,
		assessment.NextAssessmentDate,
		assessment.UpdatedAt,
		assessment.ID,
	)

	if err != nil {
		return fmt.Errorf("failed to update fitness assessment: %v", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %v", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("fitness assessment not found")
	}

	return nil
}

// Delete removes a fitness assessment by its ID
func (r *FitnessAssessmentRepo) Delete(ctx context.Context, id int64) error {
	query := `DELETE FROM fitness_assessments WHERE assessment_id = $1`

	result, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return fmt.Errorf("failed to delete fitness assessment: %v", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %v", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("fitness assessment not found")
	}

	return nil
}

// ListByMemberID retrieves all fitness assessments for a specific member
func (r *FitnessAssessmentRepo) ListByMemberID(ctx context.Context, memberID int64) ([]*model.FitnessAssessment, error) {
	query := `
		SELECT 
			assessment_id, member_id, trainer_id, assessment_date, height, weight, 
			body_fat_percentage, bmi, notes, goals_set, next_assessment_date, created_at, updated_at
		FROM fitness_assessments
		WHERE member_id = $1
		ORDER BY assessment_date DESC
	`

	rows, err := r.db.QueryContext(ctx, query, memberID)
	if err != nil {
		return nil, fmt.Errorf("failed to list fitness assessments: %v", err)
	}
	defer rows.Close()

	var assessments []*model.FitnessAssessment
	for rows.Next() {
		var assessment model.FitnessAssessment
		if err := rows.Scan(
			&assessment.ID,
			&assessment.MemberID,
			&assessment.TrainerID,
			&assessment.AssessmentDate,
			&assessment.Height,
			&assessment.Weight,
			&assessment.BodyFatPercentage,
			&assessment.BMI,
			&assessment.Notes,
			&assessment.GoalsSet,
			&assessment.NextAssessmentDate,
			&assessment.CreatedAt,
			&assessment.UpdatedAt,
		); err != nil {
			return nil, fmt.Errorf("failed to scan fitness assessment: %v", err)
		}
		assessments = append(assessments, &assessment)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("rows error: %v", err)
	}

	return assessments, nil
}

// GetLatestByMemberID retrieves the most recent fitness assessment for a member
func (r *FitnessAssessmentRepo) GetLatestByMemberID(ctx context.Context, memberID int64) (*model.FitnessAssessment, error) {
	query := `
		SELECT 
			assessment_id, member_id, trainer_id, assessment_date, height, weight, 
			body_fat_percentage, bmi, notes, goals_set, next_assessment_date, created_at, updated_at
		FROM fitness_assessments
		WHERE member_id = $1
		ORDER BY assessment_date DESC
		LIMIT 1
	`

	var assessment model.FitnessAssessment
	err := r.db.QueryRowContext(ctx, query, memberID).Scan(
		&assessment.ID,
		&assessment.MemberID,
		&assessment.TrainerID,
		&assessment.AssessmentDate,
		&assessment.Height,
		&assessment.Weight,
		&assessment.BodyFatPercentage,
		&assessment.BMI,
		&assessment.Notes,
		&assessment.GoalsSet,
		&assessment.NextAssessmentDate,
		&assessment.CreatedAt,
		&assessment.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, fmt.Errorf("no fitness assessment found for member: %v", err)
		}
		return nil, fmt.Errorf("failed to get latest fitness assessment: %v", err)
	}

	return &assessment, nil
}

// GetByMemberID is an alias for ListByMemberID to satisfy the interface
func (r *FitnessAssessmentRepo) GetByMemberID(ctx context.Context, memberID int64) ([]*model.FitnessAssessment, error) {
	return r.ListByMemberID(ctx, memberID)
}
