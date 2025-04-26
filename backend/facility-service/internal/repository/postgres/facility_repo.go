package postgres

import (
	"context"
	"fmt"
	"strings"

	"github.com/furkan/fitness-center/backend/facility-service/internal/model"
	"github.com/furkan/fitness-center/backend/facility-service/internal/repository"
	"github.com/jmoiron/sqlx"
)

type facilityRepository struct {
	db *sqlx.DB
}

// NewFacilityRepository creates a new facility repository
func NewFacilityRepository(db *sqlx.DB) repository.FacilityRepository {
	return &facilityRepository{db: db}
}

// Create adds a new facility record
func (r *facilityRepository) Create(ctx context.Context, facility *model.Facility) (*model.Facility, error) {
	query := `
		INSERT INTO facilities (
			name, description, capacity, status, opening_hour, closing_hour
		) VALUES (
			$1, $2, $3, $4, $5, $6
		) RETURNING facility_id, created_at, updated_at
	`

	err := r.db.QueryRowContext(
		ctx,
		query,
		facility.Name,
		facility.Description,
		facility.Capacity,
		facility.Status,
		facility.OpeningHour,
		facility.ClosingHour,
	).Scan(
		&facility.FacilityID,
		&facility.CreatedAt,
		&facility.UpdatedAt,
	)

	if err != nil {
		return nil, fmt.Errorf("creating facility: %w", err)
	}

	return facility, nil
}

// GetByID retrieves facility by ID
func (r *facilityRepository) GetByID(ctx context.Context, id int) (*model.Facility, error) {
	facility := &model.Facility{}

	query := `SELECT * FROM facilities WHERE facility_id = $1`

	if err := r.db.GetContext(ctx, facility, query, id); err != nil {
		return nil, fmt.Errorf("getting facility by ID: %w", err)
	}

	return facility, nil
}

// GetByName retrieves facility by name
func (r *facilityRepository) GetByName(ctx context.Context, name string) (*model.Facility, error) {
	facility := &model.Facility{}

	query := `SELECT * FROM facilities WHERE name = $1`

	if err := r.db.GetContext(ctx, facility, query, name); err != nil {
		return nil, fmt.Errorf("getting facility by name: %w", err)
	}

	return facility, nil
}

// Update updates a facility record
func (r *facilityRepository) Update(ctx context.Context, facility *model.Facility) (*model.Facility, error) {
	query := `
		UPDATE facilities SET
			name = $1,
			description = $2,
			capacity = $3,
			status = $4,
			opening_hour = $5,
			closing_hour = $6,
			updated_at = NOW()
		WHERE facility_id = $7
		RETURNING updated_at
	`

	err := r.db.QueryRowContext(
		ctx,
		query,
		facility.Name,
		facility.Description,
		facility.Capacity,
		facility.Status,
		facility.OpeningHour,
		facility.ClosingHour,
		facility.FacilityID,
	).Scan(&facility.UpdatedAt)

	if err != nil {
		return nil, fmt.Errorf("updating facility: %w", err)
	}

	return facility, nil
}

// Delete removes a facility record
func (r *facilityRepository) Delete(ctx context.Context, id int) error {
	query := `DELETE FROM facilities WHERE facility_id = $1`

	result, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return fmt.Errorf("deleting facility: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("checking rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("facility with ID %d not found", id)
	}

	return nil
}

// List retrieves facilities with filters
func (r *facilityRepository) List(ctx context.Context, filter map[string]interface{}, page, pageSize int) ([]*model.Facility, int, error) {
	where := []string{}
	args := []interface{}{}
	argID := 1

	for key, value := range filter {
		where = append(where, fmt.Sprintf("%s = $%d", key, argID))
		args = append(args, value)
		argID++
	}

	whereClause := ""
	if len(where) > 0 {
		whereClause = "WHERE " + strings.Join(where, " AND ")
	}

	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM facilities %s", whereClause)

	var total int
	if err := r.db.GetContext(ctx, &total, countQuery, args...); err != nil {
		return nil, 0, fmt.Errorf("counting facilities: %w", err)
	}

	offset := (page - 1) * pageSize
	args = append(args, pageSize, offset)

	query := fmt.Sprintf(`
		SELECT * FROM facilities 
		%s
		ORDER BY facility_id
		LIMIT $%d OFFSET $%d
	`, whereClause, argID, argID+1)

	var facilities []*model.Facility
	if err := r.db.SelectContext(ctx, &facilities, query, args...); err != nil {
		return nil, 0, fmt.Errorf("listing facilities: %w", err)
	}

	return facilities, total, nil
}

// ListByStatus retrieves facilities by status
func (r *facilityRepository) ListByStatus(ctx context.Context, status string, page, pageSize int) ([]*model.Facility, int, error) {
	return r.List(ctx, map[string]interface{}{"status": status}, page, pageSize)
}
