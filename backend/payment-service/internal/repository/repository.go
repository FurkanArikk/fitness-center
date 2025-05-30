package repository

import (
	"context"

	"github.com/FurkanArikk/fitness-center/backend/payment-service/internal/model"
)

// Repository defines all repository methods
type Repository interface {
	Payment() PaymentRepository
	PaymentType() PaymentTypeRepository
	Transaction() TransactionRepository
	Ping(ctx context.Context) error // Add Ping method to check database connectivity
	Close() error
}

// PaymentRepository defines operations for payment storage
type PaymentRepository interface {
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

// PaymentTypeRepository defines operations for payment type storage
type PaymentTypeRepository interface {
	Create(ctx context.Context, paymentType *model.PaymentType) (*model.PaymentType, error)
	GetByID(ctx context.Context, id int) (*model.PaymentType, error)
	Update(ctx context.Context, paymentType *model.PaymentType) (*model.PaymentType, error)
	Delete(ctx context.Context, id int) error
	List(ctx context.Context, filter map[string]interface{}, page, pageSize int) ([]*model.PaymentType, int, error)
	GetByName(ctx context.Context, name string) (*model.PaymentType, error)
	ToggleStatus(ctx context.Context, id int, isActive bool) error
}

// TransactionRepository defines operations for transaction storage
type TransactionRepository interface {
	Create(ctx context.Context, transaction *model.Transaction) (*model.Transaction, error)
	GetByID(ctx context.Context, id int) (*model.Transaction, error)
	Update(ctx context.Context, transaction *model.Transaction) (*model.Transaction, error)
	Delete(ctx context.Context, id int) error
	List(ctx context.Context, filter map[string]interface{}, page, pageSize int) ([]*model.Transaction, int, error)
	ListByPaymentID(ctx context.Context, paymentID int, page, pageSize int) ([]*model.Transaction, int, error)
	ListByStatus(ctx context.Context, status string, page, pageSize int) ([]*model.Transaction, int, error)
	ProcessPayment(ctx context.Context, paymentID int, status, reference, response string) (*model.Transaction, error)
}
