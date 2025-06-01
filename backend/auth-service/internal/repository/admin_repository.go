package repository

import (
	"time"

	"github.com/FurkanArikk/fitness-center/backend/auth-service/internal/model"
	"gorm.io/gorm"
)

// AdminRepository handles admin database operations
type AdminRepository struct {
	db *gorm.DB
}

// NewAdminRepository creates a new admin repository
func NewAdminRepository(db *gorm.DB) *AdminRepository {
	return &AdminRepository{db: db}
}

// GetByUsername finds an admin by username
func (r *AdminRepository) GetByUsername(username string) (*model.Admin, error) {
	var admin model.Admin
	err := r.db.Where("username = ? AND is_active = ?", username, true).First(&admin).Error
	if err != nil {
		return nil, err
	}
	return &admin, nil
}

// GetByID finds an admin by ID
func (r *AdminRepository) GetByID(id uint) (*model.Admin, error) {
	var admin model.Admin
	err := r.db.First(&admin, id).Error
	if err != nil {
		return nil, err
	}
	return &admin, nil
}

// Create creates a new admin
func (r *AdminRepository) Create(admin *model.Admin) error {
	return r.db.Create(admin).Error
}

// Update updates an admin
func (r *AdminRepository) Update(admin *model.Admin) error {
	return r.db.Save(admin).Error
}

// UpdateLastLogin updates the last login time
func (r *AdminRepository) UpdateLastLogin(id uint) error {
	now := time.Now()
	return r.db.Model(&model.Admin{}).Where("id = ?", id).Update("last_login_at", &now).Error
}

// List returns all active admins
func (r *AdminRepository) List() ([]model.Admin, error) {
	var admins []model.Admin
	err := r.db.Where("is_active = ?", true).Find(&admins).Error
	return admins, err
}
