package model

import (
	"context"
	"time"
)

// Schedule represents a scheduled class session
type Schedule struct {
	ScheduleID int       `json:"schedule_id" gorm:"column:schedule_id;primaryKey;autoIncrement"`
	ClassID    int       `json:"class_id" gorm:"column:class_id;not null;index"`
	TrainerID  int       `json:"trainer_id" gorm:"column:trainer_id;not null;index"`
	RoomID     int       `json:"room_id" gorm:"column:room_id;not null;index"`
	StartTime  string    `json:"start_time" gorm:"column:start_time;type:time;not null"`
	EndTime    string    `json:"end_time" gorm:"column:end_time;type:time;not null"`
	DayOfWeek  string    `json:"day_of_week" gorm:"column:day_of_week;type:varchar(10);not null"`
	Status     string    `json:"status" gorm:"column:status;type:varchar(20);default:'active'"`
	CreatedAt  time.Time `json:"created_at" gorm:"column:created_at;autoCreateTime"`
	UpdatedAt  time.Time `json:"updated_at" gorm:"column:updated_at;autoUpdateTime"`

	// Relations (optional, for joining data)
	Class *Class `json:"class,omitempty" gorm:"foreignKey:ClassID;references:ClassID"`
}

// TableName specifies the table name for GORM
func (Schedule) TableName() string {
	return "class_schedule"
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

// ScheduleRepository defines the operations for schedule data access
type ScheduleRepository interface {
	GetAll(ctx context.Context, status string) ([]ScheduleResponse, error)
	GetAllPaginated(ctx context.Context, status string, offset, limit int) ([]ScheduleResponse, int, error)
	GetByID(ctx context.Context, id int) (ScheduleResponse, error)
	GetByClassID(ctx context.Context, classID int) ([]ScheduleResponse, error)
	Create(ctx context.Context, schedule Schedule) (Schedule, error)
	Update(ctx context.Context, id int, schedule Schedule) (Schedule, error)
	Delete(ctx context.Context, id int) error
	HasBookings(ctx context.Context, id int) (bool, error)
}

// ScheduleService defines operations for managing schedules
type ScheduleService interface {
	GetSchedules(ctx context.Context, status string) ([]ScheduleResponse, error)
	GetSchedulesPaginated(ctx context.Context, status string, offset, limit int) ([]ScheduleResponse, int, error)
	GetScheduleByID(ctx context.Context, id int) (ScheduleResponse, error)
	GetSchedulesByClassID(ctx context.Context, classID int) ([]ScheduleResponse, error)
	CreateSchedule(ctx context.Context, req ScheduleRequest) (Schedule, error)
	UpdateSchedule(ctx context.Context, id int, req ScheduleRequest) (Schedule, error)
	DeleteSchedule(ctx context.Context, id int) error
}
