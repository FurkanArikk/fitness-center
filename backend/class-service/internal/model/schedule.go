package model

import (
	"time"
)

// Schedule represents a scheduled class session
type Schedule struct {
	ScheduleID int       `json:"schedule_id" db:"schedule_id"`
	ClassID    int       `json:"class_id" db:"class_id"`
	TrainerID  int       `json:"trainer_id" db:"trainer_id"`
	RoomID     int       `json:"room_id" db:"room_id"`
	StartTime  string    `json:"start_time" db:"start_time"`
	EndTime    string    `json:"end_time" db:"end_time"`
	DayOfWeek  string    `json:"day_of_week" db:"day_of_week"`
	Status     string    `json:"status" db:"status"`
	CreatedAt  time.Time `json:"created_at" db:"created_at"`
	UpdatedAt  time.Time `json:"updated_at" db:"updated_at"`

	// Relations (optional, for joining data)
	Class *Class `json:"class,omitempty"`
}

// ScheduleRequest is used for creating or updating a schedule
type ScheduleRequest struct {
	ClassID   int    `json:"class_id" binding:"required"`
	TrainerID int    `json:"trainer_id" binding:"required"`
	RoomID    int    `json:"room_id" binding:"required"`
	StartTime string `json:"start_time" binding:"required"`
	EndTime   string `json:"end_time" binding:"required"`
	DayOfWeek string `json:"day_of_week" binding:"required,oneof=Monday Tuesday Wednesday Thursday Friday Saturday Sunday"`
	Status    string `json:"status"`
}

// ScheduleResponse includes class details with the schedule
type ScheduleResponse struct {
	Schedule
	ClassName     string `json:"class_name"`
	ClassDuration int    `json:"class_duration"`
}
