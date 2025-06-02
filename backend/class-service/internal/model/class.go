package model

import (
	"context"
	"time"
)

// Class represents a fitness class that can be scheduled
type Class struct {
	ClassID     int       `json:"class_id" gorm:"column:class_id;primaryKey;autoIncrement"`
	ClassName   string    `json:"class_name" gorm:"column:class_name;type:varchar(50);not null"`
	Description string    `json:"description" gorm:"column:description;type:varchar(255)"`
	Duration    int       `json:"duration" gorm:"column:duration;not null"`
	Capacity    int       `json:"capacity" gorm:"column:capacity;not null"`
	Difficulty  string    `json:"difficulty" gorm:"column:difficulty;type:varchar(20)"`
	IsActive    bool      `json:"is_active" gorm:"column:is_active;default:true"`
	CreatedAt   time.Time `json:"created_at" gorm:"column:created_at;autoCreateTime"`
	UpdatedAt   time.Time `json:"updated_at" gorm:"column:updated_at;autoUpdateTime"`

	// One-to-many relationship - a class can have many schedules
	Schedules []Schedule `json:"schedules,omitempty" gorm:"foreignKey:ClassID"`
}

// TableName specifies the table name for GORM
func (Class) TableName() string {
	return "classes"
}

// ClassRequest is used for creating or updating a class
type ClassRequest struct {
	ClassName   string `json:"class_name" binding:"required"`
	Description string `json:"description"`
	Duration    int    `json:"duration" binding:"required,min=5"`
	Capacity    int    `json:"capacity" binding:"required,min=1"`
	Difficulty  string `json:"difficulty"`
	IsActive    bool   `json:"is_active"`
}

// ClassRepository defines the operations for class data access
type ClassRepository interface {
	GetAll(ctx context.Context, activeOnly bool) ([]Class, error)
	GetAllPaginated(ctx context.Context, activeOnly bool, offset, limit int) ([]Class, int, error)
	GetByID(ctx context.Context, id int) (Class, error)
	Create(ctx context.Context, class Class) (Class, error)
	Update(ctx context.Context, id int, class Class) (Class, error)
	Delete(ctx context.Context, id int) error
	ExistsInSchedule(ctx context.Context, id int) (bool, error)
}

// ClassService defines operations for managing classes
type ClassService interface {
	GetClasses(ctx context.Context, activeOnly bool) ([]Class, error)
	GetClassesPaginated(ctx context.Context, activeOnly bool, offset, limit int) ([]Class, int, error)
	GetClassByID(ctx context.Context, id int) (Class, error)
	CreateClass(ctx context.Context, req ClassRequest) (Class, error)
	UpdateClass(ctx context.Context, id int, req ClassRequest) (Class, error)
	DeleteClass(ctx context.Context, id int) error
}
