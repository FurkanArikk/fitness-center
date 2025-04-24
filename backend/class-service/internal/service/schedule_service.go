package service

import (
	"context"
	"errors"

	"github.com/FurkanArikk/fitness-center/backend/class-service/internal/model"
	"github.com/FurkanArikk/fitness-center/backend/class-service/internal/repository"
)

// ScheduleServiceImpl implements ScheduleService interface
type ScheduleServiceImpl struct {
	repo      repository.ScheduleRepository
	classRepo repository.ClassRepository
}

// NewScheduleService creates a new ScheduleService
func NewScheduleService(repo repository.ScheduleRepository, classRepo repository.ClassRepository) ScheduleService {
	return &ScheduleServiceImpl{
		repo:      repo,
		classRepo: classRepo,
	}
}

// GetSchedules returns all schedules
func (s *ScheduleServiceImpl) GetSchedules(ctx context.Context, status string) ([]model.ScheduleResponse, error) {
	return s.repo.GetAll(ctx, status)
}

// GetScheduleByID returns a schedule by its ID
func (s *ScheduleServiceImpl) GetScheduleByID(ctx context.Context, id int) (model.ScheduleResponse, error) {
	return s.repo.GetByID(ctx, id)
}

// GetSchedulesByClassID returns schedules for a specific class
func (s *ScheduleServiceImpl) GetSchedulesByClassID(ctx context.Context, classID int) ([]model.ScheduleResponse, error) {
	return s.repo.GetByClassID(ctx, classID)
}

// CreateSchedule creates a new schedule
func (s *ScheduleServiceImpl) CreateSchedule(ctx context.Context, req model.ScheduleRequest) (model.Schedule, error) {
	// Check if class exists and is active
	class, err := s.classRepo.GetByID(ctx, req.ClassID)
	if err != nil {
		return model.Schedule{}, err
	}

	if !class.IsActive {
		return model.Schedule{}, errors.New("cannot schedule an inactive class")
	}

	// Default status to active if not provided
	if req.Status == "" {
		req.Status = "active"
	}

	schedule := model.Schedule{
		ClassID:   req.ClassID,
		TrainerID: req.TrainerID,
		RoomID:    req.RoomID,
		StartTime: req.StartTime,
		EndTime:   req.EndTime,
		DayOfWeek: req.DayOfWeek,
		Status:    req.Status,
	}

	return s.repo.Create(ctx, schedule)
}

// UpdateSchedule updates an existing schedule
func (s *ScheduleServiceImpl) UpdateSchedule(ctx context.Context, id int, req model.ScheduleRequest) (model.Schedule, error) {
	// Check if class exists and is active
	class, err := s.classRepo.GetByID(ctx, req.ClassID)
	if err != nil {
		return model.Schedule{}, err
	}

	if !class.IsActive {
		return model.Schedule{}, errors.New("cannot schedule an inactive class")
	}

	schedule := model.Schedule{
		ClassID:   req.ClassID,
		TrainerID: req.TrainerID,
		RoomID:    req.RoomID,
		StartTime: req.StartTime,
		EndTime:   req.EndTime,
		DayOfWeek: req.DayOfWeek,
		Status:    req.Status,
	}

	return s.repo.Update(ctx, id, schedule)
}

// DeleteSchedule deletes a schedule
func (s *ScheduleServiceImpl) DeleteSchedule(ctx context.Context, id int) error {
	// Check if schedule has any bookings
	hasBookings, err := s.repo.HasBookings(ctx, id)
	if err != nil {
		return err
	}

	if hasBookings {
		return errors.New("cannot delete schedule with existing bookings")
	}

	return s.repo.Delete(ctx, id)
}
