package service

import (
	"context"
	"errors"

	"github.com/FurkanArikk/fitness-center/backend/class-service/internal/model"
	"github.com/FurkanArikk/fitness-center/backend/class-service/internal/repository"
)

// ClassServiceImpl implements ClassService interface
type ClassServiceImpl struct {
	repo repository.ClassRepository
}

// NewClassService creates a new ClassService
func NewClassService(repo repository.ClassRepository) ClassService {
	return &ClassServiceImpl{repo: repo}
}

// GetClasses returns all classes
func (s *ClassServiceImpl) GetClasses(ctx context.Context, activeOnly bool) ([]model.Class, error) {
	return s.repo.GetAll(ctx, activeOnly)
}

// GetClassByID returns a class by its ID
func (s *ClassServiceImpl) GetClassByID(ctx context.Context, id int) (model.Class, error) {
	return s.repo.GetByID(ctx, id)
}

// CreateClass creates a new class
func (s *ClassServiceImpl) CreateClass(ctx context.Context, req model.ClassRequest) (model.Class, error) {
	class := model.Class{
		ClassName:   req.ClassName,
		Description: req.Description,
		Duration:    req.Duration,
		Capacity:    req.Capacity,
		Difficulty:  req.Difficulty,
		IsActive:    req.IsActive,
	}

	return s.repo.Create(ctx, class)
}

// UpdateClass updates an existing class
func (s *ClassServiceImpl) UpdateClass(ctx context.Context, id int, req model.ClassRequest) (model.Class, error) {
	class := model.Class{
		ClassName:   req.ClassName,
		Description: req.Description,
		Duration:    req.Duration,
		Capacity:    req.Capacity,
		Difficulty:  req.Difficulty,
		IsActive:    req.IsActive,
	}

	return s.repo.Update(ctx, id, class)
}

// DeleteClass deletes a class
func (s *ClassServiceImpl) DeleteClass(ctx context.Context, id int) error {
	// Check if class is used in any schedule
	exists, err := s.repo.ExistsInSchedule(ctx, id)
	if err != nil {
		return err
	}

	if exists {
		return errors.New("cannot delete class that is used in schedules")
	}

	return s.repo.Delete(ctx, id)
}
