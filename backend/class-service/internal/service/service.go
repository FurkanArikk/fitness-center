package service

import (
	"github.com/FurkanArikk/fitness-center/backend/class-service/internal/model"
	"github.com/FurkanArikk/fitness-center/backend/class-service/internal/repository"
)

// Service is a factory for all services
type Service struct {
	ClassService    model.ClassService
	ScheduleService model.ScheduleService
	BookingService  model.BookingService
}

// NewServices creates a new service factory with all services
func NewServices(repo *repository.Repository) *Service {
	return &Service{
		ClassService:    NewClassService(repo.ClassRepo),
		ScheduleService: NewScheduleService(repo.ScheduleRepo, repo.ClassRepo),
		BookingService:  NewBookingService(repo.BookingRepo),
	}
}
