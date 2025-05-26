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

// MemberMembershipRepo handles member-membership relationship database operations
type MemberMembershipRepo struct {
	db *sql.DB
}

// NewMemberMembershipRepo creates a new MemberMembershipRepo instance
func NewMemberMembershipRepo(db *sql.DB) repository.MemberMembershipRepository {
	return &MemberMembershipRepo{
		db: db,
	}
}

// Create adds a new member-membership relationship to the database
func (r *MemberMembershipRepo) Create(ctx context.Context, memberMembership *model.MemberMembership) error {
	query := `
		INSERT INTO member_memberships (
			member_id, membership_id, start_date, end_date, payment_status, contract_signed, created_at, updated_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING member_membership_id
	`

	now := time.Now()
	memberMembership.CreatedAt = now
	memberMembership.UpdatedAt = now

	err := r.db.QueryRowContext(
		ctx,
		query,
		memberMembership.MemberID,
		memberMembership.MembershipID,
		memberMembership.StartDate,
		memberMembership.EndDate,
		memberMembership.PaymentStatus,
		memberMembership.ContractSigned,
		memberMembership.CreatedAt,
		memberMembership.UpdatedAt,
	).Scan(&memberMembership.ID)

	if err != nil {
		return fmt.Errorf("failed to create member membership: %v", err)
	}

	return nil
}

// GetByID retrieves a member-membership relationship by its ID
func (r *MemberMembershipRepo) GetByID(ctx context.Context, id int64) (*model.MemberMembership, error) {
	query := `
		SELECT 
			member_membership_id, member_id, membership_id, start_date, end_date, payment_status, contract_signed, created_at, updated_at
		FROM member_memberships
		WHERE member_membership_id = $1
	`

	var memberMembership model.MemberMembership
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&memberMembership.ID,
		&memberMembership.MemberID,
		&memberMembership.MembershipID,
		&memberMembership.StartDate,
		&memberMembership.EndDate,
		&memberMembership.PaymentStatus,
		&memberMembership.ContractSigned,
		&memberMembership.CreatedAt,
		&memberMembership.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, fmt.Errorf("member membership not found: %v", err)
		}
		return nil, fmt.Errorf("failed to get member membership: %v", err)
	}

	return &memberMembership, nil
}

// Update updates a member-membership relationship information
func (r *MemberMembershipRepo) Update(ctx context.Context, memberMembership *model.MemberMembership) error {
	query := `
		UPDATE member_memberships
		SET 
			member_id = $1,
			membership_id = $2,
			start_date = $3,
			end_date = $4,
			payment_status = $5,
			contract_signed = $6,
			updated_at = $7
		WHERE member_membership_id = $8
	`

	memberMembership.UpdatedAt = time.Now()

	result, err := r.db.ExecContext(
		ctx,
		query,
		memberMembership.MemberID,
		memberMembership.MembershipID,
		memberMembership.StartDate,
		memberMembership.EndDate,
		memberMembership.PaymentStatus,
		memberMembership.ContractSigned,
		memberMembership.UpdatedAt,
		memberMembership.ID,
	)

	if err != nil {
		return fmt.Errorf("failed to update member membership: %v", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %v", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("member membership not found")
	}

	return nil
}

// Delete removes a member-membership relationship by its ID
func (r *MemberMembershipRepo) Delete(ctx context.Context, id int64) error {
	query := `DELETE FROM member_memberships WHERE member_membership_id = $1`

	result, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return fmt.Errorf("failed to delete member membership: %v", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %v", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("member membership not found")
	}

	return nil
}

// ListByMemberID retrieves all membership relationships for a specific member
func (r *MemberMembershipRepo) ListByMemberID(ctx context.Context, memberID int64) ([]*model.MemberMembership, error) {
	query := `
		SELECT 
			member_membership_id, member_id, membership_id, start_date, end_date, payment_status, contract_signed, created_at, updated_at
		FROM member_memberships
		WHERE member_id = $1
		ORDER BY start_date DESC
	`

	rows, err := r.db.QueryContext(ctx, query, memberID)
	if err != nil {
		return nil, fmt.Errorf("failed to list member memberships: %v", err)
	}
	defer rows.Close()

	var memberMemberships []*model.MemberMembership
	for rows.Next() {
		var memberMembership model.MemberMembership
		if err := rows.Scan(
			&memberMembership.ID,
			&memberMembership.MemberID,
			&memberMembership.MembershipID,
			&memberMembership.StartDate,
			&memberMembership.EndDate,
			&memberMembership.PaymentStatus,
			&memberMembership.ContractSigned,
			&memberMembership.CreatedAt,
			&memberMembership.UpdatedAt,
		); err != nil {
			return nil, fmt.Errorf("failed to scan member membership: %v", err)
		}
		memberMemberships = append(memberMemberships, &memberMembership)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("rows error: %v", err)
	}

	return memberMemberships, nil
}

// GetActiveMembership retrieves the current active membership for a member
func (r *MemberMembershipRepo) GetActiveMembership(ctx context.Context, memberID int64) (*model.MemberMembership, error) {
	query := `
		SELECT 
			member_membership_id, member_id, membership_id, start_date, end_date, payment_status, contract_signed, created_at, updated_at
		FROM member_memberships
		WHERE member_id = $1 AND end_date >= $2
		ORDER BY end_date DESC
		LIMIT 1
	`

	var memberMembership model.MemberMembership
	err := r.db.QueryRowContext(ctx, query, memberID, time.Now()).Scan(
		&memberMembership.ID,
		&memberMembership.MemberID,
		&memberMembership.MembershipID,
		&memberMembership.StartDate,
		&memberMembership.EndDate,
		&memberMembership.PaymentStatus,
		&memberMembership.ContractSigned,
		&memberMembership.CreatedAt,
		&memberMembership.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, fmt.Errorf("active membership not found: %v", err)
		}
		return nil, fmt.Errorf("failed to get active membership: %v", err)
	}

	return &memberMembership, nil
}

// GetByMemberID is an alias for ListByMemberID to satisfy the interface
func (r *MemberMembershipRepo) GetByMemberID(ctx context.Context, memberID int64) ([]*model.MemberMembership, error) {
	return r.ListByMemberID(ctx, memberID)
}
