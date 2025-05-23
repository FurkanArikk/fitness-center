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

// StaffRepository handles database operations related to staff
type StaffRepository struct {
	db *sql.DB
}

// NewStaffRepository creates a new StaffRepository
func NewStaffRepository(db *sql.DB) *StaffRepository {
	return &StaffRepository{db: db}
}

// GetAll retrieves all staff members from the database
func (r *StaffRepository) GetAll() ([]model.Staff, error) {
	query := `
        SELECT staff_id, first_name, last_name, email, phone, address, 
               position, hire_date, salary, status, created_at, updated_at
        FROM staff
        ORDER BY last_name, first_name
    `

	rows, err := r.db.Query(query)
	if err != nil {
		return nil, fmt.Errorf("error querying staff: %w", err)
	}
	defer rows.Close()

	var staffList []model.Staff
	for rows.Next() {
		var staff model.Staff
		if err := rows.Scan(
			&staff.StaffID, &staff.FirstName, &staff.LastName, &staff.Email,
			&staff.Phone, &staff.Address, &staff.Position, &staff.HireDate,
			&staff.Salary, &staff.Status, &staff.CreatedAt, &staff.UpdatedAt,
		); err != nil {
			return nil, fmt.Errorf("error scanning staff: %w", err)
		}
		staffList = append(staffList, staff)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating staff rows: %w", err)
	}

	return staffList, nil
}

// GetByID retrieves a staff member by ID
func (r *StaffRepository) GetByID(id int64) (*model.Staff, error) {
	query := `
        SELECT staff_id, first_name, last_name, email, phone, address, 
               position, hire_date, salary, status, created_at, updated_at
        FROM staff
        WHERE staff_id = $1
    `

	var staff model.Staff
	err := r.db.QueryRow(query, id).Scan(
		&staff.StaffID, &staff.FirstName, &staff.LastName, &staff.Email,
		&staff.Phone, &staff.Address, &staff.Position, &staff.HireDate,
		&staff.Salary, &staff.Status, &staff.CreatedAt, &staff.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, fmt.Errorf("staff not found: %w", err)
		}
		return nil, fmt.Errorf("error querying staff: %w", err)
	}

	return &staff, nil
}

// Create adds a new staff member to the database
func (r *StaffRepository) Create(staff *model.Staff) (*model.Staff, error) {
	query := `
        INSERT INTO staff (first_name, last_name, email, phone, address, 
                           position, hire_date, salary, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING staff_id, created_at, updated_at
    `

	err := r.db.QueryRow(
		query, staff.FirstName, staff.LastName, staff.Email, staff.Phone,
		staff.Address, staff.Position, staff.HireDate, staff.Salary, staff.Status,
	).Scan(&staff.StaffID, &staff.CreatedAt, &staff.UpdatedAt)

	if err != nil {
		// Check for unique constraint violation
		pqErr, ok := err.(*pq.Error)
		if ok && pqErr.Code == "23505" {
			if strings.Contains(pqErr.Constraint, "staff_email_key") {
				return nil, fmt.Errorf("staff with email '%s' already exists: %w", staff.Email, err)
			}
		}
		return nil, fmt.Errorf("error creating staff: %w", err)
	}

	return staff, nil
}

// Update modifies an existing staff member in the database
func (r *StaffRepository) Update(staff *model.Staff) (*model.Staff, error) {
	query := `
        UPDATE staff
        SET first_name = $1, last_name = $2, email = $3, phone = $4, 
            address = $5, position = $6, hire_date = $7, salary = $8, 
            status = $9, updated_at = $10
        WHERE staff_id = $11
        RETURNING staff_id, first_name, last_name, email, phone, address, 
                 position, hire_date, salary, status, created_at, updated_at
    `

	now := time.Now()
	err := r.db.QueryRow(
		query, staff.FirstName, staff.LastName, staff.Email, staff.Phone,
		staff.Address, staff.Position, staff.HireDate, staff.Salary,
		staff.Status, now, staff.StaffID,
	).Scan(
		&staff.StaffID, &staff.FirstName, &staff.LastName, &staff.Email,
		&staff.Phone, &staff.Address, &staff.Position, &staff.HireDate,
		&staff.Salary, &staff.Status, &staff.CreatedAt, &staff.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, fmt.Errorf("staff not found: %w", err)
		}
		return nil, fmt.Errorf("error updating staff: %w", err)
	}

	return staff, nil
}

// Delete removes a staff member from the database
func (r *StaffRepository) Delete(id int64) error {
	// Instead of deleting, update the status to "Inactive" or "Terminated"
	query := `
		UPDATE staff 
		SET status = 'Terminated', updated_at = NOW() 
		WHERE staff_id = $1
	`

	result, err := r.db.Exec(query, id)
	if err != nil {
		return fmt.Errorf("error updating staff status: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("error checking rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("staff not found")
	}

	return nil
}

// GetByEmail retrieves a staff member by email
func (r *StaffRepository) GetByEmail(email string) (*model.Staff, error) {
	query := `
        SELECT staff_id, first_name, last_name, email, phone, address, 
               position, hire_date, salary, status, created_at, updated_at
        FROM staff
        WHERE email = $1
    `

	var staff model.Staff
	err := r.db.QueryRow(query, email).Scan(
		&staff.StaffID, &staff.FirstName, &staff.LastName, &staff.Email,
		&staff.Phone, &staff.Address, &staff.Position, &staff.HireDate,
		&staff.Salary, &staff.Status, &staff.CreatedAt, &staff.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, fmt.Errorf("staff not found: %w", err)
		}
		return nil, fmt.Errorf("error querying staff: %w", err)
	}

	return &staff, nil
}

// GetByPosition retrieves staff members by position
func (r *StaffRepository) GetByPosition(position string) ([]model.Staff, error) {
	query := `
        SELECT staff_id, first_name, last_name, email, phone, address, 
               position, hire_date, salary, status, created_at, updated_at
        FROM staff
        WHERE position = $1
        ORDER BY last_name, first_name
    `

	rows, err := r.db.Query(query, position)
	if err != nil {
		return nil, fmt.Errorf("error querying staff by position: %w", err)
	}
	defer rows.Close()

	var staffList []model.Staff
	for rows.Next() {
		var staff model.Staff
		if err := rows.Scan(
			&staff.StaffID, &staff.FirstName, &staff.LastName, &staff.Email,
			&staff.Phone, &staff.Address, &staff.Position, &staff.HireDate,
			&staff.Salary, &staff.Status, &staff.CreatedAt, &staff.UpdatedAt,
		); err != nil {
			return nil, fmt.Errorf("error scanning staff: %w", err)
		}
		staffList = append(staffList, staff)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating staff rows: %w", err)
	}

	return staffList, nil
}

// GetByStatus retrieves staff members by status
func (r *StaffRepository) GetByStatus(status string) ([]model.Staff, error) {
	query := `
        SELECT staff_id, first_name, last_name, email, phone, address, 
               position, hire_date, salary, status, created_at, updated_at
        FROM staff
        WHERE status = $1
        ORDER BY last_name, first_name
    `

	rows, err := r.db.Query(query, status)
	if err != nil {
		return nil, fmt.Errorf("error querying staff by status: %w", err)
	}
	defer rows.Close()

	var staffList []model.Staff
	for rows.Next() {
		var staff model.Staff
		if err := rows.Scan(
			&staff.StaffID, &staff.FirstName, &staff.LastName, &staff.Email,
			&staff.Phone, &staff.Address, &staff.Position, &staff.HireDate,
			&staff.Salary, &staff.Status, &staff.CreatedAt, &staff.UpdatedAt,
		); err != nil {
			return nil, fmt.Errorf("error scanning staff: %w", err)
		}
		staffList = append(staffList, staff)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating staff rows: %w", err)
	}

	return staffList, nil
}

// GetAllPaginated retrieves staff members with pagination
func (r *StaffRepository) GetAllPaginated(offset, limit int) ([]model.Staff, int, error) {
	// First get the total count
	countQuery := `SELECT COUNT(*) FROM staff`
	var totalCount int
	err := r.db.QueryRow(countQuery).Scan(&totalCount)
	if err != nil {
		return nil, 0, fmt.Errorf("error counting staff: %w", err)
	}

	// Then get the paginated data
	query := `
        SELECT staff_id, first_name, last_name, email, phone, address, 
               position, hire_date, salary, status, created_at, updated_at
        FROM staff
        ORDER BY last_name, first_name
        LIMIT $1 OFFSET $2
    `

	rows, err := r.db.Query(query, limit, offset)
	if err != nil {
		return nil, 0, fmt.Errorf("error querying paginated staff: %w", err)
	}
	defer rows.Close()

	var staffList []model.Staff
	for rows.Next() {
		var staff model.Staff
		if err := rows.Scan(
			&staff.StaffID, &staff.FirstName, &staff.LastName, &staff.Email,
			&staff.Phone, &staff.Address, &staff.Position, &staff.HireDate,
			&staff.Salary, &staff.Status, &staff.CreatedAt, &staff.UpdatedAt,
		); err != nil {
			return nil, 0, fmt.Errorf("error scanning paginated staff: %w", err)
		}
		staffList = append(staffList, staff)
	}

	if err := rows.Err(); err != nil {
		return nil, 0, fmt.Errorf("error iterating paginated staff rows: %w", err)
	}

	return staffList, totalCount, nil
}
