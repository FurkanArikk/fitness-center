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

// PersonalTrainingRepository handles database operations related to personal training sessions
type PersonalTrainingRepository struct {
	db *sql.DB
}

// NewPersonalTrainingRepository creates a new PersonalTrainingRepository
func NewPersonalTrainingRepository(db *sql.DB) *PersonalTrainingRepository {
	return &PersonalTrainingRepository{db: db}
}

// GetAll retrieves all personal training sessions from the database
func (r *PersonalTrainingRepository) GetAll() ([]model.PersonalTraining, error) {
	query := `
        SELECT session_id, member_id, trainer_id, session_date, start_time, 
               end_time, notes, status, price, created_at, updated_at
        FROM personal_training
        ORDER BY session_date DESC, start_time ASC
    `

	rows, err := r.db.Query(query)
	if err != nil {
		return nil, fmt.Errorf("error querying training sessions: %w", err)
	}
	defer rows.Close()

	var sessions []model.PersonalTraining
	for rows.Next() {
		var t model.PersonalTraining
		if err := rows.Scan(
			&t.SessionID, &t.MemberID, &t.TrainerID, &t.SessionDate,
			&t.StartTime, &t.EndTime, &t.Notes, &t.Status, &t.Price,
			&t.CreatedAt, &t.UpdatedAt,
		); err != nil {
			return nil, fmt.Errorf("error scanning training session: %w", err)
		}

		// Ensure time fields are in the correct format (HH:MM:SS)
		t.StartTime = ensureCorrectTimeFormat(t.StartTime)
		t.EndTime = ensureCorrectTimeFormat(t.EndTime)

		sessions = append(sessions, t)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating training session rows: %w", err)
	}

	return sessions, nil
}

// GetByID retrieves a personal training session by ID
func (r *PersonalTrainingRepository) GetByID(id int64) (*model.PersonalTraining, error) {
	query := `
        SELECT session_id, member_id, trainer_id, session_date, start_time, 
               end_time, notes, status, price, created_at, updated_at
        FROM personal_training
        WHERE session_id = $1
    `

	var t model.PersonalTraining
	err := r.db.QueryRow(query, id).Scan(
		&t.SessionID, &t.MemberID, &t.TrainerID, &t.SessionDate,
		&t.StartTime, &t.EndTime, &t.Notes, &t.Status, &t.Price,
		&t.CreatedAt, &t.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, fmt.Errorf("training session not found: %w", err)
		}
		return nil, fmt.Errorf("error querying training session: %w", err)
	}

	// Ensure time fields are in the correct format (HH:MM:SS)
	t.StartTime = ensureCorrectTimeFormat(t.StartTime)
	t.EndTime = ensureCorrectTimeFormat(t.EndTime)

	return &t, nil
}

// GetByMemberID retrieves all personal training sessions for a member
func (r *PersonalTrainingRepository) GetByMemberID(memberID int64) ([]model.PersonalTraining, error) {
	query := `
        SELECT session_id, member_id, trainer_id, session_date, start_time, 
               end_time, notes, status, price, created_at, updated_at
        FROM personal_training
        WHERE member_id = $1
        ORDER BY session_date DESC, start_time ASC
    `

	rows, err := r.db.Query(query, memberID)
	if err != nil {
		return nil, fmt.Errorf("error querying training sessions by member ID: %w", err)
	}
	defer rows.Close()

	var sessions []model.PersonalTraining
	for rows.Next() {
		var t model.PersonalTraining
		if err := rows.Scan(
			&t.SessionID, &t.MemberID, &t.TrainerID, &t.SessionDate,
			&t.StartTime, &t.EndTime, &t.Notes, &t.Status, &t.Price,
			&t.CreatedAt, &t.UpdatedAt,
		); err != nil {
			return nil, fmt.Errorf("error scanning training session: %w", err)
		}

		// Ensure time fields are in the correct format (HH:MM:SS)
		t.StartTime = ensureCorrectTimeFormat(t.StartTime)
		t.EndTime = ensureCorrectTimeFormat(t.EndTime)

		sessions = append(sessions, t)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating training session rows: %w", err)
	}

	return sessions, nil
}

// GetByTrainerID retrieves all personal training sessions for a trainer
func (r *PersonalTrainingRepository) GetByTrainerID(trainerID int64) ([]model.PersonalTraining, error) {
	query := `
        SELECT session_id, member_id, trainer_id, session_date, start_time, 
               end_time, notes, status, price, created_at, updated_at
        FROM personal_training
        WHERE trainer_id = $1
        ORDER BY session_date DESC, start_time ASC
    `

	rows, err := r.db.Query(query, trainerID)
	if err != nil {
		return nil, fmt.Errorf("error querying training sessions by trainer ID: %w", err)
	}
	defer rows.Close()

	var sessions []model.PersonalTraining
	for rows.Next() {
		var t model.PersonalTraining
		if err := rows.Scan(
			&t.SessionID, &t.MemberID, &t.TrainerID, &t.SessionDate,
			&t.StartTime, &t.EndTime, &t.Notes, &t.Status, &t.Price,
			&t.CreatedAt, &t.UpdatedAt,
		); err != nil {
			return nil, fmt.Errorf("error scanning training session: %w", err)
		}

		// Ensure time fields are in the correct format (HH:MM:SS)
		t.StartTime = ensureCorrectTimeFormat(t.StartTime)
		t.EndTime = ensureCorrectTimeFormat(t.EndTime)

		sessions = append(sessions, t)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating training session rows: %w", err)
	}

	return sessions, nil
}

// GetByDateRange retrieves all personal training sessions within a date range
func (r *PersonalTrainingRepository) GetByDateRange(startDate, endDate time.Time) ([]model.PersonalTraining, error) {
	query := `
        SELECT session_id, member_id, trainer_id, session_date, start_time, 
               end_time, notes, status, price, created_at, updated_at
        FROM personal_training
        WHERE session_date BETWEEN $1 AND $2
        ORDER BY session_date ASC, start_time ASC
    `

	rows, err := r.db.Query(query, startDate, endDate)
	if err != nil {
		return nil, fmt.Errorf("error querying training sessions by date range: %w", err)
	}
	defer rows.Close()

	var sessions []model.PersonalTraining
	for rows.Next() {
		var t model.PersonalTraining
		if err := rows.Scan(
			&t.SessionID, &t.MemberID, &t.TrainerID, &t.SessionDate,
			&t.StartTime, &t.EndTime, &t.Notes, &t.Status, &t.Price,
			&t.CreatedAt, &t.UpdatedAt,
		); err != nil {
			return nil, fmt.Errorf("error scanning training session: %w", err)
		}

		// Ensure time fields are in the correct format (HH:MM:SS)
		t.StartTime = ensureCorrectTimeFormat(t.StartTime)
		t.EndTime = ensureCorrectTimeFormat(t.EndTime)

		sessions = append(sessions, t)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating training session rows: %w", err)
	}

	return sessions, nil
}

// GetByStatus retrieves all personal training sessions with a specific status
func (r *PersonalTrainingRepository) GetByStatus(status string) ([]model.PersonalTraining, error) {
	query := `
        SELECT session_id, member_id, trainer_id, session_date, start_time, 
               end_time, notes, status, price, created_at, updated_at
        FROM personal_training
        WHERE status = $1
        ORDER BY session_date ASC, start_time ASC
    `

	rows, err := r.db.Query(query, status)
	if err != nil {
		return nil, fmt.Errorf("error querying training sessions by status: %w", err)
	}
	defer rows.Close()

	var sessions []model.PersonalTraining
	for rows.Next() {
		var t model.PersonalTraining
		if err := rows.Scan(
			&t.SessionID, &t.MemberID, &t.TrainerID, &t.SessionDate,
			&t.StartTime, &t.EndTime, &t.Notes, &t.Status, &t.Price,
			&t.CreatedAt, &t.UpdatedAt,
		); err != nil {
			return nil, fmt.Errorf("error scanning training session: %w", err)
		}

		// Ensure time fields are in the correct format (HH:MM:SS)
		t.StartTime = ensureCorrectTimeFormat(t.StartTime)
		t.EndTime = ensureCorrectTimeFormat(t.EndTime)

		sessions = append(sessions, t)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating training session rows: %w", err)
	}

	return sessions, nil
}

// GetByStatusAndDate retrieves all personal training sessions with a specific status on a specific date
func (r *PersonalTrainingRepository) GetByStatusAndDate(status string, date time.Time) ([]model.PersonalTraining, error) {
	// Create date range for the specified date (start of day to end of day)
	endDate := date.AddDate(0, 0, 1)

	query := `
        SELECT session_id, member_id, trainer_id, session_date, start_time, 
               end_time, notes, status, price, created_at, updated_at
        FROM personal_training
        WHERE status = $1 AND session_date >= $2 AND session_date < $3
        ORDER BY session_date ASC, start_time ASC
    `

	rows, err := r.db.Query(query, status, date, endDate)
	if err != nil {
		return nil, fmt.Errorf("error querying training sessions by status and date: %w", err)
	}
	defer rows.Close()

	var sessions []model.PersonalTraining
	for rows.Next() {
		var t model.PersonalTraining
		if err := rows.Scan(
			&t.SessionID, &t.MemberID, &t.TrainerID, &t.SessionDate,
			&t.StartTime, &t.EndTime, &t.Notes, &t.Status, &t.Price,
			&t.CreatedAt, &t.UpdatedAt,
		); err != nil {
			return nil, fmt.Errorf("error scanning training session: %w", err)
		}

		// Ensure time fields are in the correct format (HH:MM:SS)
		t.StartTime = ensureCorrectTimeFormat(t.StartTime)
		t.EndTime = ensureCorrectTimeFormat(t.EndTime)

		sessions = append(sessions, t)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating training session rows: %w", err)
	}

	return sessions, nil
}

// Create adds a new personal training session to the database
func (r *PersonalTrainingRepository) Create(training *model.PersonalTraining) (*model.PersonalTraining, error) {
	query := `
        INSERT INTO personal_training (member_id, trainer_id, session_date, 
                                      start_time, end_time, notes, status, price)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING session_id, created_at, updated_at
    `

	err := r.db.QueryRow(
		query, training.MemberID, training.TrainerID, training.SessionDate,
		training.StartTime, training.EndTime, training.Notes, training.Status, training.Price,
	).Scan(&training.SessionID, &training.CreatedAt, &training.UpdatedAt)

	if err != nil {
		// Check for unique constraint violation
		pqErr, ok := err.(*pq.Error)
		if ok {
			if pqErr.Code == "23505" && strings.Contains(pqErr.Constraint, "unique_training_session") {
				return nil, fmt.Errorf("this trainer already has a session scheduled at this time: %w", err)
			} else if pqErr.Code == "23514" && strings.Contains(pqErr.Constraint, "check_time_valid") {
				return nil, fmt.Errorf("invalid session times: start time must be before end time: %w", err)
			}
		}
		return nil, fmt.Errorf("error creating training session: %w", err)
	}

	return training, nil
}

// Update modifies an existing personal training session in the database
func (r *PersonalTrainingRepository) Update(training *model.PersonalTraining) (*model.PersonalTraining, error) {
	query := `
        UPDATE personal_training
        SET member_id = $1, trainer_id = $2, session_date = $3, 
            start_time = $4, end_time = $5, notes = $6, status = $7, 
            price = $8, updated_at = $9
        WHERE session_id = $10
        RETURNING updated_at
    `

	now := time.Now()
	err := r.db.QueryRow(
		query, training.MemberID, training.TrainerID, training.SessionDate,
		ensureCorrectTimeFormat(training.StartTime), ensureCorrectTimeFormat(training.EndTime), training.Notes, training.Status,
		training.Price, now, training.SessionID,
	).Scan(&training.UpdatedAt)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, fmt.Errorf("training session not found: %w", err)
		}
		return nil, fmt.Errorf("error updating training session: %w", err)
	}

	// Fetch the complete record to ensure we have all fields including created_at
	updatedSession, err := r.GetByID(training.SessionID)
	if err != nil {
		return nil, fmt.Errorf("error retrieving updated session: %w", err)
	}

	// Update the created_at time from the fetched record
	training.CreatedAt = updatedSession.CreatedAt

	return training, nil
}

// Delete removes a personal training session from the database
func (r *PersonalTrainingRepository) Delete(id int64) error {
	query := `DELETE FROM personal_training WHERE session_id = $1`

	result, err := r.db.Exec(query, id)
	if err != nil {
		return fmt.Errorf("error deleting training session: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("error checking rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("training session not found")
	}

	return nil
}

// GetWithTrainerDetails retrieves a personal training session with trainer details
func (r *PersonalTrainingRepository) GetWithTrainerDetails(id int64) (*model.PersonalTraining, error) {
	query := `
        SELECT pt.session_id, pt.member_id, pt.trainer_id, pt.session_date, 
               pt.start_time, pt.end_time, pt.notes, pt.status, pt.price, 
               pt.created_at, pt.updated_at,
               t.specialization, t.certification, t.experience, t.rating,
               s.staff_id, s.first_name, s.last_name, s.email, s.phone
        FROM personal_training pt
        JOIN trainers t ON pt.trainer_id = t.trainer_id
        JOIN staff s ON t.staff_id = s.staff_id
        WHERE pt.session_id = $1
    `

	var training model.PersonalTraining
	var trainerSpecialization, trainerCertification string
	var trainerExperience int
	var trainerRating float64
	var staffID int64
	var staffFirstName, staffLastName, staffEmail, staffPhone string

	err := r.db.QueryRow(query, id).Scan(
		&training.SessionID, &training.MemberID, &training.TrainerID, &training.SessionDate,
		&training.StartTime, &training.EndTime, &training.Notes, &training.Status, &training.Price,
		&training.CreatedAt, &training.UpdatedAt,
		&trainerSpecialization, &trainerCertification, &trainerExperience, &trainerRating,
		&staffID, &staffFirstName, &staffLastName, &staffEmail, &staffPhone,
	)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, fmt.Errorf("training session not found: %w", err)
		}
		return nil, fmt.Errorf("error querying training session: %w", err)
	}

	// Ensure time fields are in the correct format (HH:MM:SS)
	training.StartTime = ensureCorrectTimeFormat(training.StartTime)
	training.EndTime = ensureCorrectTimeFormat(training.EndTime)

	// Set trainer details
	training.Trainer = &model.Trainer{
		TrainerID:      training.TrainerID,
		StaffID:        staffID,
		Specialization: trainerSpecialization,
		Certification:  trainerCertification,
		Experience:     trainerExperience,
		Rating:         trainerRating,
		Staff: &model.Staff{
			StaffID:   staffID,
			FirstName: staffFirstName,
			LastName:  staffLastName,
			Email:     staffEmail,
			Phone:     staffPhone,
		},
	}

	return &training, nil
}

// ensureCorrectTimeFormat ensures that time strings are in the correct PostgreSQL TIME format (HH:MM:SS)
// This function is used to standardize time format across all repository methods
func ensureCorrectTimeFormat(timeStr string) string {
	// If the time value contains timezone information (like T16:00:00Z), strip it down to just HH:MM:SS
	if strings.Contains(timeStr, "T") || strings.Contains(timeStr, "Z") {
		t, err := time.Parse(time.RFC3339, timeStr)
		if err == nil {
			return t.Format("15:04:05")
		}
	}
	return timeStr
}

// GetAllPaginated retrieves personal training sessions with pagination
func (r *PersonalTrainingRepository) GetAllPaginated(offset, limit int) ([]model.PersonalTraining, int, error) {
	// First get the total count
	countQuery := `SELECT COUNT(*) FROM personal_training`
	var totalCount int
	err := r.db.QueryRow(countQuery).Scan(&totalCount)
	if err != nil {
		return nil, 0, fmt.Errorf("error counting training sessions: %w", err)
	}

	// Then get the paginated data
	query := `
        SELECT session_id, member_id, trainer_id, session_date, start_time, 
               end_time, notes, status, price, created_at, updated_at
        FROM personal_training
        ORDER BY session_date DESC, start_time ASC
        LIMIT $1 OFFSET $2
    `

	rows, err := r.db.Query(query, limit, offset)
	if err != nil {
		return nil, 0, fmt.Errorf("error querying paginated training sessions: %w", err)
	}
	defer rows.Close()

	var sessions []model.PersonalTraining
	for rows.Next() {
		var t model.PersonalTraining
		if err := rows.Scan(
			&t.SessionID, &t.MemberID, &t.TrainerID, &t.SessionDate,
			&t.StartTime, &t.EndTime, &t.Notes, &t.Status, &t.Price,
			&t.CreatedAt, &t.UpdatedAt,
		); err != nil {
			return nil, 0, fmt.Errorf("error scanning paginated training session: %w", err)
		}

		// Ensure time fields are in the correct format (HH:MM:SS)
		t.StartTime = ensureCorrectTimeFormat(t.StartTime)
		t.EndTime = ensureCorrectTimeFormat(t.EndTime)

		sessions = append(sessions, t)
	}

	if err := rows.Err(); err != nil {
		return nil, 0, fmt.Errorf("error iterating paginated training session rows: %w", err)
	}

	return sessions, totalCount, nil
}
