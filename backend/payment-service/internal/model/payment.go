package model

import (
	"context"
	"time"
)

// Payment represents a payment record
type Payment struct {
	PaymentID       int       `json:"payment_id" db:"payment_id" gorm:"column:payment_id;primaryKey;autoIncrement"`
	MemberID        int       `json:"member_id" db:"member_id" gorm:"column:member_id;not null" binding:"required"`
	Amount          float64   `json:"amount" db:"amount" gorm:"column:amount;type:decimal(10,2);not null" binding:"required"`
	PaymentDate     time.Time `json:"payment_date" db:"payment_date" gorm:"column:payment_date;type:timestamptz;not null"`
	PaymentMethod   string    `json:"payment_method" db:"payment_method" gorm:"column:payment_method;type:varchar(50);not null" binding:"required"`
	PaymentStatus   string    `json:"payment_status" db:"payment_status" gorm:"column:payment_status;type:varchar(20);not null" binding:"required"`
	InvoiceNumber   *string   `json:"invoice_number" db:"invoice_number" gorm:"column:invoice_number;type:varchar(50)"`
	Description     *string   `json:"description" db:"description" gorm:"column:description;type:text"`
	PaymentTypeID   *int      `json:"payment_type_id" db:"payment_type_id" gorm:"column:payment_type_id"`
	PaymentTypeName *string   `json:"payment_type_name,omitempty" db:"payment_type_name" gorm:"-"`
	CreatedAt       time.Time `json:"created_at" db:"created_at" gorm:"column:created_at;autoCreateTime"`
	UpdatedAt       time.Time `json:"updated_at" db:"updated_at" gorm:"column:updated_at;autoUpdateTime"`

	// Relationships
	PaymentType  *PaymentType  `json:"payment_type,omitempty" gorm:"foreignKey:PaymentTypeID"`
	Transactions []Transaction `json:"transactions,omitempty" gorm:"foreignKey:PaymentID"`
}

// TableName specifies the table name for GORM
func (Payment) TableName() string {
	return "payments"
}

// PaymentType represents a type of payment
type PaymentType struct {
	PaymentTypeID int       `json:"payment_type_id" db:"payment_type_id" gorm:"column:payment_type_id;primaryKey;autoIncrement"`
	TypeName      string    `json:"type_name" db:"type_name" gorm:"column:type_name;type:varchar(50);not null;uniqueIndex" binding:"required"`
	Description   string    `json:"description" db:"description" gorm:"column:description;type:text"`
	IsActive      bool      `json:"is_active" db:"is_active" gorm:"column:is_active;default:true"`
	CreatedAt     time.Time `json:"created_at" db:"created_at" gorm:"column:created_at;autoCreateTime"`
	UpdatedAt     time.Time `json:"updated_at" db:"updated_at" gorm:"column:updated_at;autoUpdateTime"`

	// Relationships
	Payments []Payment `json:"payments,omitempty" gorm:"foreignKey:PaymentTypeID"`
}

// TableName specifies the table name for GORM
func (PaymentType) TableName() string {
	return "payment_types"
}

// Transaction represents a payment transaction record
type Transaction struct {
	TransactionID        int       `json:"transaction_id" db:"transaction_id" gorm:"column:transaction_id;primaryKey;autoIncrement"`
	PaymentID            int       `json:"payment_id" db:"payment_id" gorm:"column:payment_id;not null" binding:"required"`
	TransactionDate      time.Time `json:"transaction_date" db:"transaction_date" gorm:"column:transaction_date;type:timestamptz;not null" binding:"required"`
	TransactionStatus    string    `json:"transaction_status" db:"transaction_status" gorm:"column:transaction_status;type:varchar(20);not null" binding:"required"`
	TransactionReference string    `json:"transaction_reference" db:"transaction_reference" gorm:"column:transaction_reference;type:varchar(100)"`
	GatewayResponse      string    `json:"gateway_response" db:"gateway_response" gorm:"column:gateway_response;type:text"`
	CreatedAt            time.Time `json:"created_at" db:"created_at" gorm:"column:created_at;autoCreateTime"`
	UpdatedAt            time.Time `json:"updated_at" db:"updated_at" gorm:"column:updated_at;autoUpdateTime"`

	// Relationships
	Payment Payment `json:"payment,omitempty" gorm:"foreignKey:PaymentID"`
}

// TableName specifies the table name for GORM
func (Transaction) TableName() string {
	return "payment_transactions"
}

// PaymentMethodStatistic represents payment method distribution
type PaymentMethodStatistic struct {
	PaymentMethod string  `json:"payment_method"`
	Count         int     `json:"count"`
	Percentage    float64 `json:"percentage"`
}

// PaymentStatistics holds aggregated payment statistics
type PaymentStatistics struct {
	TotalPayments           int                      `json:"total_payments"`
	TotalAmount             float64                  `json:"total_amount"`
	AverageAmount           float64                  `json:"average_amount"`
	PendingPayments         int                      `json:"pending_payments"`
	CompletedPayments       int                      `json:"completed_payments"`
	FailedPayments          int                      `json:"failed_payments"`
	PaymentMethodStatistics []PaymentMethodStatistic `json:"payment_method_statistics"`
}

// Request DTOs
type PaymentRequest struct {
	MemberID      int     `json:"member_id" binding:"required"`
	Amount        float64 `json:"amount" binding:"required,gt=0"`
	PaymentMethod string  `json:"payment_method" binding:"required"`
	PaymentStatus string  `json:"payment_status" binding:"required"`
	InvoiceNumber *string `json:"invoice_number"`
	Description   *string `json:"description"`
	PaymentTypeID *int    `json:"payment_type_id"`
}

type PaymentTypeRequest struct {
	TypeName    string `json:"type_name" binding:"required"`
	Description string `json:"description"`
	IsActive    bool   `json:"is_active"`
}

// Repository interfaces
type PaymentRepository interface {
	GetAll(ctx context.Context) ([]Payment, error)
	GetAllPaginated(ctx context.Context, offset, limit int) ([]Payment, int, error)
	GetByID(ctx context.Context, id int) (Payment, error)
	GetByMemberID(ctx context.Context, memberID int) ([]Payment, error)
	Create(ctx context.Context, payment Payment) (Payment, error)
	Update(ctx context.Context, id int, payment Payment) (Payment, error)
	Delete(ctx context.Context, id int) error
	GetStatistics(ctx context.Context) (PaymentStatistics, error)
}

type PaymentTypeRepository interface {
	GetAll(ctx context.Context, activeOnly bool) ([]PaymentType, error)
	GetByID(ctx context.Context, id int) (PaymentType, error)
	Create(ctx context.Context, paymentType PaymentType) (PaymentType, error)
	Update(ctx context.Context, id int, paymentType PaymentType) (PaymentType, error)
	Delete(ctx context.Context, id int) error
}

type TransactionRepository interface {
	GetByPaymentID(ctx context.Context, paymentID int) ([]Transaction, error)
	Create(ctx context.Context, transaction Transaction) (Transaction, error)
	Update(ctx context.Context, id int, transaction Transaction) (Transaction, error)
}

// Service interfaces
type PaymentService interface {
	GetPayments(ctx context.Context) ([]Payment, error)
	GetPaymentsPaginated(ctx context.Context, offset, limit int) ([]Payment, int, error)
	GetPaymentByID(ctx context.Context, id int) (Payment, error)
	GetPaymentsByMemberID(ctx context.Context, memberID int) ([]Payment, error)
	CreatePayment(ctx context.Context, req PaymentRequest) (Payment, error)
	UpdatePayment(ctx context.Context, id int, req PaymentRequest) (Payment, error)
	DeletePayment(ctx context.Context, id int) error
	GetStatistics(ctx context.Context) (PaymentStatistics, error)
}

type PaymentTypeService interface {
	GetPaymentTypes(ctx context.Context, activeOnly bool) ([]PaymentType, error)
	GetPaymentTypeByID(ctx context.Context, id int) (PaymentType, error)
	CreatePaymentType(ctx context.Context, req PaymentTypeRequest) (PaymentType, error)
	UpdatePaymentType(ctx context.Context, id int, req PaymentTypeRequest) (PaymentType, error)
	DeletePaymentType(ctx context.Context, id int) error
}
