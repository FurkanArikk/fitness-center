package postgres

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/furkan/fitness-center/backend/facility-service/internal/model"
	"github.com/furkan/fitness-center/backend/facility-service/internal/repository"
	"github.com/jmoiron/sqlx"
)

type attendanceRepository struct {
	db *sqlx.DB
}

// NewAttendanceRepository creates a new attendance repository
func NewAttendanceRepository(db *sqlx.DB) repository.AttendanceRepository {
	return &attendanceRepository{db: db}
}

// Create adds a new attendance record
func (r *attendanceRepository) Create(ctx context.Context, attendance *model.Attendance) (*model.Attendance, error) {
	query := `
		INSERT INTO attendance (
			member_id, check_in_time, facility_id
		) VALUES (
			$1, $2, $3
		) RETURNING attendance_id, date, created_at, updated_at
	`

	err := r.db.QueryRowContext(
		ctx,
		query,
		attendance.MemberID,
		attendance.CheckInTime,
		attendance.FacilityID,
	).Scan(
		&attendance.AttendanceID,
		&attendance.Date,
		&attendance.CreatedAt,
		&attendance.UpdatedAt,
	)

	if err != nil {
		return nil, fmt.Errorf("creating attendance: %w", err)
	}

	return attendance, nil
}

// GetByID retrieves attendance by ID
func (r *attendanceRepository) GetByID(ctx context.Context, id int) (*model.Attendance, error) {
	attendance := &model.Attendance{}

	query := `SELECT * FROM attendance WHERE attendance_id = $1`

	if err := r.db.GetContext(ctx, attendance, query, id); err != nil {
		return nil, fmt.Errorf("getting attendance by ID: %w", err)
	}

	return attendance, nil
}

// Update updates an attendance record
func (r *attendanceRepository) Update(ctx context.Context, attendance *model.Attendance) (*model.Attendance, error) {
	query := `
		UPDATE attendance SET
			member_id = $1,
			check_in_time = $2,
			check_out_time = $3,
			facility_id = $4,
			updated_at = NOW()
		WHERE attendance_id = $5
		RETURNING updated_at
	`

	err := r.db.QueryRowContext(
		ctx,
		query,
		attendance.MemberID,
		attendance.CheckInTime,
		attendance.CheckOutTime,
		attendance.FacilityID,
		attendance.AttendanceID,
	).Scan(&attendance.UpdatedAt)

	if err != nil {
		return nil, fmt.Errorf("updating attendance: %w", err)
	}

	return attendance, nil
}

// Delete removes an attendance record
func (r *attendanceRepository) Delete(ctx context.Context, id int) error {
	query := `DELETE FROM attendance WHERE attendance_id = $1`

	result, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return fmt.Errorf("deleting attendance: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("checking rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("attendance with ID %d not found", id)
	}

	return nil
}

// List retrieves attendance records with filters
func (r *attendanceRepository) List(ctx context.Context, filter map[string]interface{}, page, pageSize int) ([]*model.Attendance, int, error) {
	where := []string{}
	args := []interface{}{}
	argID := 1

	for key, value := range filter {
		where = append(where, fmt.Sprintf("%s = $%d", key, argID))
		args = append(args, value)
		argID++
	}

	whereClause := ""
	if len(where) > 0 {
		whereClause = "WHERE " + strings.Join(where, " AND ")
	}

	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM attendance %s", whereClause)

	var total int
	if err := r.db.GetContext(ctx, &total, countQuery, args...); err != nil {
		return nil, 0, fmt.Errorf("counting attendance: %w", err)
	}

	offset := (page - 1) * pageSize
	args = append(args, pageSize, offset)

	query := fmt.Sprintf(`
		SELECT * FROM attendance 
		%s
		ORDER BY check_in_time DESC
		LIMIT $%d OFFSET $%d
	`, whereClause, argID, argID+1)

	var attendance []*model.Attendance
	if err := r.db.SelectContext(ctx, &attendance, query, args...); err != nil {
		return nil, 0, fmt.Errorf("listing attendance: %w", err)
	}

	return attendance, total, nil
}

// ListByMemberID retrieves attendance by member ID
func (r *attendanceRepository) ListByMemberID(ctx context.Context, memberID int, page, pageSize int) ([]*model.Attendance, int, error) {
	return r.List(ctx, map[string]interface{}{"member_id": memberID}, page, pageSize)
}

// ListByFacilityID retrieves attendance by facility ID
func (r *attendanceRepository) ListByFacilityID(ctx context.Context, facilityID int, page, pageSize int) ([]*model.Attendance, int, error) {
	return r.List(ctx, map[string]interface{}{"facility_id": facilityID}, page, pageSize)
}

// ListByDate retrieves attendance by date
func (r *attendanceRepository) ListByDate(ctx context.Context, date string, page, pageSize int) ([]*model.Attendance, int, error) {
	return r.List(ctx, map[string]interface{}{"date": date}, page, pageSize)
}

// CheckOut updates an attendance record with check-out time
func (r *attendanceRepository) CheckOut(ctx context.Context, attendanceID int, checkOutTime time.Time) error {
	query := `
		UPDATE attendance SET
			check_out_time = $1,
			updated_at = NOW()
		WHERE attendance_id = $2
	`

	result, err := r.db.ExecContext(ctx, query, checkOutTime, attendanceID)
	if err != nil {
		return fmt.Errorf("updating check-out time: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("checking rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("attendance with ID %d not found", attendanceID)
	}

	return nil
}
