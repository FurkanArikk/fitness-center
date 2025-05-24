package postgres

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"time"

	"github.com/FurkanArikk/fitness-center/backend/member-service/internal/model"
)

// MemberRepository handles member database operations
type MemberRepository struct {
	db *sql.DB
}

// NewMemberRepository creates a new MemberRepository instance
func NewMemberRepository(db *sql.DB) *MemberRepository {
	return &MemberRepository{
		db: db,
	}
}

// Create adds a new member to the database
func (r *MemberRepository) Create(ctx context.Context, member *model.Member) error {
	query := `
		INSERT INTO members (
			first_name, last_name, email, phone, address, 
			date_of_birth, emergency_contact_name, emergency_contact_phone, 
			join_date, status, created_at, updated_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
		RETURNING member_id
	`

	now := time.Now()
	if member.JoinDate.IsZero() {
		member.JoinDate = model.NewDateOnly(now)
	}
	if member.Status == "" {
		member.Status = "active"
	}
	member.CreatedAt = now
	member.UpdatedAt = now

	err := r.db.QueryRowContext(
		ctx,
		query,
		member.FirstName,
		member.LastName,
		member.Email,
		member.Phone,
		member.Address,
		member.DateOfBirth,
		member.EmergencyContactName,
		member.EmergencyContactPhone,
		member.JoinDate,
		member.Status,
		member.CreatedAt,
		member.UpdatedAt,
	).Scan(&member.ID)

	if err != nil {
		return fmt.Errorf("failed to create member: %w", err)
	}

	return nil
}

// GetByID retrieves a member by their ID
func (r *MemberRepository) GetByID(ctx context.Context, id int64) (*model.Member, error) {
	query := `
		SELECT 
			member_id, first_name, last_name, email, phone, address,
			date_of_birth, emergency_contact_name, emergency_contact_phone,
			join_date, status, created_at, updated_at
		FROM members
		WHERE member_id = $1
	`

	var member model.Member
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&member.ID,
		&member.FirstName,
		&member.LastName,
		&member.Email,
		&member.Phone,
		&member.Address,
		&member.DateOfBirth,
		&member.EmergencyContactName,
		&member.EmergencyContactPhone,
		&member.JoinDate,
		&member.Status,
		&member.CreatedAt,
		&member.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, fmt.Errorf("member not found: %w", err)
		}
		return nil, fmt.Errorf("failed to get member: %w", err)
	}

	return &member, nil
}

// Update updates member information
func (r *MemberRepository) Update(ctx context.Context, member *model.Member) error {
	query := `
		UPDATE members
		SET 
			first_name = $1,
			last_name = $2,
			email = $3,
			phone = $4,
			address = $5,
			date_of_birth = $6,
			emergency_contact_name = $7,
			emergency_contact_phone = $8,
			status = $9,
			updated_at = $10
		WHERE member_id = $11
	`

	member.UpdatedAt = time.Now()

	result, err := r.db.ExecContext(
		ctx,
		query,
		member.FirstName,
		member.LastName,
		member.Email,
		member.Phone,
		member.Address,
		member.DateOfBirth,
		member.EmergencyContactName,
		member.EmergencyContactPhone,
		member.Status,
		member.UpdatedAt,
		member.ID,
	)

	if err != nil {
		return fmt.Errorf("failed to update member: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("member not found")
	}

	return nil
}

// Delete removes a member by their ID
func (r *MemberRepository) Delete(ctx context.Context, id int64) error {
	query := `DELETE FROM members WHERE member_id = $1`

	result, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return fmt.Errorf("failed to delete member: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("member not found")
	}

	return nil
}

// List retrieves a paginated list of members
func (r *MemberRepository) List(ctx context.Context, offset, limit int) ([]*model.Member, error) {
	query := `
		SELECT 
			member_id, first_name, last_name, email, phone, address,
			date_of_birth, emergency_contact_name, emergency_contact_phone,
			join_date, status, created_at, updated_at
		FROM members
		ORDER BY created_at DESC
		LIMIT $1 OFFSET $2
	`

	rows, err := r.db.QueryContext(ctx, query, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to list members: %w", err)
	}
	defer rows.Close()

	var members []*model.Member
	for rows.Next() {
		var member model.Member
		if err := rows.Scan(
			&member.ID,
			&member.FirstName,
			&member.LastName,
			&member.Email,
			&member.Phone,
			&member.Address,
			&member.DateOfBirth,
			&member.EmergencyContactName,
			&member.EmergencyContactPhone,
			&member.JoinDate,
			&member.Status,
			&member.CreatedAt,
			&member.UpdatedAt,
		); err != nil {
			return nil, fmt.Errorf("failed to scan member: %w", err)
		}
		members = append(members, &member)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("rows error: %w", err)
	}

	return members, nil
}

// GetByEmail retrieves a member by their email address
func (r *MemberRepository) GetByEmail(ctx context.Context, email string) (*model.Member, error) {
	query := `
		SELECT 
			member_id, first_name, last_name, email, phone, address,
			date_of_birth, emergency_contact_name, emergency_contact_phone,
			join_date, status, created_at, updated_at
		FROM members
		WHERE email = $1
	`

	var member model.Member
	err := r.db.QueryRowContext(ctx, query, email).Scan(
		&member.ID,
		&member.FirstName,
		&member.LastName,
		&member.Email,
		&member.Phone,
		&member.Address,
		&member.DateOfBirth,
		&member.EmergencyContactName,
		&member.EmergencyContactPhone,
		&member.JoinDate,
		&member.Status,
		&member.CreatedAt,
		&member.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil // No member found with this email is not an error
		}
		return nil, fmt.Errorf("failed to get member by email: %w", err)
	}

	return &member, nil
}

// Count returns the total number of members
func (r *MemberRepository) Count(ctx context.Context) (int, error) {
	query := `SELECT COUNT(*) FROM members`

	var count int
	err := r.db.QueryRowContext(ctx, query).Scan(&count)
	if err != nil {
		return 0, fmt.Errorf("failed to count members: %w", err)
	}

	return count, nil
}
