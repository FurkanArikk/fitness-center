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

// QualificationRepository handles database operations related to staff qualifications
type QualificationRepository struct {
	db *sql.DB
}

// NewQualificationRepository creates a new QualificationRepository
func NewQualificationRepository(db *sql.DB) *QualificationRepository {
	return &QualificationRepository{db: db}
}

// GetAll retrieves all qualifications from the database
func (r *QualificationRepository) GetAll() ([]model.Qualification, error) {
	query := `
        SELECT qualification_id, staff_id, qualification_name, issue_date, 
               expiry_date, issuing_authority, created_at, updated_at
        FROM staff_qualifications
        ORDER BY expiry_date DESC
    `

	rows, err := r.db.Query(query)
	if err != nil {
		return nil, fmt.Errorf("error querying qualifications: %w", err)
	}
	defer rows.Close()

	var qualifications []model.Qualification
	for rows.Next() {
		var q model.Qualification
		if err := rows.Scan(
			&q.QualificationID, &q.StaffID, &q.QualificationName, &q.IssueDate,
			&q.ExpiryDate, &q.IssuingAuthority, &q.CreatedAt, &q.UpdatedAt,
		); err != nil {
			return nil, fmt.Errorf("error scanning qualification: %w", err)
		}
		qualifications = append(qualifications, q)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating qualification rows: %w", err)
	}

	return qualifications, nil
}

// GetByID retrieves a qualification by ID
func (r *QualificationRepository) GetByID(id int64) (*model.Qualification, error) {
	query := `
        SELECT qualification_id, staff_id, qualification_name, issue_date, 
               expiry_date, issuing_authority, created_at, updated_at
        FROM staff_qualifications
        WHERE qualification_id = $1
    `

	var q model.Qualification
	err := r.db.QueryRow(query, id).Scan(
		&q.QualificationID, &q.StaffID, &q.QualificationName, &q.IssueDate,
		&q.ExpiryDate, &q.IssuingAuthority, &q.CreatedAt, &q.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, fmt.Errorf("qualification not found: %w", err)
		}
		return nil, fmt.Errorf("error querying qualification: %w", err)
	}

	return &q, nil
}

// GetByStaffID retrieves all qualifications for a staff member
func (r *QualificationRepository) GetByStaffID(staffID int64) ([]model.Qualification, error) {
	query := `
        SELECT qualification_id, staff_id, qualification_name, issue_date, 
               expiry_date, issuing_authority, created_at, updated_at
        FROM staff_qualifications
        WHERE staff_id = $1
        ORDER BY expiry_date DESC
    `

	rows, err := r.db.Query(query, staffID)
	if err != nil {
		return nil, fmt.Errorf("error querying qualifications by staff ID: %w", err)
	}
	defer rows.Close()

	var qualifications []model.Qualification
	for rows.Next() {
		var q model.Qualification
		if err := rows.Scan(
			&q.QualificationID, &q.StaffID, &q.QualificationName, &q.IssueDate,
			&q.ExpiryDate, &q.IssuingAuthority, &q.CreatedAt, &q.UpdatedAt,
		); err != nil {
			return nil, fmt.Errorf("error scanning qualification: %w", err)
		}
		qualifications = append(qualifications, q)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating qualification rows: %w", err)
	}

	return qualifications, nil
}

// Create adds a new qualification to the database
func (r *QualificationRepository) Create(qualification *model.Qualification) (*model.Qualification, error) {
	query := `
        INSERT INTO staff_qualifications (staff_id, qualification_name, issue_date, 
                                         expiry_date, issuing_authority)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING qualification_id, created_at, updated_at
    `

	err := r.db.QueryRow(
		query, qualification.StaffID, qualification.QualificationName,
		qualification.IssueDate, qualification.ExpiryDate, qualification.IssuingAuthority,
	).Scan(&qualification.QualificationID, &qualification.CreatedAt, &qualification.UpdatedAt)

	if err != nil {
		// Check for unique constraint violation
		pqErr, ok := err.(*pq.Error)
		if ok && pqErr.Code == "23505" {
			if strings.Contains(pqErr.Constraint, "unique_staff_qualification") {
				return nil, fmt.Errorf("this qualification is already registered for this staff member: %w", err)
			}
		}
		return nil, fmt.Errorf("error creating qualification: %w", err)
	}

	return qualification, nil
}

// Update modifies an existing qualification in the database
func (r *QualificationRepository) Update(qualification *model.Qualification) (*model.Qualification, error) {
	query := `
        UPDATE staff_qualifications
        SET staff_id = $1, qualification_name = $2, issue_date = $3, 
            expiry_date = $4, issuing_authority = $5, updated_at = $6
        WHERE qualification_id = $7
        RETURNING updated_at
    `

	now := time.Now()
	err := r.db.QueryRow(
		query, qualification.StaffID, qualification.QualificationName,
		qualification.IssueDate, qualification.ExpiryDate, qualification.IssuingAuthority,
		now, qualification.QualificationID,
	).Scan(&qualification.UpdatedAt)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, fmt.Errorf("qualification not found: %w", err)
		}
		return nil, fmt.Errorf("error updating qualification: %w", err)
	}

	return qualification, nil
}

// Delete removes a qualification from the database
func (r *QualificationRepository) Delete(id int64) error {
	query := `DELETE FROM staff_qualifications WHERE qualification_id = $1`

	result, err := r.db.Exec(query, id)
	if err != nil {
		return fmt.Errorf("error deleting qualification: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("error checking rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("qualification not found")
	}

	return nil
}

// GetExpiringSoon retrieves qualifications expiring within the specified number of days
func (r *QualificationRepository) GetExpiringSoon(days int) ([]model.Qualification, error) {
	query := `
        SELECT qualification_id, staff_id, qualification_name, issue_date, 
               expiry_date, issuing_authority, created_at, updated_at
        FROM staff_qualifications
        WHERE expiry_date <= CURRENT_DATE + $1
        ORDER BY expiry_date
    `

	rows, err := r.db.Query(query, days)
	if err != nil {
		return nil, fmt.Errorf("error querying expiring qualifications: %w", err)
	}
	defer rows.Close()

	var qualifications []model.Qualification
	for rows.Next() {
		var q model.Qualification
		if err := rows.Scan(
			&q.QualificationID, &q.StaffID, &q.QualificationName, &q.IssueDate,
			&q.ExpiryDate, &q.IssuingAuthority, &q.CreatedAt, &q.UpdatedAt,
		); err != nil {
			return nil, fmt.Errorf("error scanning qualification: %w", err)
		}
		qualifications = append(qualifications, q)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating qualification rows: %w", err)
	}

	return qualifications, nil
}

// GetAllPaginated retrieves qualifications with pagination
func (r *QualificationRepository) GetAllPaginated(offset, limit int) ([]model.Qualification, int, error) {
	// First get the total count
	countQuery := `SELECT COUNT(*) FROM staff_qualifications`
	var totalCount int
	err := r.db.QueryRow(countQuery).Scan(&totalCount)
	if err != nil {
		return nil, 0, fmt.Errorf("error counting qualifications: %w", err)
	}

	// Then get the paginated data
	query := `
        SELECT qualification_id, staff_id, qualification_name, issue_date, 
               expiry_date, issuing_authority, created_at, updated_at
        FROM staff_qualifications
        ORDER BY expiry_date DESC
        LIMIT $1 OFFSET $2
    `

	rows, err := r.db.Query(query, limit, offset)
	if err != nil {
		return nil, 0, fmt.Errorf("error querying paginated qualifications: %w", err)
	}
	defer rows.Close()

	var qualifications []model.Qualification
	for rows.Next() {
		var q model.Qualification
		if err := rows.Scan(
			&q.QualificationID, &q.StaffID, &q.QualificationName, &q.IssueDate,
			&q.ExpiryDate, &q.IssuingAuthority, &q.CreatedAt, &q.UpdatedAt,
		); err != nil {
			return nil, 0, fmt.Errorf("error scanning paginated qualification: %w", err)
		}
		qualifications = append(qualifications, q)
	}

	if err := rows.Err(); err != nil {
		return nil, 0, fmt.Errorf("error iterating paginated qualification rows: %w", err)
	}

	return qualifications, totalCount, nil
}

// GetByStaffIDPaginated retrieves qualifications for a specific staff member with pagination
func (r *QualificationRepository) GetByStaffIDPaginated(staffID int64, offset, limit int) ([]model.Qualification, int, error) {
	// First get the total count for this staff member
	countQuery := `SELECT COUNT(*) FROM staff_qualifications WHERE staff_id = $1`
	var totalCount int
	err := r.db.QueryRow(countQuery, staffID).Scan(&totalCount)
	if err != nil {
		return nil, 0, fmt.Errorf("error counting qualifications for staff: %w", err)
	}

	// Then get the paginated data
	query := `
        SELECT qualification_id, staff_id, qualification_name, issue_date, 
               expiry_date, issuing_authority, created_at, updated_at
        FROM staff_qualifications
        WHERE staff_id = $1
        ORDER BY expiry_date DESC
        LIMIT $2 OFFSET $3
    `

	rows, err := r.db.Query(query, staffID, limit, offset)
	if err != nil {
		return nil, 0, fmt.Errorf("error querying paginated qualifications by staff ID: %w", err)
	}
	defer rows.Close()

	var qualifications []model.Qualification
	for rows.Next() {
		var q model.Qualification
		if err := rows.Scan(
			&q.QualificationID, &q.StaffID, &q.QualificationName, &q.IssueDate,
			&q.ExpiryDate, &q.IssuingAuthority, &q.CreatedAt, &q.UpdatedAt,
		); err != nil {
			return nil, 0, fmt.Errorf("error scanning paginated qualification: %w", err)
		}
		qualifications = append(qualifications, q)
	}

	if err := rows.Err(); err != nil {
		return nil, 0, fmt.Errorf("error iterating paginated qualification rows: %w", err)
	}

	return qualifications, totalCount, nil
}
