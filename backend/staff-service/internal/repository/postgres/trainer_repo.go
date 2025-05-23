package postgres

import (
	"database/sql"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/FurkanArikk/fitness-center/backend/staff-service/internal/model"
	"github.com/lib/pq"
)

// TrainerRepository handles database operations related to trainers
type TrainerRepository struct {
	db *sql.DB
}

// NewTrainerRepository creates a new TrainerRepository
func NewTrainerRepository(db *sql.DB) *TrainerRepository {
	return &TrainerRepository{db: db}
}

// GetAll retrieves all active trainers from the database
func (r *TrainerRepository) GetAll() ([]model.Trainer, error) {
	query := `
        SELECT trainer_id, staff_id, specialization, certification, 
               experience, rating, is_active, created_at, updated_at
        FROM trainers
        WHERE is_active = true
        ORDER BY rating DESC
    `

	rows, err := r.db.Query(query)
	if err != nil {
		return nil, fmt.Errorf("error querying trainers: %w", err)
	}
	defer rows.Close()

	var trainers []model.Trainer
	for rows.Next() {
		var t model.Trainer
		if err := rows.Scan(
			&t.TrainerID, &t.StaffID, &t.Specialization, &t.Certification,
			&t.Experience, &t.Rating, &t.IsActive, &t.CreatedAt, &t.UpdatedAt,
		); err != nil {
			return nil, fmt.Errorf("error scanning trainer: %w", err)
		}
		trainers = append(trainers, t)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating trainer rows: %w", err)
	}

	return trainers, nil
}

// GetByID retrieves an active trainer by ID
func (r *TrainerRepository) GetByID(id int64) (*model.Trainer, error) {
	query := `
        SELECT trainer_id, staff_id, specialization, certification, 
               experience, rating, is_active, created_at, updated_at
        FROM trainers
        WHERE trainer_id = $1 AND is_active = true
    `

	var t model.Trainer
	err := r.db.QueryRow(query, id).Scan(
		&t.TrainerID, &t.StaffID, &t.Specialization, &t.Certification,
		&t.Experience, &t.Rating, &t.IsActive, &t.CreatedAt, &t.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, fmt.Errorf("trainer not found: %w", err)
		}
		return nil, fmt.Errorf("error querying trainer: %w", err)
	}

	return &t, nil
}

// GetByStaffID retrieves an active trainer by staff ID
func (r *TrainerRepository) GetByStaffID(staffID int64) (*model.Trainer, error) {
	query := `
        SELECT trainer_id, staff_id, specialization, certification, 
               experience, rating, is_active, created_at, updated_at
        FROM trainers
        WHERE staff_id = $1 AND is_active = true
    `

	var t model.Trainer
	err := r.db.QueryRow(query, staffID).Scan(
		&t.TrainerID, &t.StaffID, &t.Specialization, &t.Certification,
		&t.Experience, &t.Rating, &t.IsActive, &t.CreatedAt, &t.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, fmt.Errorf("trainer not found: %w", err)
		}
		return nil, fmt.Errorf("error querying trainer: %w", err)
	}

	return &t, nil
}

// Create adds a new trainer to the database
func (r *TrainerRepository) Create(trainer *model.Trainer) (*model.Trainer, error) {
	query := `
        INSERT INTO trainers (staff_id, specialization, certification, 
                             experience, rating, is_active)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING trainer_id, created_at, updated_at
    `

	// Set trainer as active by default
	trainer.IsActive = true

	err := r.db.QueryRow(
		query, trainer.StaffID, trainer.Specialization, trainer.Certification,
		trainer.Experience, trainer.Rating, trainer.IsActive,
	).Scan(&trainer.TrainerID, &trainer.CreatedAt, &trainer.UpdatedAt)

	if err != nil {
		// Check for unique constraint violation
		pqErr, ok := err.(*pq.Error)
		if ok && pqErr.Code == "23505" {
			if strings.Contains(pqErr.Constraint, "trainers_staff_id_key") {
				return nil, fmt.Errorf("this staff member is already registered as a trainer: %w", err)
			}
		}
		return nil, fmt.Errorf("error creating trainer: %w", err)
	}

	return trainer, nil
}

// Update modifies an existing trainer in the database
func (r *TrainerRepository) Update(trainer *model.Trainer) (*model.Trainer, error) {
	query := `
        UPDATE trainers
        SET staff_id = $1, specialization = $2, certification = $3, 
            experience = $4, rating = $5, is_active = $6, updated_at = $7
        WHERE trainer_id = $8 AND is_active = true
        RETURNING updated_at
    `

	now := time.Now()
	err := r.db.QueryRow(
		query, trainer.StaffID, trainer.Specialization, trainer.Certification,
		trainer.Experience, trainer.Rating, trainer.IsActive, now, trainer.TrainerID,
	).Scan(&trainer.UpdatedAt)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, fmt.Errorf("trainer not found or already deleted: %w", err)
		}
		return nil, fmt.Errorf("error updating trainer: %w", err)
	}

	return trainer, nil
}

// Delete soft deletes a trainer by setting is_active to false
func (r *TrainerRepository) Delete(id int64) error {
	query := `
        UPDATE trainers 
        SET is_active = false, updated_at = $1
        WHERE trainer_id = $2 AND is_active = true
    `

	now := time.Now()
	result, err := r.db.Exec(query, now, id)
	if err != nil {
		return fmt.Errorf("error soft deleting trainer: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("error checking rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("trainer not found or already deleted")
	}

	return nil
}

// GetBySpecialization retrieves trainers by specialization
func (r *TrainerRepository) GetBySpecialization(specialization string) ([]model.Trainer, error) {
	query := `
        SELECT trainer_id, staff_id, specialization, certification, 
               experience, rating, is_active, created_at, updated_at
        FROM trainers
        WHERE specialization = $1 AND is_active = true
        ORDER BY rating DESC
    `

	rows, err := r.db.Query(query, specialization)
	if err != nil {
		return nil, fmt.Errorf("error querying trainers by specialization: %w", err)
	}
	defer rows.Close()

	var trainers []model.Trainer
	for rows.Next() {
		var t model.Trainer
		if err := rows.Scan(
			&t.TrainerID, &t.StaffID, &t.Specialization, &t.Certification,
			&t.Experience, &t.Rating, &t.IsActive, &t.CreatedAt, &t.UpdatedAt,
		); err != nil {
			return nil, fmt.Errorf("error scanning trainer: %w", err)
		}
		trainers = append(trainers, t)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating trainer rows: %w", err)
	}

	return trainers, nil
}

// GetTopRated retrieves the top rated trainers
func (r *TrainerRepository) GetTopRated(limit int) ([]model.Trainer, error) {
	query := `
        SELECT trainer_id, staff_id, specialization, certification, 
               experience, rating, is_active, created_at, updated_at
        FROM trainers
        WHERE is_active = true
        ORDER BY rating DESC
        LIMIT $1
    `

	rows, err := r.db.Query(query, limit)
	if err != nil {
		return nil, fmt.Errorf("error querying top rated trainers: %w", err)
	}
	defer rows.Close()

	var trainers []model.Trainer
	for rows.Next() {
		var t model.Trainer
		if err := rows.Scan(
			&t.TrainerID, &t.StaffID, &t.Specialization, &t.Certification,
			&t.Experience, &t.Rating, &t.IsActive, &t.CreatedAt, &t.UpdatedAt,
		); err != nil {
			return nil, fmt.Errorf("error scanning trainer: %w", err)
		}
		trainers = append(trainers, t)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating trainer rows: %w", err)
	}

	return trainers, nil
}

// GetWithStaffDetails retrieves all trainers with their staff details
func (r *TrainerRepository) GetWithStaffDetails() ([]model.Trainer, error) {
	query := `
        SELECT t.trainer_id, t.staff_id, t.specialization, t.certification, 
               t.experience, t.rating, t.is_active, t.created_at, t.updated_at,
               s.first_name, s.last_name, s.email, s.phone, s.position
        FROM trainers t
        JOIN staff s ON t.staff_id = s.staff_id
        WHERE t.is_active = true
        ORDER BY t.rating DESC
    `

	rows, err := r.db.Query(query)
	if err != nil {
		return nil, fmt.Errorf("error querying trainers with staff details: %w", err)
	}
	defer rows.Close()

	var trainers []model.Trainer
	for rows.Next() {
		var t model.Trainer
		var firstName, lastName, email, phone, position string

		if err := rows.Scan(
			&t.TrainerID, &t.StaffID, &t.Specialization, &t.Certification,
			&t.Experience, &t.Rating, &t.IsActive, &t.CreatedAt, &t.UpdatedAt,
			&firstName, &lastName, &email, &phone, &position,
		); err != nil {
			return nil, fmt.Errorf("error scanning trainer with staff details: %w", err)
		}

		// Create embedded staff object with the retrieved values
		t.Staff = &model.Staff{
			StaffID:   t.StaffID,
			FirstName: firstName,
			LastName:  lastName,
			Email:     email,
			Phone:     phone,
			Position:  position,
		}

		trainers = append(trainers, t)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating trainer rows: %w", err)
	}

	return trainers, nil
}
