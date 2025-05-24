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

// BenefitRepo, üyelik avantajları veritabanı işlemlerini gerçekleştirir
type BenefitRepo struct {
	db *sql.DB
}

// NewBenefitRepo, yeni bir BenefitRepo oluşturur
func NewBenefitRepo(db *sql.DB) repository.BenefitRepository {
	return &BenefitRepo{
		db: db,
	}
}

// Create, yeni bir üyelik avantajı oluşturur
func (r *BenefitRepo) Create(ctx context.Context, benefit *model.MembershipBenefit) error {
	query := `
		INSERT INTO membership_benefits (
			membership_id, benefit_name, benefit_description, created_at, updated_at
		) VALUES ($1, $2, $3, $4, $5)
		RETURNING benefit_id
	`

	now := time.Now()
	benefit.CreatedAt = now
	benefit.UpdatedAt = now

	err := r.db.QueryRowContext(
		ctx,
		query,
		benefit.MembershipID,
		benefit.BenefitName,
		benefit.BenefitDescription,
		benefit.CreatedAt,
		benefit.UpdatedAt,
	).Scan(&benefit.ID)

	if err != nil {
		return fmt.Errorf("failed to create membership benefit: %v", err)
	}

	return nil
}

// GetByID, ID'ye göre üyelik avantajı getirir
func (r *BenefitRepo) GetByID(ctx context.Context, id int64) (*model.MembershipBenefit, error) {
	query := `
		SELECT 
			benefit_id, membership_id, benefit_name, benefit_description, created_at, updated_at
		FROM membership_benefits
		WHERE benefit_id = $1
	`

	var benefit model.MembershipBenefit
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&benefit.ID,
		&benefit.MembershipID,
		&benefit.BenefitName,
		&benefit.BenefitDescription,
		&benefit.CreatedAt,
		&benefit.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, fmt.Errorf("membership benefit not found: %v", err)
		}
		return nil, fmt.Errorf("failed to get membership benefit: %v", err)
	}

	return &benefit, nil
}

// Update, üyelik avantajı bilgilerini günceller
func (r *BenefitRepo) Update(ctx context.Context, benefit *model.MembershipBenefit) error {
	query := `
		UPDATE membership_benefits
		SET 
			membership_id = $1,
			benefit_name = $2,
			benefit_description = $3,
			updated_at = $4
		WHERE benefit_id = $5
	`

	benefit.UpdatedAt = time.Now()

	result, err := r.db.ExecContext(
		ctx,
		query,
		benefit.MembershipID,
		benefit.BenefitName,
		benefit.BenefitDescription,
		benefit.UpdatedAt,
		benefit.ID,
	)

	if err != nil {
		return fmt.Errorf("failed to update membership benefit: %v", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %v", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("membership benefit not found")
	}

	return nil
}

// Delete, üyelik avantajını siler
func (r *BenefitRepo) Delete(ctx context.Context, id int64) error {
	query := `DELETE FROM membership_benefits WHERE benefit_id = $1`

	result, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return fmt.Errorf("failed to delete membership benefit: %v", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %v", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("membership benefit not found")
	}

	return nil
}

// List, belirli bir üyelik tipi için avantajları listeler
func (r *BenefitRepo) List(ctx context.Context, membershipID int64) ([]*model.MembershipBenefit, error) {
	query := `
		SELECT 
			benefit_id, membership_id, benefit_name, benefit_description, created_at, updated_at
		FROM membership_benefits
		WHERE membership_id = $1
		ORDER BY created_at DESC
	`

	rows, err := r.db.QueryContext(ctx, query, membershipID)
	if err != nil {
		return nil, fmt.Errorf("failed to list membership benefits: %v", err)
	}
	defer rows.Close()

	var benefits []*model.MembershipBenefit
	for rows.Next() {
		var benefit model.MembershipBenefit
		if err := rows.Scan(
			&benefit.ID,
			&benefit.MembershipID,
			&benefit.BenefitName,
			&benefit.BenefitDescription,
			&benefit.CreatedAt,
			&benefit.UpdatedAt,
		); err != nil {
			return nil, fmt.Errorf("failed to scan membership benefit: %v", err)
		}
		benefits = append(benefits, &benefit)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("rows error: %v", err)
	}

	return benefits, nil
}

// ListAll returns all benefits regardless of membership
func (r *BenefitRepo) ListAll(ctx context.Context) ([]*model.MembershipBenefit, error) {
	query := `
		SELECT 
			benefit_id, membership_id, benefit_name, benefit_description, created_at, updated_at
		FROM membership_benefits
		ORDER BY created_at DESC
	`

	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to list all membership benefits: %v", err)
	}
	defer rows.Close()

	var benefits []*model.MembershipBenefit
	for rows.Next() {
		var benefit model.MembershipBenefit
		if err := rows.Scan(
			&benefit.ID,
			&benefit.MembershipID,
			&benefit.BenefitName,
			&benefit.BenefitDescription,
			&benefit.CreatedAt,
			&benefit.UpdatedAt,
		); err != nil {
			return nil, fmt.Errorf("failed to scan membership benefit: %v", err)
		}
		benefits = append(benefits, &benefit)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("rows error: %v", err)
	}

	return benefits, nil
}

// GetByMembershipID is an alias for the List method
func (r *BenefitRepo) GetByMembershipID(ctx context.Context, membershipID int64) ([]*model.MembershipBenefit, error) {
	return r.List(ctx, membershipID)
}

// ListPaginated returns benefits for a specific membership with pagination
func (r *BenefitRepo) ListPaginated(ctx context.Context, membershipID int64, offset, limit int) ([]*model.MembershipBenefit, error) {
	query := `
		SELECT 
			benefit_id, membership_id, benefit_name, benefit_description, created_at, updated_at
		FROM membership_benefits
		WHERE membership_id = $1
		ORDER BY created_at DESC
		LIMIT $2 OFFSET $3
	`

	rows, err := r.db.QueryContext(ctx, query, membershipID, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to list membership benefits with pagination: %v", err)
	}
	defer rows.Close()

	var benefits []*model.MembershipBenefit
	for rows.Next() {
		var benefit model.MembershipBenefit
		if err := rows.Scan(
			&benefit.ID,
			&benefit.MembershipID,
			&benefit.BenefitName,
			&benefit.BenefitDescription,
			&benefit.CreatedAt,
			&benefit.UpdatedAt,
		); err != nil {
			return nil, fmt.Errorf("failed to scan membership benefit: %v", err)
		}
		benefits = append(benefits, &benefit)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("rows error: %v", err)
	}

	return benefits, nil
}

// ListAllPaginated returns all benefits with pagination
func (r *BenefitRepo) ListAllPaginated(ctx context.Context, offset, limit int) ([]*model.MembershipBenefit, error) {
	query := `
		SELECT 
			benefit_id, membership_id, benefit_name, benefit_description, created_at, updated_at
		FROM membership_benefits
		ORDER BY created_at DESC
		LIMIT $1 OFFSET $2
	`

	rows, err := r.db.QueryContext(ctx, query, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to list all membership benefits with pagination: %v", err)
	}
	defer rows.Close()

	var benefits []*model.MembershipBenefit
	for rows.Next() {
		var benefit model.MembershipBenefit
		if err := rows.Scan(
			&benefit.ID,
			&benefit.MembershipID,
			&benefit.BenefitName,
			&benefit.BenefitDescription,
			&benefit.CreatedAt,
			&benefit.UpdatedAt,
		); err != nil {
			return nil, fmt.Errorf("failed to scan membership benefit: %v", err)
		}
		benefits = append(benefits, &benefit)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("rows error: %v", err)
	}

	return benefits, nil
}

// Count returns total number of benefits
func (r *BenefitRepo) Count(ctx context.Context) (int, error) {
	var count int
	query := `SELECT COUNT(*) FROM membership_benefits`

	err := r.db.QueryRowContext(ctx, query).Scan(&count)
	if err != nil {
		return 0, fmt.Errorf("failed to count benefits: %v", err)
	}

	return count, nil
}

// CountByMembership returns total number of benefits for a specific membership
func (r *BenefitRepo) CountByMembership(ctx context.Context, membershipID int64) (int, error) {
	var count int
	query := `SELECT COUNT(*) FROM membership_benefits WHERE membership_id = $1`

	err := r.db.QueryRowContext(ctx, query, membershipID).Scan(&count)
	if err != nil {
		return 0, fmt.Errorf("failed to count benefits by membership: %v", err)
	}

	return count, nil
}
