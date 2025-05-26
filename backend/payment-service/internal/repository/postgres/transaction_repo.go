package postgres

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/FurkanArikk/fitness-center/backend/payment-service/internal/model"
	"github.com/FurkanArikk/fitness-center/backend/payment-service/internal/repository"
	"github.com/jmoiron/sqlx"
)

type transactionRepository struct {
	db *sqlx.DB
}

// NewTransactionRepository creates a new transaction repository
func NewTransactionRepository(db *sqlx.DB) repository.TransactionRepository {
	return &transactionRepository{db: db}
}

// Create adds a new transaction record
func (r *transactionRepository) Create(ctx context.Context, transaction *model.Transaction) (*model.Transaction, error) {
	query := `
		INSERT INTO payment_transactions (
			payment_id, transaction_date, transaction_status, 
			transaction_reference, gateway_response
		) VALUES (
			$1, $2, $3, $4, $5
		) RETURNING transaction_id, created_at, updated_at
	`

	err := r.db.QueryRowContext(
		ctx,
		query,
		transaction.PaymentID,
		transaction.TransactionDate,
		transaction.TransactionStatus,
		transaction.TransactionReference,
		transaction.GatewayResponse,
	).Scan(
		&transaction.TransactionID,
		&transaction.CreatedAt,
		&transaction.UpdatedAt,
	)

	if err != nil {
		return nil, fmt.Errorf("creating transaction: %w", err)
	}

	return transaction, nil
}

// GetByID retrieves transaction by ID
func (r *transactionRepository) GetByID(ctx context.Context, id int) (*model.Transaction, error) {
	transaction := &model.Transaction{}

	query := `SELECT * FROM payment_transactions WHERE transaction_id = $1`

	if err := r.db.GetContext(ctx, transaction, query, id); err != nil {
		return nil, fmt.Errorf("getting transaction by ID: %w", err)
	}

	return transaction, nil
}

// Update updates a transaction record
func (r *transactionRepository) Update(ctx context.Context, transaction *model.Transaction) (*model.Transaction, error) {
	query := `
		UPDATE payment_transactions SET
			payment_id = $1,
			transaction_date = $2,
			transaction_status = $3,
			transaction_reference = $4,
			gateway_response = $5,
			updated_at = NOW()
		WHERE transaction_id = $6
		RETURNING updated_at
	`

	err := r.db.QueryRowContext(
		ctx,
		query,
		transaction.PaymentID,
		transaction.TransactionDate,
		transaction.TransactionStatus,
		transaction.TransactionReference,
		transaction.GatewayResponse,
		transaction.TransactionID,
	).Scan(&transaction.UpdatedAt)

	if err != nil {
		return nil, fmt.Errorf("updating transaction: %w", err)
	}

	return transaction, nil
}

// Delete removes a transaction record
func (r *transactionRepository) Delete(ctx context.Context, id int) error {
	query := `DELETE FROM payment_transactions WHERE transaction_id = $1`

	result, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return fmt.Errorf("deleting transaction: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("checking rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("transaction with ID %d not found", id)
	}

	return nil
}

// List retrieves transactions with filters
func (r *transactionRepository) List(ctx context.Context, filter map[string]interface{}, page, pageSize int) ([]*model.Transaction, int, error) {
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

	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM payment_transactions %s", whereClause)

	var total int
	if err := r.db.GetContext(ctx, &total, countQuery, args...); err != nil {
		return nil, 0, fmt.Errorf("counting transactions: %w", err)
	}

	offset := (page - 1) * pageSize
	args = append(args, pageSize, offset)

	query := fmt.Sprintf(`
		SELECT * FROM payment_transactions 
		%s
		ORDER BY transaction_date DESC
		LIMIT $%d OFFSET $%d
	`, whereClause, argID, argID+1)

	var transactions []*model.Transaction
	if err := r.db.SelectContext(ctx, &transactions, query, args...); err != nil {
		return nil, 0, fmt.Errorf("listing transactions: %w", err)
	}

	return transactions, total, nil
}

// ListByPaymentID retrieves transactions by payment ID
func (r *transactionRepository) ListByPaymentID(ctx context.Context, paymentID int, page, pageSize int) ([]*model.Transaction, int, error) {
	return r.List(ctx, map[string]interface{}{"payment_id": paymentID}, page, pageSize)
}

// ListByStatus retrieves transactions by status
func (r *transactionRepository) ListByStatus(ctx context.Context, status string, page, pageSize int) ([]*model.Transaction, int, error) {
	return r.List(ctx, map[string]interface{}{"transaction_status": status}, page, pageSize)
}

// ProcessPayment processes a payment and creates a transaction record
func (r *transactionRepository) ProcessPayment(ctx context.Context, paymentID int, status, reference, response string) (*model.Transaction, error) {
	// Begin transaction
	tx, err := r.db.BeginTxx(ctx, nil)
	if err != nil {
		return nil, fmt.Errorf("beginning transaction: %w", err)
	}

	// Create a new transaction record
	transaction := &model.Transaction{
		PaymentID:            paymentID,
		TransactionDate:      time.Now(),
		TransactionStatus:    status,
		TransactionReference: reference,
		GatewayResponse:      response,
	}

	// Insert the transaction
	query := `
		INSERT INTO payment_transactions (
			payment_id, transaction_date, transaction_status, 
			transaction_reference, gateway_response
		) VALUES (
			$1, $2, $3, $4, $5
		) RETURNING transaction_id, created_at, updated_at
	`

	err = tx.QueryRowxContext(
		ctx,
		query,
		transaction.PaymentID,
		transaction.TransactionDate,
		transaction.TransactionStatus,
		transaction.TransactionReference,
		transaction.GatewayResponse,
	).Scan(
		&transaction.TransactionID,
		&transaction.CreatedAt,
		&transaction.UpdatedAt,
	)

	if err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("creating transaction: %w", err)
	}

	// Update payment status based on transaction status
	updatePaymentQuery := `
		UPDATE payments SET
			payment_status = $1,
			updated_at = NOW()
		WHERE payment_id = $2
	`

	// Map transaction status to payment status
	paymentStatus := "pending"
	if status == "success" || status == "completed" {
		paymentStatus = "completed"
	} else if status == "failed" || status == "declined" {
		paymentStatus = "failed"
	}

	_, err = tx.ExecContext(ctx, updatePaymentQuery, paymentStatus, paymentID)
	if err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("updating payment status: %w", err)
	}

	// Commit the transaction
	if err = tx.Commit(); err != nil {
		return nil, fmt.Errorf("committing transaction: %w", err)
	}

	return transaction, nil
}
