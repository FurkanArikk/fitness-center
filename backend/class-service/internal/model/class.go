package model

import (
	"time"
)

// Class represents a fitness class that can be scheduled
type Class struct {
	ClassID     int       `json:"class_id" db:"class_id"`
	ClassName   string    `json:"class_name" db:"class_name"`
	Description string    `json:"description" db:"description"`
	Duration    int       `json:"duration" db:"duration"`
	Capacity    int       `json:"capacity" db:"capacity"`
	Difficulty  string    `json:"difficulty" db:"difficulty"`
	IsActive    bool      `json:"is_active" db:"is_active"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time `json:"updated_at" db:"updated_at"`
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
