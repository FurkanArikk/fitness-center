package postgres

import (
	"context"
	"fmt"
	"strings"

	"github.com/furkan/fitness-center/backend/facility-service/internal/model"
	"github.com/furkan/fitness-center/backend/facility-service/internal/repository"
	"github.com/jmoiron/sqlx"
)

type equipmentRepository struct {
	db *sqlx.DB
}

// NewEquipmentRepository creates a new equipment repository
func NewEquipmentRepository(db *sqlx.DB) repository.EquipmentRepository {
	return &equipmentRepository{db: db}
}

// Create adds a new equipment record
func (r *equipmentRepository) Create(ctx context.Context, equipment *model.Equipment) (*model.Equipment, error) {
	query := `
		INSERT INTO equipment (
			name, description, category, purchase_date, purchase_price, 
			manufacturer, model_number, status, last_maintenance_date, next_maintenance_date
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8, $9, $10
		) RETURNING equipment_id, created_at, updated_at
	`

	err := r.db.QueryRowContext(
		ctx,
		query,
		equipment.Name,
		equipment.Description,
		equipment.Category,
		equipment.PurchaseDate,
		equipment.PurchasePrice,
		equipment.Manufacturer,
		equipment.ModelNumber,
		equipment.Status,
		equipment.LastMaintenanceDate,
		equipment.NextMaintenanceDate,
	).Scan(
		&equipment.EquipmentID,
		&equipment.CreatedAt,
		&equipment.UpdatedAt,
	)

	if err != nil {
		return nil, fmt.Errorf("creating equipment: %w", err)
	}

	return equipment, nil
}

// GetByID retrieves equipment by ID
func (r *equipmentRepository) GetByID(ctx context.Context, id int) (*model.Equipment, error) {
	equipment := &model.Equipment{}

	query := `SELECT * FROM equipment WHERE equipment_id = $1`

	if err := r.db.GetContext(ctx, equipment, query, id); err != nil {
		return nil, fmt.Errorf("getting equipment by ID: %w", err)
	}

	return equipment, nil
}

// Update updates an equipment record
func (r *equipmentRepository) Update(ctx context.Context, equipment *model.Equipment) (*model.Equipment, error) {
	query := `
		UPDATE equipment SET
			name = $1,
			description = $2,
			category = $3,
			purchase_date = $4,
			purchase_price = $5,
			manufacturer = $6,
			model_number = $7,
			status = $8,
			last_maintenance_date = $9,
			next_maintenance_date = $10,
			updated_at = NOW()
		WHERE equipment_id = $11
		RETURNING created_at, updated_at
	`

	err := r.db.QueryRowContext(
		ctx,
		query,
		equipment.Name,
		equipment.Description,
		equipment.Category,
		equipment.PurchaseDate,
		equipment.PurchasePrice,
		equipment.Manufacturer,
		equipment.ModelNumber,
		equipment.Status,
		equipment.LastMaintenanceDate,
		equipment.NextMaintenanceDate,
		equipment.EquipmentID,
	).Scan(&equipment.CreatedAt, &equipment.UpdatedAt)

	if err != nil {
		return nil, fmt.Errorf("updating equipment: %w", err)
	}

	return equipment, nil
}

// Delete removes an equipment record
func (r *equipmentRepository) Delete(ctx context.Context, id int) error {
	query := `DELETE FROM equipment WHERE equipment_id = $1`

	result, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return fmt.Errorf("deleting equipment: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("checking rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("equipment with ID %d not found", id)
	}

	return nil
}

// List retrieves equipment with filters
func (r *equipmentRepository) List(ctx context.Context, filter map[string]interface{}, page, pageSize int) ([]*model.Equipment, int, error) {
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

	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM equipment %s", whereClause)

	var total int
	if err := r.db.GetContext(ctx, &total, countQuery, args...); err != nil {
		return nil, 0, fmt.Errorf("counting equipment: %w", err)
	}

	offset := (page - 1) * pageSize
	args = append(args, pageSize, offset)

	query := fmt.Sprintf(`
		SELECT * FROM equipment 
		%s
		ORDER BY equipment_id
		LIMIT $%d OFFSET $%d
	`, whereClause, argID, argID+1)

	var equipment []*model.Equipment
	if err := r.db.SelectContext(ctx, &equipment, query, args...); err != nil {
		return nil, 0, fmt.Errorf("listing equipment: %w", err)
	}

	return equipment, total, nil
}

// ListByCategory retrieves equipment by category
func (r *equipmentRepository) ListByCategory(ctx context.Context, category string, page, pageSize int) ([]*model.Equipment, int, error) {
	return r.List(ctx, map[string]interface{}{"category": category}, page, pageSize)
}

// ListByStatus retrieves equipment by status
func (r *equipmentRepository) ListByStatus(ctx context.Context, status string, page, pageSize int) ([]*model.Equipment, int, error) {
	return r.List(ctx, map[string]interface{}{"status": status}, page, pageSize)
}

// ListByMaintenanceDue retrieves equipment by next maintenance date
func (r *equipmentRepository) ListByMaintenanceDue(ctx context.Context, date string, page, pageSize int) ([]*model.Equipment, int, error) {
	where := "WHERE next_maintenance_date <= $1"
	args := []interface{}{date}

	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM equipment %s", where)

	var total int
	if err := r.db.GetContext(ctx, &total, countQuery, args...); err != nil {
		return nil, 0, fmt.Errorf("counting equipment: %w", err)
	}

	offset := (page - 1) * pageSize

	query := fmt.Sprintf(`
		SELECT * FROM equipment 
		%s
		ORDER BY next_maintenance_date
		LIMIT $2 OFFSET $3
	`, where)

	var equipment []*model.Equipment
	if err := r.db.SelectContext(ctx, &equipment, query, date, pageSize, offset); err != nil {
		return nil, 0, fmt.Errorf("listing equipment by maintenance: %w", err)
	}

	return equipment, total, nil
}
