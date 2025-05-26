package postgres

import (
	"context"
	"fmt"
	"strings"

	"github.com/FurkanArikk/fitness-center/backend/payment-service/internal/model"
	"github.com/FurkanArikk/fitness-center/backend/payment-service/internal/repository"
	"github.com/jmoiron/sqlx"
)

type paymentTypeRepository struct {
	db *sqlx.DB
}

// NewPaymentTypeRepository creates a new payment type repository
func NewPaymentTypeRepository(db *sqlx.DB) repository.PaymentTypeRepository {
	return &paymentTypeRepository{db: db}
}

// Create adds a new payment type
func (r *paymentTypeRepository) Create(ctx context.Context, paymentType *model.PaymentType) (*model.PaymentType, error) {
	query := `
		INSERT INTO payment_types (
			type_name, description, is_active
		) VALUES (
			$1, $2, $3
		) RETURNING payment_type_id, created_at, updated_at
	`

	err := r.db.QueryRowContext(
		ctx,
		query,
		paymentType.TypeName,
		paymentType.Description,
		paymentType.IsActive,
	).Scan(
		&paymentType.PaymentTypeID,
		&paymentType.CreatedAt,
		&paymentType.UpdatedAt,
	)

	if err != nil {
		return nil, fmt.Errorf("creating payment type: %w", err)
	}

	return paymentType, nil
}

// GetByID retrieves payment type by ID
func (r *paymentTypeRepository) GetByID(ctx context.Context, id int) (*model.PaymentType, error) {
	paymentType := &model.PaymentType{}

	query := `SELECT * FROM payment_types WHERE payment_type_id = $1`

	if err := r.db.GetContext(ctx, paymentType, query, id); err != nil {
		return nil, fmt.Errorf("getting payment type by ID: %w", err)
	}

	return paymentType, nil
}

// GetByName retrieves payment type by name
func (r *paymentTypeRepository) GetByName(ctx context.Context, name string) (*model.PaymentType, error) {
	paymentType := &model.PaymentType{}

	query := `SELECT * FROM payment_types WHERE type_name = $1`

	if err := r.db.GetContext(ctx, paymentType, query, name); err != nil {
		return nil, fmt.Errorf("getting payment type by name: %w", err)
	}

	return paymentType, nil
}

// Update updates a payment type
func (r *paymentTypeRepository) Update(ctx context.Context, paymentType *model.PaymentType) (*model.PaymentType, error) {
	query := `
		UPDATE payment_types SET
			type_name = $1,
			description = $2,
			is_active = $3,
			updated_at = NOW()
		WHERE payment_type_id = $4
		RETURNING updated_at
	`

	err := r.db.QueryRowContext(
		ctx,
		query,
		paymentType.TypeName,
		paymentType.Description,
		paymentType.IsActive,
		paymentType.PaymentTypeID,
	).Scan(&paymentType.UpdatedAt)

	if err != nil {
		return nil, fmt.Errorf("updating payment type: %w", err)
	}

	return paymentType, nil
}

// Delete removes a payment type
func (r *paymentTypeRepository) Delete(ctx context.Context, id int) error {
	query := `DELETE FROM payment_types WHERE payment_type_id = $1`

	result, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return fmt.Errorf("deleting payment type: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("checking rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("payment type with ID %d not found", id)
	}

	return nil
}

// List retrieves payment types with filters
func (r *paymentTypeRepository) List(ctx context.Context, filter map[string]interface{}, page, pageSize int) ([]*model.PaymentType, int, error) {
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

	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM payment_types %s", whereClause)

	var total int
	if err := r.db.GetContext(ctx, &total, countQuery, args...); err != nil {
		return nil, 0, fmt.Errorf("counting payment types: %w", err)
	}

	offset := (page - 1) * pageSize
	args = append(args, pageSize, offset)

	query := fmt.Sprintf(`
		SELECT * FROM payment_types 
		%s
		ORDER BY type_name
		LIMIT $%d OFFSET $%d
	`, whereClause, argID, argID+1)

	var paymentTypes []*model.PaymentType
	if err := r.db.SelectContext(ctx, &paymentTypes, query, args...); err != nil {
		return nil, 0, fmt.Errorf("listing payment types: %w", err)
	}

	return paymentTypes, total, nil
}

// ToggleStatus activates or deactivates a payment type
func (r *paymentTypeRepository) ToggleStatus(ctx context.Context, id int, isActive bool) error {
	query := `
		UPDATE payment_types SET
			is_active = $1,
			updated_at = NOW()
		WHERE payment_type_id = $2
	`

	result, err := r.db.ExecContext(ctx, query, isActive, id)
	if err != nil {
		return fmt.Errorf("toggling payment type status: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("checking rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("payment type with ID %d not found", id)
	}

	return nil
}
