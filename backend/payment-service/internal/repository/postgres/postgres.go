package postgres

import (
	"context"
	"fmt"
	"time"

	"github.com/FurkanArikk/fitness-center/backend/payment-service/internal/repository"
	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
)

// PostgresRepository implements repository.Repository
type PostgresRepository struct {
	db              *sqlx.DB
	paymentRepo     repository.PaymentRepository
	paymentTypeRepo repository.PaymentTypeRepository
	transactionRepo repository.TransactionRepository
}

// NewPostgresRepository creates a new PostgreSQL repository
func NewPostgresRepository(connectionString string) (repository.Repository, error) {
	db, err := sqlx.Connect("postgres", connectionString)
	if err != nil {
		return nil, fmt.Errorf("connecting to postgres: %w", err)
	}

	// Set connection pool settings
	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(5)
	db.SetConnMaxLifetime(5 * time.Minute)

	repo := &PostgresRepository{
		db: db,
	}

	// Initialize specific repositories
	repo.paymentRepo = NewPaymentRepository(db)
	repo.paymentTypeRepo = NewPaymentTypeRepository(db)
	repo.transactionRepo = NewTransactionRepository(db)

	return repo, nil
}

// Payment returns the payment repository
func (r *PostgresRepository) Payment() repository.PaymentRepository {
	return r.paymentRepo
}

// PaymentType returns the payment type repository
func (r *PostgresRepository) PaymentType() repository.PaymentTypeRepository {
	return r.paymentTypeRepo
}

// Transaction returns the transaction repository
func (r *PostgresRepository) Transaction() repository.TransactionRepository {
	return r.transactionRepo
}

// Ping checks if the database connection is active
func (r *PostgresRepository) Ping(ctx context.Context) error {
	return r.db.PingContext(ctx)
}

// Close closes the database connection
func (r *PostgresRepository) Close() error {
	return r.db.Close()
}
