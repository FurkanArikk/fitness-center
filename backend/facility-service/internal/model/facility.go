package model

import (
	"time"
)

// Facility represents a fitness facility or area
type Facility struct {
	FacilityID  int       `json:"facility_id" db:"facility_id"`
	Name        string    `json:"name" db:"name"`
	Description string    `json:"description" db:"description"`
	Capacity    int       `json:"capacity" db:"capacity"`
	Status      string    `json:"status" db:"status"`
	OpeningHour time.Time `json:"opening_hour" db:"opening_hour"`
	ClosingHour time.Time `json:"closing_hour" db:"closing_hour"`
	IsDeleted   bool      `json:"is_deleted" db:"is_deleted"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time `json:"updated_at" db:"updated_at"`
}
