package dto

import (
	"time"

	"github.com/FurkanArikk/fitness-center/backend/payment-service/internal/model"
)

// PaymentRequest represents the payment creation/update request
type PaymentRequest struct {
	MemberID      int       `json:"member_id" binding:"required"`
	Amount        float64   `json:"amount" binding:"required,gt=0"`
	PaymentDate   time.Time `json:"payment_date"`
	PaymentMethod string    `json:"payment_method" binding:"required"`
	PaymentStatus string    `json:"payment_status"`
	InvoiceNumber *string   `json:"invoice_number"`  // Changed to pointer
	Description   *string   `json:"description"`     // Changed to pointer
	PaymentTypeID *int      `json:"payment_type_id"` // Changed to pointer to handle NULL
}

// PaymentResponse represents the payment response to clients
type PaymentResponse struct {
	PaymentID       int       `json:"payment_id"`
	MemberID        int       `json:"member_id"`
	Amount          float64   `json:"amount"`
	PaymentDate     time.Time `json:"payment_date"`
	PaymentMethod   string    `json:"payment_method"`
	PaymentStatus   string    `json:"payment_status"`
	InvoiceNumber   *string   `json:"invoice_number,omitempty"`    // Changed to pointer
	Description     *string   `json:"description,omitempty"`       // Changed to pointer
	PaymentTypeID   *int      `json:"payment_type_id,omitempty"`   // Changed to pointer to handle NULL
	PaymentTypeName *string   `json:"payment_type_name,omitempty"` // Changed to pointer to handle NULL
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
}

// PaymentFilterRequest represents payment filter criteria
type PaymentFilterRequest struct {
	MemberID      *int       `json:"member_id" form:"member_id"`
	PaymentTypeID *int       `json:"payment_type_id" form:"payment_type_id"`
	PaymentMethod *string    `json:"payment_method" form:"payment_method"`
	PaymentStatus *string    `json:"payment_status" form:"payment_status"`
	StartDate     *time.Time `json:"start_date" form:"start_date"`
	EndDate       *time.Time `json:"end_date" form:"end_date"`
	MinAmount     *float64   `json:"min_amount" form:"min_amount"`
	MaxAmount     *float64   `json:"max_amount" form:"max_amount"`
}

// PaymentTypeRequest represents the payment type creation/update request
type PaymentTypeRequest struct {
	TypeName    string `json:"type_name" binding:"required"`
	Description string `json:"description"`
	IsActive    bool   `json:"is_active"`
}

// PaymentTypeResponse represents the payment type response to clients
type PaymentTypeResponse struct {
	PaymentTypeID int       `json:"payment_type_id"`
	TypeName      string    `json:"type_name"`
	Description   string    `json:"description"`
	IsActive      bool      `json:"is_active"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

// ToggleStatusRequest represents a request to change payment type's active status
type ToggleStatusRequest struct {
	IsActive bool `json:"is_active" binding:"required"`
}

// TransactionRequest represents the transaction creation/update request
type TransactionRequest struct {
	PaymentID            int       `json:"payment_id" binding:"required"`
	TransactionDate      time.Time `json:"transaction_date"`
	TransactionStatus    string    `json:"transaction_status" binding:"required"`
	TransactionReference string    `json:"transaction_reference"`
	GatewayResponse      string    `json:"gateway_response"`
}

// TransactionResponse represents the transaction response to clients
type TransactionResponse struct {
	TransactionID        int       `json:"transaction_id"`
	PaymentID            int       `json:"payment_id"`
	TransactionDate      time.Time `json:"transaction_date"`
	TransactionStatus    string    `json:"transaction_status"`
	TransactionReference string    `json:"transaction_reference"`
	GatewayResponse      string    `json:"gateway_response"`
	CreatedAt            time.Time `json:"created_at"`
	UpdatedAt            time.Time `json:"updated_at"`
}

// ProcessPaymentRequest represents a payment processing request
type ProcessPaymentRequest struct {
	PaymentID            int    `json:"payment_id" binding:"required"`
	TransactionStatus    string `json:"transaction_status" binding:"required"`
	TransactionReference string `json:"transaction_reference"`
	GatewayResponse      string `json:"gateway_response"`
}

// PaginatedResponse is a generic paginated response wrapper
type PaginatedResponse struct {
	Data       interface{} `json:"data"`
	Page       int         `json:"page"`
	PageSize   int         `json:"pageSize"`
	TotalItems int         `json:"totalItems"`
	TotalPages int         `json:"totalPages"`
}

// Convert model objects to DTOs
func ConvertToPaymentResponse(payment *model.Payment) *PaymentResponse {
	var paymentTypeName *string
	if payment.PaymentType != nil {
		paymentTypeName = &payment.PaymentType.TypeName
	}

	return &PaymentResponse{
		PaymentID:       payment.PaymentID,
		MemberID:        payment.MemberID,
		Amount:          payment.Amount,
		PaymentDate:     payment.PaymentDate,
		PaymentMethod:   payment.PaymentMethod,
		PaymentStatus:   payment.PaymentStatus,
		InvoiceNumber:   payment.InvoiceNumber,
		Description:     payment.Description,
		PaymentTypeID:   payment.PaymentTypeID,
		PaymentTypeName: paymentTypeName,
		CreatedAt:       payment.CreatedAt,
		UpdatedAt:       payment.UpdatedAt,
	}
}

func ConvertToPaymentTypeResponse(paymentType *model.PaymentType) *PaymentTypeResponse {
	return &PaymentTypeResponse{
		PaymentTypeID: paymentType.PaymentTypeID,
		TypeName:      paymentType.TypeName,
		Description:   paymentType.Description,
		IsActive:      paymentType.IsActive,
		CreatedAt:     paymentType.CreatedAt,
		UpdatedAt:     paymentType.UpdatedAt,
	}
}

func ConvertToTransactionResponse(transaction *model.Transaction) *TransactionResponse {
	return &TransactionResponse{
		TransactionID:        transaction.TransactionID,
		PaymentID:            transaction.PaymentID,
		TransactionDate:      transaction.TransactionDate,
		TransactionStatus:    transaction.TransactionStatus,
		TransactionReference: transaction.TransactionReference,
		GatewayResponse:      transaction.GatewayResponse,
		CreatedAt:            transaction.CreatedAt,
		UpdatedAt:            transaction.UpdatedAt,
	}
}

// Convert arrays of model objects to DTOs
func ConvertToPaymentResponses(payments []*model.Payment) []*PaymentResponse {
	responses := make([]*PaymentResponse, len(payments))
	for i, payment := range payments {
		responses[i] = ConvertToPaymentResponse(payment)
	}
	return responses
}

func ConvertToPaymentTypeResponses(paymentTypes []*model.PaymentType) []*PaymentTypeResponse {
	responses := make([]*PaymentTypeResponse, len(paymentTypes))
	for i, paymentType := range paymentTypes {
		responses[i] = ConvertToPaymentTypeResponse(paymentType)
	}
	return responses
}

func ConvertToTransactionResponses(transactions []*model.Transaction) []*TransactionResponse {
	responses := make([]*TransactionResponse, len(transactions))
	for i, transaction := range transactions {
		responses[i] = ConvertToTransactionResponse(transaction)
	}
	return responses
}

// Convert DTOs to model objects
func ConvertToPaymentModel(req *PaymentRequest) *model.Payment {
	return &model.Payment{
		MemberID:      req.MemberID,
		Amount:        req.Amount,
		PaymentDate:   req.PaymentDate,
		PaymentMethod: req.PaymentMethod,
		PaymentStatus: req.PaymentStatus,
		InvoiceNumber: req.InvoiceNumber,
		Description:   req.Description,
		PaymentTypeID: req.PaymentTypeID,
	}
}

func ConvertToPaymentTypeModel(req *PaymentTypeRequest) *model.PaymentType {
	return &model.PaymentType{
		TypeName:    req.TypeName,
		Description: req.Description,
		IsActive:    req.IsActive,
	}
}

func ConvertToTransactionModel(req *TransactionRequest) *model.Transaction {
	return &model.Transaction{
		PaymentID:            req.PaymentID,
		TransactionDate:      req.TransactionDate,
		TransactionStatus:    req.TransactionStatus,
		TransactionReference: req.TransactionReference,
		GatewayResponse:      req.GatewayResponse,
	}
}
