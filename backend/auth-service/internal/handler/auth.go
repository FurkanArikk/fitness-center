package handler

import (
	"net/http"
	"strings"

	"github.com/FurkanArikk/fitness-center/backend/auth-service/internal/service"
	"github.com/FurkanArikk/fitness-center/backend/auth-service/pkg/dto"
	"github.com/gin-gonic/gin"
)

// AuthHandler handles authentication requests
type AuthHandler struct {
	authService *service.AuthService
}

// NewAuthHandler creates a new auth handler
func NewAuthHandler(authService *service.AuthService) *AuthHandler {
	return &AuthHandler{
		authService: authService,
	}
}

// Login handles user login
func (h *AuthHandler) Login(c *gin.Context) {
	var req dto.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error: "Invalid request format",
		})
		return
	}

	token, err := h.authService.Login(req.Username, req.Password)
	if err != nil {
		c.JSON(http.StatusUnauthorized, dto.ErrorResponse{
			Error: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, dto.LoginResponse{
		Token:   token,
		Message: "Successfully logged in",
	})
}

// ForwardAuth handles Traefik ForwardAuth middleware endpoint
func (h *AuthHandler) ForwardAuth(c *gin.Context) {
	// Get token from Authorization header
	authHeader := c.GetHeader("Authorization")
	if authHeader == "" {
		c.Header("WWW-Authenticate", "Bearer")
		c.JSON(http.StatusUnauthorized, dto.ErrorResponse{
			Error: "Authorization header not found",
		})
		return
	}

	// Check Bearer prefix
	const bearerPrefix = "Bearer "
	if !strings.HasPrefix(authHeader, bearerPrefix) {
		c.Header("WWW-Authenticate", "Bearer")
		c.JSON(http.StatusUnauthorized, dto.ErrorResponse{
			Error: "Invalid authorization format",
		})
		return
	}

	// Extract token
	token := strings.TrimPrefix(authHeader, bearerPrefix)

	// Validate token
	claims, err := h.authService.ValidateToken(token)
	if err != nil {
		c.Header("WWW-Authenticate", "Bearer")
		c.JSON(http.StatusUnauthorized, dto.ErrorResponse{
			Error: "Invalid token",
		})
		return
	}

	// Successful validation - Add required headers for Traefik
	c.Header("X-Forwarded-User", claims.Username)
	c.Status(http.StatusOK)
}

// Health handles system health check
func (h *AuthHandler) Health(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status":  "healthy",
		"service": "auth-service",
	})
}
