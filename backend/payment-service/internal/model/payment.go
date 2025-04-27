package model

import (
	"time"
)

// Payment represents a payment record
type Payment struct {
	PaymentID     int       `json:"payment_id" db:"payment_id"`
	MemberID      int       `json:"member_id" db:"member_id"`
	Amount        float64   `json:"amount" db:"amount"`
	PaymentDate   time.Time `json:"payment_date" db:"payment_date"`
	PaymentMethod string    `json:"payment_method" db:"payment_method"`
	PaymentStatus string    `json:"payment_status" db:"payment_status"`
	InvoiceNumber *string   `json:"invoice_number" db:"invoice_number"` // Changed to pointer to handle NULL
	Description   *string   `json:"description" db:"description"`       // Changed to pointer to handle NULL
	PaymentTypeID int       `json:"payment_type_id" db:"payment_type_id"`
	CreatedAt     time.Time `json:"created_at" db:"created_at"`
	UpdatedAt     time.Time `json:"updated_at" db:"updated_at"`
	// Field to store payment type name from JOIN queries
	PaymentTypeName string `json:"payment_type_name" db:"payment_type_name"`
}

// PaymentType represents a type of payment
type PaymentType struct {
	PaymentTypeID int       `json:"payment_type_id" db:"payment_type_id"`
	TypeName      string    `json:"type_name" db:"type_name"`
	Description   string    `json:"description" db:"description"`
	IsActive      bool      `json:"is_active" db:"is_active"`
	CreatedAt     time.Time `json:"created_at" db:"created_at"`
	UpdatedAt     time.Time `json:"updated_at" db:"updated_at"`
}

// PaymentStatistics holds aggregated payment statistics
type PaymentStatistics struct {
	TotalPayments     int     `json:"total_payments"`
	TotalAmount       float64 `json:"total_amount"`
	AverageAmount     float64 `json:"average_amount"`
	PendingPayments   int     `json:"pending_payments"`
	CompletedPayments int     `json:"completed_payments"`
	FailedPayments    int     `json:"failed_payments"`
}

// Transaction represents a payment transaction record
type Transaction struct {
	TransactionID        int       `json:"transaction_id" db:"transaction_id"`
	PaymentID            int       `json:"payment_id" db:"payment_id"`
	TransactionDate      time.Time `json:"transaction_date" db:"transaction_date"`
	TransactionStatus    string    `json:"transaction_status" db:"transaction_status"`
	TransactionReference string    `json:"transaction_reference" db:"transaction_reference"`
	GatewayResponse      string    `json:"gateway_response" db:"gateway_response"`
	CreatedAt            time.Time `json:"created_at" db:"created_at"`
	UpdatedAt            time.Time `json:"updated_at" db:"updated_at"`
}
