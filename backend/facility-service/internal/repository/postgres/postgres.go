package postgres

import (
	"context"
	"fmt"
	"time"

	"github.com/furkan/fitness-center/backend/facility-service/internal/repository"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// PostgresRepository implements repository.Repository
type PostgresRepository struct {
	db             *gorm.DB
	equipmentRepo  repository.EquipmentRepository
	facilityRepo   repository.FacilityRepository
	attendanceRepo repository.AttendanceRepository
}

// NewPostgresRepository creates a new PostgreSQL repository
func NewPostgresRepository(connectionString string) (repository.Repository, error) {
	db, err := gorm.Open(postgres.Open(connectionString), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		return nil, fmt.Errorf("connecting to postgres: %w", err)
	}

	// Get the underlying sql.DB to configure connection pool
	sqlDB, err := db.DB()
	if err != nil {
		return nil, fmt.Errorf("getting underlying database: %w", err)
	}

	// Set connection pool settings
	sqlDB.SetMaxOpenConns(25)
	sqlDB.SetMaxIdleConns(5)
	sqlDB.SetConnMaxLifetime(5 * time.Minute)

	repo := &PostgresRepository{
		db: db,
	}

	// Initialize specific repositories
	repo.equipmentRepo = NewEquipmentRepository(db)
	repo.facilityRepo = NewFacilityRepository(db)
	repo.attendanceRepo = NewAttendanceRepository(db)

	return repo, nil
}

// Ping checks if the database connection is active
func (r *PostgresRepository) Ping(ctx context.Context) error {
	sqlDB, err := r.db.DB()
	if err != nil {
		return err
	}
	return sqlDB.PingContext(ctx)
}

// Equipment returns the equipment repository
func (r *PostgresRepository) Equipment() repository.EquipmentRepository {
	return r.equipmentRepo
}

// Facility returns the facility repository
func (r *PostgresRepository) Facility() repository.FacilityRepository {
	return r.facilityRepo
}

// Attendance returns the attendance repository
func (r *PostgresRepository) Attendance() repository.AttendanceRepository {
	return r.attendanceRepo
}

// Close closes the database connection
func (r *PostgresRepository) Close() error {
	sqlDB, err := r.db.DB()
	if err != nil {
		return err
	}
	return sqlDB.Close()
}
