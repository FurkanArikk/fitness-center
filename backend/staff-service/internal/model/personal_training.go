package model

import (
	"context"
	"time"
)

// PersonalTraining represents a personal training session between a trainer and a member
type PersonalTraining struct {
	SessionID   int64     `json:"session_id" gorm:"column:session_id;primaryKey;autoIncrement"`
	MemberID    int64     `json:"member_id" gorm:"column:member_id;not null"`
	TrainerID   int64     `json:"trainer_id" gorm:"column:trainer_id;not null"`
	SessionDate time.Time `json:"session_date" gorm:"column:session_date;not null"`
	StartTime   string    `json:"start_time" gorm:"column:start_time;type:time;not null"` // Using string as it's TIME in PostgreSQL (HH:MM:SS format)
	EndTime     string    `json:"end_time" gorm:"column:end_time;type:time;not null"`     // Using string as it's TIME in PostgreSQL (HH:MM:SS format)
	Notes       string    `json:"notes" gorm:"column:notes;type:text"`
	Status      string    `json:"status" gorm:"column:status;type:varchar(20);default:'scheduled'"`
	Price       float64   `json:"price" gorm:"column:price;type:decimal(10,2)"`
	CreatedAt   time.Time `json:"created_at" gorm:"column:created_at;autoCreateTime"`
	UpdatedAt   time.Time `json:"updated_at" gorm:"column:updated_at;autoUpdateTime"`

	// Optional embedded trainer details
	Trainer *Trainer `json:"trainer,omitempty" gorm:"foreignKey:TrainerID"`
}

// TableName specifies the table name for GORM
func (PersonalTraining) TableName() string {
	return "personal_training"
}

// PersonalTrainingRequest is used for creating or updating a personal training session
type PersonalTrainingRequest struct {
	MemberID    int64     `json:"member_id" binding:"required"`
	TrainerID   int64     `json:"trainer_id" binding:"required"`
	SessionDate time.Time `json:"session_date" binding:"required"`
	StartTime   string    `json:"start_time" binding:"required"`
	EndTime     string    `json:"end_time" binding:"required"`
	Notes       string    `json:"notes"`
	Status      string    `json:"status"`
	Price       float64   `json:"price" binding:"min=0"`
}

// PersonalTrainingRepository defines the methods to interact with personal training data
type PersonalTrainingRepository interface {
	GetAll(ctx context.Context) ([]PersonalTraining, error)
	GetAllPaginated(ctx context.Context, offset, limit int) ([]PersonalTraining, int, error)
	GetByID(ctx context.Context, id int64) (*PersonalTraining, error)
	GetByMemberID(ctx context.Context, memberID int64) ([]PersonalTraining, error)
	GetByTrainerID(ctx context.Context, trainerID int64) ([]PersonalTraining, error)
	GetByDateRange(ctx context.Context, startDate, endDate time.Time) ([]PersonalTraining, error)
	GetByStatus(ctx context.Context, status string) ([]PersonalTraining, error)
	GetByStatusAndDate(ctx context.Context, status string, date time.Time) ([]PersonalTraining, error)
	Create(ctx context.Context, req *PersonalTrainingRequest) (*PersonalTraining, error)
	Update(ctx context.Context, id int64, req *PersonalTrainingRequest) (*PersonalTraining, error)
	Delete(ctx context.Context, id int64) error
	GetWithTrainerDetails(ctx context.Context, id int64) (*PersonalTraining, error)
}

// PersonalTrainingService defines the business logic for personal training operations
type PersonalTrainingService interface {
	GetAll(ctx context.Context) ([]PersonalTraining, error)
	GetAllPaginated(ctx context.Context, offset, limit int) ([]PersonalTraining, int, error)
	GetByID(ctx context.Context, id int64) (*PersonalTraining, error)
	GetByMemberID(ctx context.Context, memberID int64) ([]PersonalTraining, error)
	GetByTrainerID(ctx context.Context, trainerID int64) ([]PersonalTraining, error)
	GetByDateRange(ctx context.Context, startDate, endDate time.Time) ([]PersonalTraining, error)
	GetByStatus(ctx context.Context, status string) ([]PersonalTraining, error)
	GetByStatusAndDate(ctx context.Context, status string, date time.Time) ([]PersonalTraining, error)
	Create(ctx context.Context, training *PersonalTraining) (*PersonalTraining, error)
	Update(ctx context.Context, training *PersonalTraining) (*PersonalTraining, error)
	Delete(ctx context.Context, id int64) error
	GetWithTrainerDetails(ctx context.Context, id int64) (*PersonalTraining, error)
	ScheduleSession(ctx context.Context, training *PersonalTraining) (*PersonalTraining, error)
	CancelSession(ctx context.Context, id int64) error
	CompleteSession(ctx context.Context, id int64) error
}
