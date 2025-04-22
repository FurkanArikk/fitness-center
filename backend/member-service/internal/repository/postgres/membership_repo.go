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

var (
	ErrMembershipNotFound = errors.New("membership not found")
)

// MembershipRepo implements repository.MembershipRepository
type MembershipRepo struct {
	db *sql.DB
}

// NewMembershipRepository creates a new membership repository
func NewMembershipRepository(db *sql.DB) repository.MembershipRepository {
	return &MembershipRepo{
		db: db,
	}
}

// Create inserts a new membership into the database
func (r *MembershipRepo) Create(ctx context.Context, membership *model.Membership) error {
	query := `
		INSERT INTO memberships (membership_name, description, duration, price, is_active) 
		VALUES ($1, $2, $3, $4, $5)
		RETURNING membership_id, created_at, updated_at
	`

	return r.db.QueryRowContext(
		ctx,
		query,
		membership.MembershipName,
		membership.Description,
		membership.Duration,
		membership.Price,
		membership.IsActive,
	).Scan(
		&membership.ID,
		&membership.CreatedAt,
		&membership.UpdatedAt,
	)
}

// GetByID retrieves a membership by ID
func (r *MembershipRepo) GetByID(ctx context.Context, id int64) (*model.Membership, error) {
	query := `
		SELECT membership_id, membership_name, description, duration, price, is_active, created_at, updated_at
		FROM memberships
		WHERE membership_id = $1
	`

	var membership model.Membership
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&membership.ID,
		&membership.MembershipName,
		&membership.Description,
		&membership.Duration,
		&membership.Price,
		&membership.IsActive,
		&membership.CreatedAt,
		&membership.UpdatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, ErrMembershipNotFound
		}
		return nil, fmt.Errorf("error getting membership: %w", err)
	}

	return &membership, nil
}

// GetByName retrieves a membership by name
func (r *MembershipRepo) GetByName(ctx context.Context, name string) (*model.Membership, error) {
	query := `
		SELECT membership_id, membership_name, description, duration, price, is_active, created_at, updated_at
		FROM memberships
		WHERE membership_name = $1
	`

	var membership model.Membership
	err := r.db.QueryRowContext(ctx, query, name).Scan(
		&membership.ID,
		&membership.MembershipName,
		&membership.Description,
		&membership.Duration,
		&membership.Price,
		&membership.IsActive,
		&membership.CreatedAt,
		&membership.UpdatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("error getting membership by name: %w", err)
	}

	return &membership, nil
}

// Update updates an existing membership
func (r *MembershipRepo) Update(ctx context.Context, membership *model.Membership) error {
	query := `
		UPDATE memberships
		SET membership_name = $1, description = $2, duration = $3, price = $4, is_active = $5, updated_at = $6
		WHERE membership_id = $7
		RETURNING updated_at
	`

	now := time.Now()
	return r.db.QueryRowContext(
		ctx,
		query,
		membership.MembershipName,
		membership.Description,
		membership.Duration,
		membership.Price,
		membership.IsActive,
		now,
		membership.ID,
	).Scan(&membership.UpdatedAt)
}

// Delete removes a membership
func (r *MembershipRepo) Delete(ctx context.Context, id int64) error {
	query := "DELETE FROM memberships WHERE membership_id = $1"

	result, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return fmt.Errorf("error deleting membership: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("error checking rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return ErrMembershipNotFound
	}

	return nil
}

// List retrieves a paginated list of memberships
func (r *MembershipRepo) List(ctx context.Context, page, pageSize int) ([]*model.Membership, error) {
	offset := (page - 1) * pageSize

	query := `
		SELECT membership_id, membership_name, description, duration, price, is_active, created_at, updated_at
		FROM memberships
		ORDER BY membership_id
		LIMIT $1 OFFSET $2
	`

	rows, err := r.db.QueryContext(ctx, query, pageSize, offset)
	if err != nil {
		return nil, fmt.Errorf("error listing memberships: %w", err)
	}
	defer rows.Close()

	var memberships []*model.Membership
	for rows.Next() {
		var m model.Membership
		if err := rows.Scan(
			&m.ID,
			&m.MembershipName,
			&m.Description,
			&m.Duration,
			&m.Price,
			&m.IsActive,
			&m.CreatedAt,
			&m.UpdatedAt,
		); err != nil {
			return nil, fmt.Errorf("error scanning membership row: %w", err)
		}

		memberships = append(memberships, &m)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating membership rows: %w", err)
	}

	return memberships, nil
}

// GetActive retrieves all active memberships
func (r *MembershipRepo) GetActive(ctx context.Context) ([]*model.Membership, error) {
	query := `
		SELECT membership_id, membership_name, description, duration, price, is_active, created_at, updated_at
		FROM memberships
		WHERE is_active = true
		ORDER BY price ASC
	`

	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("error getting active memberships: %w", err)
	}
	defer rows.Close()

	var memberships []*model.Membership
	for rows.Next() {
		var m model.Membership
		if err := rows.Scan(
			&m.ID,
			&m.MembershipName,
			&m.Description,
			&m.Duration,
			&m.Price,
			&m.IsActive,
			&m.CreatedAt,
			&m.UpdatedAt,
		); err != nil {
			return nil, fmt.Errorf("error scanning active membership row: %w", err)
		}

		memberships = append(memberships, &m)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating active membership rows: %w", err)
	}

	return memberships, nil
}

// UpdateStatus updates the active status of a membership
func (r *MembershipRepo) UpdateStatus(ctx context.Context, id int64, isActive bool) error {
	query := `
		UPDATE memberships
		SET is_active = $1, updated_at = $2
		WHERE membership_id = $3
	`

	result, err := r.db.ExecContext(ctx, query, isActive, time.Now(), id)
	if err != nil {
		return fmt.Errorf("error updating membership status: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("error checking rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return ErrMembershipNotFound
	}

	return nil
}

// GetAll retrieves all memberships
func (r *MembershipRepo) GetAll(ctx context.Context) ([]*model.Membership, error) {
	query := `
		SELECT membership_id, membership_name, description, duration, price, is_active, created_at, updated_at
		FROM memberships
		ORDER BY membership_id
	`

	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("error getting all memberships: %w", err)
	}
	defer rows.Close()

	var memberships []*model.Membership
	for rows.Next() {
		var m model.Membership
		if err := rows.Scan(
			&m.ID,
			&m.MembershipName,
			&m.Description,
			&m.Duration,
			&m.Price,
			&m.IsActive,
			&m.CreatedAt,
			&m.UpdatedAt,
		); err != nil {
			return nil, fmt.Errorf("error scanning membership row: %w", err)
		}

		memberships = append(memberships, &m)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating membership rows: %w", err)
	}

	return memberships, nil
}

// IsMembershipInUse checks if a membership is used by any members
func (r *MembershipRepo) IsMembershipInUse(ctx context.Context, id int64) (bool, error) {
	query := `
		SELECT EXISTS (
			SELECT 1 FROM member_memberships
			WHERE membership_id = $1
		)
	`

	var inUse bool
	if err := r.db.QueryRowContext(ctx, query, id).Scan(&inUse); err != nil {
		return false, fmt.Errorf("error checking if membership is in use: %w", err)
	}

	return inUse, nil
}

// GetActiveOnes alias for GetActive to satisfy the interface
func (r *MembershipRepo) GetActiveOnes(ctx context.Context) ([]*model.Membership, error) {
	return r.GetActive(ctx)
}
