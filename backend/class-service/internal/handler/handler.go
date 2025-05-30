package handler

import (
	"github.com/FurkanArikk/fitness-center/backend/class-service/internal/db"
	"github.com/FurkanArikk/fitness-center/backend/class-service/internal/model"
	"github.com/FurkanArikk/fitness-center/backend/class-service/internal/service"
)

// ClassHandler handles class-related requests
type ClassHandler struct {
	db      *db.PostgresDB
	service model.ClassService
}

// ScheduleHandler handles schedule-related requests
type ScheduleHandler struct {
	db      *db.PostgresDB
	service model.ScheduleService
}

// BookingHandler handles booking-related requests
type BookingHandler struct {
	db      *db.PostgresDB
	service model.BookingService
}

// Handler provides the interface to the handler functions
type Handler struct {
	db              *db.PostgresDB
	ClassHandler    *ClassHandler
	ScheduleHandler *ScheduleHandler
	BookingHandler  *BookingHandler
}

// NewHandlers creates a new handler instance with the given database connection
func NewHandlers(services *service.Service, db *db.PostgresDB) *Handler {
	handler := &Handler{
		db: db,
	}

	// Initialize sub-handlers with services
	handler.ClassHandler = &ClassHandler{db: db, service: services.ClassService}
	handler.ScheduleHandler = &ScheduleHandler{db: db, service: services.ScheduleService}
	handler.BookingHandler = &BookingHandler{db: db, service: services.BookingService}

	return handler
}
