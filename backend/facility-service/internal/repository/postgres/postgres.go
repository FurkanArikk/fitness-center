package postgres

import (
	"fmt"
	"time"

	"github.com/furkan/fitness-center/backend/facility-service/internal/repository"
	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
)

// PostgresRepository implements repository.Repository
type PostgresRepository struct {
	db             *sqlx.DB
	equipmentRepo  repository.EquipmentRepository
	facilityRepo   repository.FacilityRepository
	attendanceRepo repository.AttendanceRepository
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
	repo.equipmentRepo = NewEquipmentRepository(db)
	repo.facilityRepo = NewFacilityRepository(db)
	repo.attendanceRepo = NewAttendanceRepository(db)

	return repo, nil
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
	return r.db.Close()
}
