package handler

import (
	"github.com/gorilla/mux"
)

// RegisterHandlers registers all handlers with the router
func RegisterHandlers(
	router *mux.Router,
	staffHandler *StaffHandler,
	qualificationHandler *QualificationHandler,
	trainerHandler *TrainerHandler,
	trainingHandler *TrainingHandler,
) {
	// Register all routes
	staffHandler.RegisterRoutes(router)
	qualificationHandler.RegisterRoutes(router)
	trainerHandler.RegisterRoutes(router)
	trainingHandler.RegisterRoutes(router)
}
