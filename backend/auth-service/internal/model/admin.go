package model

import (
	"time"

	"gorm.io/gorm"
)

// Admin represents an admin user in the database
type Admin struct {
	ID          uint           `gorm:"primaryKey" json:"id"`
	Username    string         `gorm:"uniqueIndex;not null" json:"username"`
	Password    string         `gorm:"not null" json:"-"`
	Email       string         `gorm:"uniqueIndex" json:"email"`
	IsActive    bool           `gorm:"default:true" json:"is_active"`
	LastLoginAt *time.Time     `json:"last_login_at"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

// TableName specifies the table name for GORM
func (Admin) TableName() string {
	return "admins"
}
