package service

import (
	"github.com/furkan/fitness-center/backend/facility-service/internal/repository"
)

// Service combines all business services
type Service interface {
	Equipment() EquipmentService
	Facility() FacilityService
	Attendance() AttendanceService
}

// service implements Service interface
type service struct {
	equipmentService  EquipmentService
	facilityService   FacilityService
	attendanceService AttendanceService
}

// New creates a new service
func New(repo repository.Repository) Service {
	return &service{
		equipmentService:  NewEquipmentService(repo),
		facilityService:   NewFacilityService(repo),
		attendanceService: NewAttendanceService(repo),
	}
}

// Equipment returns the equipment service
func (s *service) Equipment() EquipmentService {
	return s.equipmentService
}

// Facility returns the facility service
func (s *service) Facility() FacilityService {
	return s.facilityService
}

// Attendance returns the attendance service
func (s *service) Attendance() AttendanceService {
	return s.attendanceService
}
