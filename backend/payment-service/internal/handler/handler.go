package handler

import (
	"github.com/FurkanArikk/fitness-center/backend/payment-service/internal/repository"
	"github.com/FurkanArikk/fitness-center/backend/payment-service/internal/service"
)

// Handler manages HTTP requests
type Handler struct {
	repo repository.Repository
	svc  service.Service
}

// New creates a new handler
func New(repo repository.Repository) *Handler {
	return &Handler{
		repo: repo,
	}
}

// SetService sets the service for the handler
func (h *Handler) SetService(svc service.Service) {
	h.svc = svc
}
