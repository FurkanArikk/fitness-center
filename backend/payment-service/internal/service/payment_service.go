package service

import (
	"context"

	"github.com/furkan/fitness-center/backend/payment-service/internal/model"
	"github.com/furkan/fitness-center/backend/payment-service/internal/repository"
)

// PaymentService defines business operations for payments
type PaymentService interface {
	Create(ctx context.Context, payment *model.Payment) (*model.Payment, error)
	GetByID(ctx context.Context, id int) (*model.Payment, error)
	Update(ctx context.Context, payment *model.Payment) (*model.Payment, error)
	Delete(ctx context.Context, id int) error
	List(ctx context.Context, filter map[string]interface{}, page, pageSize int) ([]*model.Payment, int, error)
	ListByMemberID(ctx context.Context, memberID int, page, pageSize int) ([]*model.Payment, int, error)
	ListByStatus(ctx context.Context, status string, page, pageSize int) ([]*model.Payment, int, error)
	ListByPaymentMethod(ctx context.Context, method string, page, pageSize int) ([]*model.Payment, int, error)
	ListByPaymentType(ctx context.Context, typeID int, page, pageSize int) ([]*model.Payment, int, error)
	GetStatistics(ctx context.Context, filter map[string]interface{}) (*model.PaymentStatistics, error)
}

// paymentService implements PaymentService
type paymentService struct {
	repo repository.Repository
}

// NewPaymentService creates a new payment service
func NewPaymentService(repo repository.Repository) PaymentService {
	return &paymentService{
		repo: repo,
	}
}

// Create adds a new payment
func (s *paymentService) Create(ctx context.Context, payment *model.Payment) (*model.Payment, error) {
	// Business logic can be added here
	return s.repo.Payment().Create(ctx, payment)
}

// GetByID retrieves a payment by ID
func (s *paymentService) GetByID(ctx context.Context, id int) (*model.Payment, error) {
	return s.repo.Payment().GetByID(ctx, id)
}

// Update updates an existing payment
func (s *paymentService) Update(ctx context.Context, payment *model.Payment) (*model.Payment, error) {
	return s.repo.Payment().Update(ctx, payment)
}

// Delete removes a payment
func (s *paymentService) Delete(ctx context.Context, id int) error {
	return s.repo.Payment().Delete(ctx, id)
}

// List retrieves payments with filters
func (s *paymentService) List(ctx context.Context, filter map[string]interface{}, page, pageSize int) ([]*model.Payment, int, error) {
	return s.repo.Payment().List(ctx, filter, page, pageSize)
}

// ListByMemberID retrieves payments by member ID
func (s *paymentService) ListByMemberID(ctx context.Context, memberID int, page, pageSize int) ([]*model.Payment, int, error) {
	return s.repo.Payment().ListByMemberID(ctx, memberID, page, pageSize)
}

// ListByStatus retrieves payments by status
func (s *paymentService) ListByStatus(ctx context.Context, status string, page, pageSize int) ([]*model.Payment, int, error) {
	return s.repo.Payment().ListByStatus(ctx, status, page, pageSize)
}

// ListByPaymentMethod retrieves payments by payment method
func (s *paymentService) ListByPaymentMethod(ctx context.Context, method string, page, pageSize int) ([]*model.Payment, int, error) {
	return s.repo.Payment().ListByPaymentMethod(ctx, method, page, pageSize)
}

// ListByPaymentType retrieves payments by payment type ID
func (s *paymentService) ListByPaymentType(ctx context.Context, typeID int, page, pageSize int) ([]*model.Payment, int, error) {
	return s.repo.Payment().ListByPaymentType(ctx, typeID, page, pageSize)
}

// GetStatistics retrieves payment statistics
func (s *paymentService) GetStatistics(ctx context.Context, filter map[string]interface{}) (*model.PaymentStatistics, error) {
	return s.repo.Payment().GetStatistics(ctx, filter)
}
