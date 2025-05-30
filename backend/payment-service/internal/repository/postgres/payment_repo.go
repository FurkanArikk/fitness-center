package postgres

import (
	"context"
	"fmt"
	"strings"

	"github.com/FurkanArikk/fitness-center/backend/payment-service/internal/model"
	"github.com/FurkanArikk/fitness-center/backend/payment-service/internal/repository"
	"github.com/jmoiron/sqlx"
)

type paymentRepository struct {
	db *sqlx.DB
}

// NewPaymentRepository creates a new payment repository
func NewPaymentRepository(db *sqlx.DB) repository.PaymentRepository {
	return &paymentRepository{
		db: db,
	}
}

// Create adds a new payment record
func (r *paymentRepository) Create(ctx context.Context, payment *model.Payment) (*model.Payment, error) {
	query := `
		INSERT INTO payments (
			member_id, amount, payment_date, payment_method, payment_status, 
			invoice_number, description, payment_type_id
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8
		) RETURNING payment_id, created_at, updated_at
	`

	// Create a new row to handle invoice_number separately
	row := r.db.QueryRowContext(
		ctx,
		query,
		payment.MemberID,
		payment.Amount,
		payment.PaymentDate,
		payment.PaymentMethod,
		payment.PaymentStatus,
		payment.InvoiceNumber, // This can now be NULL if it's nil
		payment.Description,   // This can now be NULL if it's nil
		payment.PaymentTypeID,
	)

	// Scan the returned columns
	err := row.Scan(
		&payment.PaymentID,
		&payment.CreatedAt,
		&payment.UpdatedAt,
	)

	if err != nil {
		return nil, fmt.Errorf("creating payment: %w", err)
	}

	// Get the complete payment record to ensure we have all fields
	return r.GetByID(ctx, payment.PaymentID)
}

// GetByID retrieves payment by ID with payment type name
func (r *paymentRepository) GetByID(ctx context.Context, id int) (*model.Payment, error) {
	payment := &model.Payment{}

	query := `
		SELECT p.*, pt.type_name AS payment_type_name 
		FROM payments p
		LEFT JOIN payment_types pt ON p.payment_type_id = pt.payment_type_id
		WHERE p.payment_id = $1
	`

	if err := r.db.GetContext(ctx, payment, query, id); err != nil {
		return nil, fmt.Errorf("getting payment by ID: %w", err)
	}

	return payment, nil
}

// Update updates a payment record
func (r *paymentRepository) Update(ctx context.Context, payment *model.Payment) (*model.Payment, error) {
	query := `
		UPDATE payments SET
			member_id = $1,
			amount = $2,
			payment_date = $3,
			payment_method = $4,
			payment_status = $5,
			invoice_number = $6,
			description = $7,
			payment_type_id = $8,
			updated_at = NOW()
		WHERE payment_id = $9
		RETURNING updated_at
	`

	err := r.db.QueryRowContext(
		ctx,
		query,
		payment.MemberID,
		payment.Amount,
		payment.PaymentDate,
		payment.PaymentMethod,
		payment.PaymentStatus,
		payment.InvoiceNumber,
		payment.Description,
		payment.PaymentTypeID,
		payment.PaymentID,
	).Scan(&payment.UpdatedAt)

	if err != nil {
		return nil, fmt.Errorf("updating payment: %w", err)
	}

	// Get the updated payment with all fields
	return r.GetByID(ctx, payment.PaymentID)
}

// Delete removes a payment record
func (r *paymentRepository) Delete(ctx context.Context, id int) error {
	query := `DELETE FROM payments WHERE payment_id = $1`

	result, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return fmt.Errorf("deleting payment: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("checking rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("payment with ID %d not found", id)
	}

	return nil
}

// List retrieves payments with filters
func (r *paymentRepository) List(ctx context.Context, filter map[string]interface{}, page, pageSize int) ([]*model.Payment, int, error) {
	where := []string{}
	args := []interface{}{}
	argID := 1

	for key, value := range filter {
		where = append(where, fmt.Sprintf("p.%s = $%d", key, argID))
		args = append(args, value)
		argID++
	}

	whereClause := ""
	if len(where) > 0 {
		whereClause = "WHERE " + strings.Join(where, " AND ")
	}

	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM payments p %s", whereClause)

	var total int
	if err := r.db.GetContext(ctx, &total, countQuery, args...); err != nil {
		return nil, 0, fmt.Errorf("counting payments: %w", err)
	}

	offset := (page - 1) * pageSize
	args = append(args, pageSize, offset)

	query := fmt.Sprintf(`
		SELECT p.*, pt.type_name AS payment_type_name 
		FROM payments p
		LEFT JOIN payment_types pt ON p.payment_type_id = pt.payment_type_id
		%s
		ORDER BY p.payment_date DESC
		LIMIT $%d OFFSET $%d
	`, whereClause, argID, argID+1)

	var payments []*model.Payment
	if err := r.db.SelectContext(ctx, &payments, query, args...); err != nil {
		return nil, 0, fmt.Errorf("listing payments: %w", err)
	}

	return payments, total, nil
}

// Other methods similar to List method - add JOIN with payment_types

// ListByMemberID retrieves payments by member ID
func (r *paymentRepository) ListByMemberID(ctx context.Context, memberID int, page, pageSize int) ([]*model.Payment, int, error) {
	return r.List(ctx, map[string]interface{}{"member_id": memberID}, page, pageSize)
}

// ListByStatus retrieves payments by status
func (r *paymentRepository) ListByStatus(ctx context.Context, status string, page, pageSize int) ([]*model.Payment, int, error) {
	return r.List(ctx, map[string]interface{}{"payment_status": status}, page, pageSize)
}

// ListByPaymentMethod retrieves payments by payment method
func (r *paymentRepository) ListByPaymentMethod(ctx context.Context, method string, page, pageSize int) ([]*model.Payment, int, error) {
	return r.List(ctx, map[string]interface{}{"payment_method": method}, page, pageSize)
}

// ListByPaymentType retrieves payments by payment type
func (r *paymentRepository) ListByPaymentType(ctx context.Context, typeID int, page, pageSize int) ([]*model.Payment, int, error) {
	return r.List(ctx, map[string]interface{}{"payment_type_id": typeID}, page, pageSize)
}

// GetStatistics retrieves payment statistics
func (r *paymentRepository) GetStatistics(ctx context.Context, filter map[string]interface{}) (*model.PaymentStatistics, error) {
	where := []string{}
	args := []interface{}{}
	argID := 1

	// Build WHERE clause based on filters
	for key, value := range filter {
		// Handle date range filters differently
		if key == "start_date" {
			where = append(where, fmt.Sprintf("payment_date >= $%d", argID))
			args = append(args, value)
			argID++
		} else if key == "end_date" {
			where = append(where, fmt.Sprintf("payment_date <= $%d", argID))
			args = append(args, value)
			argID++
		} else {
			where = append(where, fmt.Sprintf("%s = $%d", key, argID))
			args = append(args, value)
			argID++
		}
	}

	// Construct the where clause if filters exist
	whereClause := ""
	if len(where) > 0 {
		whereClause = "WHERE " + strings.Join(where, " AND ")
	}

	// Query for getting the basic statistics
	query := fmt.Sprintf(`
		SELECT 
			COUNT(*) as total_payments,
			COALESCE(SUM(amount), 0) as total_amount,
			CASE WHEN COUNT(*) > 0 THEN COALESCE(SUM(amount), 0) / COUNT(*) ELSE 0 END as average_amount,
			COUNT(CASE WHEN payment_status = 'pending' THEN 1 END) as pending_payments,
			COUNT(CASE WHEN payment_status = 'completed' THEN 1 END) as completed_payments,
			COUNT(CASE WHEN payment_status = 'failed' THEN 1 END) as failed_payments
		FROM payments
		%s
	`, whereClause)

	// Create a new PaymentStatistics struct to store the results
	stats := &model.PaymentStatistics{}

	// Execute the query and scan results into the stats struct
	err := r.db.QueryRowContext(ctx, query, args...).Scan(
		&stats.TotalPayments,
		&stats.TotalAmount,
		&stats.AverageAmount,
		&stats.PendingPayments,
		&stats.CompletedPayments,
		&stats.FailedPayments,
	)

	if err != nil {
		return nil, fmt.Errorf("getting payment statistics: %w", err)
	}

	// Query for payment method statistics
	methodQuery := fmt.Sprintf(`
		SELECT 
			payment_method,
			COUNT(*) as count,
			CASE WHEN (SELECT COUNT(*) FROM payments %s) > 0 
				THEN ROUND((COUNT(*) * 100.0) / (SELECT COUNT(*) FROM payments %s), 2)
				ELSE 0 
			END as percentage
		FROM payments
		%s
		GROUP BY payment_method
		ORDER BY count DESC
	`, whereClause, whereClause, whereClause)

	// Execute the payment method statistics query
	rows, err := r.db.QueryContext(ctx, methodQuery, append(args, args...)...)
	if err != nil {
		return nil, fmt.Errorf("getting payment method statistics: %w", err)
	}
	defer rows.Close()

	// Initialize the payment method statistics slice
	stats.PaymentMethodStatistics = make([]model.PaymentMethodStatistic, 0)

	// Scan the payment method statistics
	for rows.Next() {
		var methodStat model.PaymentMethodStatistic
		err := rows.Scan(
			&methodStat.PaymentMethod,
			&methodStat.Count,
			&methodStat.Percentage,
		)
		if err != nil {
			return nil, fmt.Errorf("scanning payment method statistics: %w", err)
		}
		stats.PaymentMethodStatistics = append(stats.PaymentMethodStatistics, methodStat)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("iterating payment method statistics: %w", err)
	}

	return stats, nil
}
