package model

import (
	"time"
)

// PersonalTraining represents a personal training session between a trainer and a member
type PersonalTraining struct {
	SessionID   int64     `json:"session_id" db:"session_id"`
	MemberID    int64     `json:"member_id" db:"member_id"`
	TrainerID   int64     `json:"trainer_id" db:"trainer_id"`
	SessionDate time.Time `json:"session_date" db:"session_date"`
	StartTime   string    `json:"start_time" db:"start_time"` // Using string as it's TIME in PostgreSQL (HH:MM:SS format)
	EndTime     string    `json:"end_time" db:"end_time"`     // Using string as it's TIME in PostgreSQL (HH:MM:SS format)
	Notes       string    `json:"notes" db:"notes"`
	Status      string    `json:"status" db:"status"`
	Price       float64   `json:"price" db:"price"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time `json:"updated_at" db:"updated_at"`

	// Optional embedded trainer details
	Trainer *Trainer `json:"trainer,omitempty" db:"-"`
}

// PersonalTrainingRepository defines the methods to interact with personal training data
type PersonalTrainingRepository interface {
	GetAll() ([]PersonalTraining, error)
	GetAllPaginated(offset, limit int) ([]PersonalTraining, int, error)
	GetByID(id int64) (*PersonalTraining, error)
	GetByMemberID(memberID int64) ([]PersonalTraining, error)
	GetByTrainerID(trainerID int64) ([]PersonalTraining, error)
	GetByDateRange(startDate, endDate time.Time) ([]PersonalTraining, error)
	GetByStatus(status string) ([]PersonalTraining, error)
	GetByStatusAndDate(status string, date time.Time) ([]PersonalTraining, error)
	Create(training *PersonalTraining) (*PersonalTraining, error)
	Update(training *PersonalTraining) (*PersonalTraining, error)
	Delete(id int64) error
	GetWithTrainerDetails(id int64) (*PersonalTraining, error)
}

// PersonalTrainingService defines the business logic for personal training operations
type PersonalTrainingService interface {
	GetAll() ([]PersonalTraining, error)
	GetAllPaginated(offset, limit int) ([]PersonalTraining, int, error)
	GetByID(id int64) (*PersonalTraining, error)
	GetByMemberID(memberID int64) ([]PersonalTraining, error)
	GetByTrainerID(trainerID int64) ([]PersonalTraining, error)
	GetByDateRange(startDate, endDate time.Time) ([]PersonalTraining, error)
	GetByStatus(status string) ([]PersonalTraining, error)
	GetByStatusAndDate(status string, date time.Time) ([]PersonalTraining, error)
	Create(training *PersonalTraining) (*PersonalTraining, error)
	Update(training *PersonalTraining) (*PersonalTraining, error)
	Delete(id int64) error
	GetWithTrainerDetails(id int64) (*PersonalTraining, error)
	ScheduleSession(training *PersonalTraining) (*PersonalTraining, error)
	CancelSession(id int64) error
	CompleteSession(id int64) error
}
