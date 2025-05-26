package postgres

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

	"github.com/FurkanArikk/fitness-center/backend/class-service/internal/model"
)

// ClassRepository implements model.ClassRepository interface
type ClassRepository struct {
	db *sql.DB
}

// NewClassRepository creates a new ClassRepository
func NewClassRepository(db *sql.DB) model.ClassRepository {
	return &ClassRepository{db: db}
}

// GetAll returns all classes, optionally filtered by active status
func (r *ClassRepository) GetAll(ctx context.Context, activeOnly bool) ([]model.Class, error) {
	query := "SELECT * FROM classes"
	if activeOnly {
		query += " WHERE is_active = true"
	}
	query += " ORDER BY class_name"

	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch classes: %w", err)
	}
	defer rows.Close()

	var classes []model.Class
	for rows.Next() {
		var class model.Class
		if err := rows.Scan(
			&class.ClassID, &class.ClassName, &class.Description,
			&class.Duration, &class.Capacity, &class.Difficulty,
			&class.IsActive, &class.CreatedAt, &class.UpdatedAt,
		); err != nil {
			return nil, fmt.Errorf("failed to scan class: %w", err)
		}
		classes = append(classes, class)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating classes rows: %w", err)
	}

	return classes, nil
}

// GetAllPaginated returns paginated classes with total count
func (r *ClassRepository) GetAllPaginated(ctx context.Context, activeOnly bool, offset, limit int) ([]model.Class, int, error) {
	// Query for total count
	countQuery := "SELECT COUNT(*) FROM classes"
	if activeOnly {
		countQuery += " WHERE is_active = true"
	}

	var total int
	err := r.db.QueryRowContext(ctx, countQuery).Scan(&total)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to count classes: %w", err)
	}

	// Query for paginated results
	dataQuery := "SELECT * FROM classes"
	if activeOnly {
		dataQuery += " WHERE is_active = true"
	}
	dataQuery += " ORDER BY class_name LIMIT $1 OFFSET $2"

	rows, err := r.db.QueryContext(ctx, dataQuery, limit, offset)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to fetch paginated classes: %w", err)
	}
	defer rows.Close()

	var classes []model.Class
	for rows.Next() {
		var class model.Class
		if err := rows.Scan(
			&class.ClassID, &class.ClassName, &class.Description,
			&class.Duration, &class.Capacity, &class.Difficulty,
			&class.IsActive, &class.CreatedAt, &class.UpdatedAt,
		); err != nil {
			return nil, 0, fmt.Errorf("failed to scan class: %w", err)
		}
		classes = append(classes, class)
	}

	if err := rows.Err(); err != nil {
		return nil, 0, fmt.Errorf("error iterating classes rows: %w", err)
	}

	return classes, total, nil
}

// GetByID returns a class by its ID
func (r *ClassRepository) GetByID(ctx context.Context, id int) (model.Class, error) {
	var class model.Class
	err := r.db.QueryRowContext(ctx, "SELECT * FROM classes WHERE class_id = $1", id).Scan(
		&class.ClassID, &class.ClassName, &class.Description,
		&class.Duration, &class.Capacity, &class.Difficulty,
		&class.IsActive, &class.CreatedAt, &class.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		return model.Class{}, errors.New("class not found")
	} else if err != nil {
		return model.Class{}, fmt.Errorf("failed to fetch class: %w", err)
	}

	return class, nil
}

// Create adds a new class
func (r *ClassRepository) Create(ctx context.Context, class model.Class) (model.Class, error) {
	query := `
		INSERT INTO classes (class_name, description, duration, capacity, difficulty, is_active)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING class_id, created_at, updated_at
	`

	err := r.db.QueryRowContext(
		ctx, query,
		class.ClassName, class.Description, class.Duration,
		class.Capacity, class.Difficulty, class.IsActive,
	).Scan(&class.ClassID, &class.CreatedAt, &class.UpdatedAt)

	if err != nil {
		return model.Class{}, fmt.Errorf("failed to create class: %w", err)
	}

	return class, nil
}

// Update modifies an existing class
func (r *ClassRepository) Update(ctx context.Context, id int, class model.Class) (model.Class, error) {
	query := `
		UPDATE classes
		SET class_name = $1, description = $2, duration = $3, 
			capacity = $4, difficulty = $5, is_active = $6, updated_at = NOW()
		WHERE class_id = $7
		RETURNING *
	`

	err := r.db.QueryRowContext(
		ctx, query,
		class.ClassName, class.Description, class.Duration,
		class.Capacity, class.Difficulty, class.IsActive, id,
	).Scan(
		&class.ClassID, &class.ClassName, &class.Description,
		&class.Duration, &class.Capacity, &class.Difficulty,
		&class.IsActive, &class.CreatedAt, &class.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		return model.Class{}, errors.New("class not found")
	} else if err != nil {
		return model.Class{}, fmt.Errorf("failed to update class: %w", err)
	}

	return class, nil
}

// Delete removes a class by its ID
func (r *ClassRepository) Delete(ctx context.Context, id int) error {
	result, err := r.db.ExecContext(ctx, "DELETE FROM classes WHERE class_id = $1", id)
	if err != nil {
		return fmt.Errorf("failed to delete class: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return errors.New("class not found")
	}

	return nil
}

// ExistsInSchedule checks if a class is used in any schedule
func (r *ClassRepository) ExistsInSchedule(ctx context.Context, id int) (bool, error) {
	var count int
	err := r.db.QueryRowContext(ctx, "SELECT COUNT(*) FROM class_schedule WHERE class_id = $1", id).Scan(&count)
	if err != nil {
		return false, fmt.Errorf("failed to check class dependencies: %w", err)
	}
	return count > 0, nil
}
