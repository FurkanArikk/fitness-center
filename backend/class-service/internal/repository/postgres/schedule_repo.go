package postgres

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

	"github.com/FurkanArikk/fitness-center/backend/class-service/internal/model"
	"github.com/FurkanArikk/fitness-center/backend/class-service/internal/repository"
)

// ScheduleRepository implements repository.ScheduleRepository interface
type ScheduleRepository struct {
	db *sql.DB
}

// NewScheduleRepository creates a new ScheduleRepository
func NewScheduleRepository(db *sql.DB) repository.ScheduleRepository {
	return &ScheduleRepository{db: db}
}

// GetAll returns all schedules, optionally filtered by status
func (r *ScheduleRepository) GetAll(ctx context.Context, status string) ([]model.ScheduleResponse, error) {
	query := `
		SELECT s.*, c.class_name, c.duration
		FROM class_schedule s
		JOIN classes c ON s.class_id = c.class_id
	`
	if status != "" {
		query += " WHERE s.status = $1"
	}
	query += " ORDER BY s.day_of_week, s.start_time"

	var rows *sql.Rows
	var err error

	if status != "" {
		rows, err = r.db.QueryContext(ctx, query, status)
	} else {
		rows, err = r.db.QueryContext(ctx, query)
	}

	if err != nil {
		return nil, fmt.Errorf("failed to fetch schedules: %w", err)
	}
	defer rows.Close()

	var schedules []model.ScheduleResponse
	for rows.Next() {
		var s model.ScheduleResponse
		if err := rows.Scan(
			&s.ScheduleID, &s.ClassID, &s.TrainerID, &s.RoomID,
			&s.StartTime, &s.EndTime, &s.DayOfWeek, &s.Status,
			&s.CreatedAt, &s.UpdatedAt, &s.ClassName, &s.ClassDuration,
		); err != nil {
			return nil, fmt.Errorf("failed to scan schedule: %w", err)
		}
		schedules = append(schedules, s)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating schedule rows: %w", err)
	}

	return schedules, nil
}

// GetByID returns a schedule by its ID
func (r *ScheduleRepository) GetByID(ctx context.Context, id int) (model.ScheduleResponse, error) {
	query := `
		SELECT s.*, c.class_name, c.duration
		FROM class_schedule s
		JOIN classes c ON s.class_id = c.class_id
		WHERE s.schedule_id = $1
	`

	var s model.ScheduleResponse
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&s.ScheduleID, &s.ClassID, &s.TrainerID, &s.RoomID,
		&s.StartTime, &s.EndTime, &s.DayOfWeek, &s.Status,
		&s.CreatedAt, &s.UpdatedAt, &s.ClassName, &s.ClassDuration,
	)

	if err == sql.ErrNoRows {
		return model.ScheduleResponse{}, errors.New("schedule not found")
	} else if err != nil {
		return model.ScheduleResponse{}, fmt.Errorf("failed to fetch schedule: %w", err)
	}

	return s, nil
}

// GetByClassID returns schedules for a specific class
func (r *ScheduleRepository) GetByClassID(ctx context.Context, classID int) ([]model.ScheduleResponse, error) {
	query := `
		SELECT s.*, c.class_name, c.duration
		FROM class_schedule s
		JOIN classes c ON s.class_id = c.class_id
		WHERE s.class_id = $1
		ORDER BY s.day_of_week, s.start_time
	`

	rows, err := r.db.QueryContext(ctx, query, classID)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch schedules: %w", err)
	}
	defer rows.Close()

	var schedules []model.ScheduleResponse
	for rows.Next() {
		var s model.ScheduleResponse
		if err := rows.Scan(
			&s.ScheduleID, &s.ClassID, &s.TrainerID, &s.RoomID,
			&s.StartTime, &s.EndTime, &s.DayOfWeek, &s.Status,
			&s.CreatedAt, &s.UpdatedAt, &s.ClassName, &s.ClassDuration,
		); err != nil {
			return nil, fmt.Errorf("failed to scan schedule: %w", err)
		}
		schedules = append(schedules, s)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating schedule rows: %w", err)
	}

	return schedules, nil
}

// Create adds a new schedule
func (r *ScheduleRepository) Create(ctx context.Context, schedule model.Schedule) (model.Schedule, error) {
	query := `
		INSERT INTO class_schedule (class_id, trainer_id, room_id, start_time, end_time, day_of_week, status)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING schedule_id, created_at, updated_at
	`

	err := r.db.QueryRowContext(
		ctx, query,
		schedule.ClassID, schedule.TrainerID, schedule.RoomID,
		schedule.StartTime, schedule.EndTime, schedule.DayOfWeek, schedule.Status,
	).Scan(&schedule.ScheduleID, &schedule.CreatedAt, &schedule.UpdatedAt)

	if err != nil {
		return model.Schedule{}, fmt.Errorf("failed to create schedule: %w", err)
	}

	return schedule, nil
}

// Update modifies an existing schedule
func (r *ScheduleRepository) Update(ctx context.Context, id int, schedule model.Schedule) (model.Schedule, error) {
	query := `
		UPDATE class_schedule
		SET class_id = $1, trainer_id = $2, room_id = $3,
			start_time = $4, end_time = $5, day_of_week = $6,
			status = $7, updated_at = NOW()
		WHERE schedule_id = $8
		RETURNING *
	`

	err := r.db.QueryRowContext(
		ctx, query,
		schedule.ClassID, schedule.TrainerID, schedule.RoomID,
		schedule.StartTime, schedule.EndTime, schedule.DayOfWeek,
		schedule.Status, id,
	).Scan(
		&schedule.ScheduleID, &schedule.ClassID, &schedule.TrainerID,
		&schedule.RoomID, &schedule.StartTime, &schedule.EndTime,
		&schedule.DayOfWeek, &schedule.Status, &schedule.CreatedAt, &schedule.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		return model.Schedule{}, errors.New("schedule not found")
	} else if err != nil {
		return model.Schedule{}, fmt.Errorf("failed to update schedule: %w", err)
	}

	return schedule, nil
}

// Delete removes a schedule by its ID
func (r *ScheduleRepository) Delete(ctx context.Context, id int) error {
	result, err := r.db.ExecContext(ctx, "DELETE FROM class_schedule WHERE schedule_id = $1", id)
	if err != nil {
		return fmt.Errorf("failed to delete schedule: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return errors.New("schedule not found")
	}

	return nil
}

// HasBookings checks if a schedule has any bookings
func (r *ScheduleRepository) HasBookings(ctx context.Context, id int) (bool, error) {
	var count int
	err := r.db.QueryRowContext(ctx, "SELECT COUNT(*) FROM class_bookings WHERE schedule_id = $1", id).Scan(&count)
	if err != nil {
		return false, fmt.Errorf("failed to check schedule dependencies: %w", err)
	}
	return count > 0, nil
}
