package service

import (
	"context"
	"time"

	"github.com/FurkanArikk/fitness-center/backend/payment-service/internal/model"
	"github.com/FurkanArikk/fitness-center/backend/payment-service/internal/repository"
)

// TransactionService defines business operations for payment transactions
type TransactionService interface {
	Create(ctx context.Context, transaction *model.Transaction) (*model.Transaction, error)
	GetByID(ctx context.Context, id int) (*model.Transaction, error)
	Update(ctx context.Context, transaction *model.Transaction) (*model.Transaction, error)
	Delete(ctx context.Context, id int) error
	List(ctx context.Context, filter map[string]interface{}, page, pageSize int) ([]*model.Transaction, int, error)
	ListByPaymentID(ctx context.Context, paymentID int, page, pageSize int) ([]*model.Transaction, int, error)
	ListByStatus(ctx context.Context, status string, page, pageSize int) ([]*model.Transaction, int, error)
	ProcessPayment(ctx context.Context, paymentID int, status string, reference string, response string) (*model.Transaction, error)
}

// transactionService implements TransactionService
type transactionService struct {
	repo repository.Repository
}

// NewTransactionService creates a new transaction service
func NewTransactionService(repo repository.Repository) TransactionService {
	return &transactionService{
		repo: repo,
	}
}

// Create adds a new transaction
func (s *transactionService) Create(ctx context.Context, transaction *model.Transaction) (*model.Transaction, error) {
	// Set transaction date to now if not provided
	if transaction.TransactionDate.IsZero() {
		transaction.TransactionDate = time.Now()
	}

	return s.repo.Transaction().Create(ctx, transaction)
}

// GetByID retrieves a transaction by ID
func (s *transactionService) GetByID(ctx context.Context, id int) (*model.Transaction, error) {
	return s.repo.Transaction().GetByID(ctx, id)
}

// Update updates an existing transaction
func (s *transactionService) Update(ctx context.Context, transaction *model.Transaction) (*model.Transaction, error) {
	return s.repo.Transaction().Update(ctx, transaction)
}

// Delete removes a transaction
func (s *transactionService) Delete(ctx context.Context, id int) error {
	return s.repo.Transaction().Delete(ctx, id)
}

// List retrieves transactions with filters
func (s *transactionService) List(ctx context.Context, filter map[string]interface{}, page, pageSize int) ([]*model.Transaction, int, error) {
	return s.repo.Transaction().List(ctx, filter, page, pageSize)
}

// ListByPaymentID retrieves transactions by payment ID
func (s *transactionService) ListByPaymentID(ctx context.Context, paymentID int, page, pageSize int) ([]*model.Transaction, int, error) {
	return s.repo.Transaction().ListByPaymentID(ctx, paymentID, page, pageSize)
}

// ListByStatus retrieves transactions by status
func (s *transactionService) ListByStatus(ctx context.Context, status string, page, pageSize int) ([]*model.Transaction, int, error) {
	return s.repo.Transaction().ListByStatus(ctx, status, page, pageSize)
}

// ProcessPayment creates a transaction for a payment with provided details
func (s *transactionService) ProcessPayment(ctx context.Context, paymentID int, status string, reference string, response string) (*model.Transaction, error) {
	// Create the transaction record
	transaction := &model.Transaction{
		PaymentID:            paymentID,
		TransactionDate:      time.Now(),
		TransactionStatus:    status,
		TransactionReference: reference,
		GatewayResponse:      response,
	}

	createdTransaction, err := s.repo.Transaction().Create(ctx, transaction)
	if err != nil {
		return nil, err
	}

	// Update payment status based on transaction status
	payment, err := s.repo.Payment().GetByID(ctx, paymentID)
	if err != nil {
		return nil, err
	}

	// Map transaction status to payment status
	if status == "success" || status == "completed" {
		payment.PaymentStatus = "completed"
	} else if status == "failed" || status == "declined" {
		payment.PaymentStatus = "failed"
	} else {
		payment.PaymentStatus = "pending"
	}

	_, err = s.repo.Payment().Update(ctx, payment)
	if err != nil {
		return nil, err
	}

	return createdTransaction, nil
}
