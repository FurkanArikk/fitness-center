package service

import (
	"github.com/FurkanArikk/fitness-center/backend/payment-service/internal/repository"
)

// Service combines all business services
type Service interface {
	Payment() PaymentService
	PaymentType() PaymentTypeService
	Transaction() TransactionService
}

// service implements Service interface
type service struct {
	paymentService     PaymentService
	paymentTypeService PaymentTypeService
	transactionService TransactionService
}

// New creates a new service
func New(repo repository.Repository) Service {
	return &service{
		paymentService:     NewPaymentService(repo),
		paymentTypeService: NewPaymentTypeService(repo),
		transactionService: NewTransactionService(repo),
	}
}

// Payment returns the payment service
func (s *service) Payment() PaymentService {
	return s.paymentService
}

// PaymentType returns the payment type service
func (s *service) PaymentType() PaymentTypeService {
	return s.paymentTypeService
}

// Transaction returns the transaction service
func (s *service) Transaction() TransactionService {
	return s.transactionService
}
