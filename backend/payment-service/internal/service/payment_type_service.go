package service

import (
	"context"

	"github.com/FurkanArikk/fitness-center/backend/payment-service/internal/model"
	"github.com/FurkanArikk/fitness-center/backend/payment-service/internal/repository"
)

// PaymentTypeService defines business operations for payment types
type PaymentTypeService interface {
	Create(ctx context.Context, paymentType *model.PaymentType) (*model.PaymentType, error)
	GetByID(ctx context.Context, id int) (*model.PaymentType, error)
	Update(ctx context.Context, paymentType *model.PaymentType) (*model.PaymentType, error)
	Delete(ctx context.Context, id int) error
	List(ctx context.Context, filter map[string]interface{}, page, pageSize int) ([]*model.PaymentType, int, error)
	GetByName(ctx context.Context, name string) (*model.PaymentType, error)
	ToggleStatus(ctx context.Context, id int, isActive bool) error
}

// paymentTypeService implements PaymentTypeService
type paymentTypeService struct {
	repo repository.Repository
}

// NewPaymentTypeService creates a new payment type service
func NewPaymentTypeService(repo repository.Repository) PaymentTypeService {
	return &paymentTypeService{
		repo: repo,
	}
}

// Create adds a new payment type
func (s *paymentTypeService) Create(ctx context.Context, paymentType *model.PaymentType) (*model.PaymentType, error) {
	return s.repo.PaymentType().Create(ctx, paymentType)
}

// GetByID retrieves a payment type by ID
func (s *paymentTypeService) GetByID(ctx context.Context, id int) (*model.PaymentType, error) {
	return s.repo.PaymentType().GetByID(ctx, id)
}

// Update updates an existing payment type
func (s *paymentTypeService) Update(ctx context.Context, paymentType *model.PaymentType) (*model.PaymentType, error) {
	return s.repo.PaymentType().Update(ctx, paymentType)
}

// Delete removes a payment type
func (s *paymentTypeService) Delete(ctx context.Context, id int) error {
	return s.repo.PaymentType().Delete(ctx, id)
}

// List retrieves payment types with filters
func (s *paymentTypeService) List(ctx context.Context, filter map[string]interface{}, page, pageSize int) ([]*model.PaymentType, int, error) {
	return s.repo.PaymentType().List(ctx, filter, page, pageSize)
}

// GetByName retrieves a payment type by name
func (s *paymentTypeService) GetByName(ctx context.Context, name string) (*model.PaymentType, error) {
	return s.repo.PaymentType().GetByName(ctx, name)
}

// ToggleStatus activates or deactivates a payment type
func (s *paymentTypeService) ToggleStatus(ctx context.Context, id int, isActive bool) error {
	return s.repo.PaymentType().ToggleStatus(ctx, id, isActive)
}
