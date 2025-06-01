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

// CreateAdmin handles creating a new admin user
func (h *AuthHandler) CreateAdmin(c *gin.Context) {
	var req dto.CreateAdminRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error: "Invalid request format",
		})
		return
	}

	// Validate required fields
	if req.Username == "" || req.Password == "" || req.Email == "" {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error: "Username, password, and email are required",
		})
		return
	}

	err := h.authService.CreateInitialAdmin(req.Username, req.Password, req.Email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error: err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, dto.SuccessResponse{
		Message: "Admin user created successfully",
	})
}

// UpdateAdminPassword handles updating admin password
func (h *AuthHandler) UpdateAdminPassword(c *gin.Context) {
	var req dto.UpdatePasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error: "Invalid request format",
		})
		return
	}

	// Validate required fields
	if req.Username == "" || req.CurrentPassword == "" || req.NewPassword == "" {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error: "Username, current password, and new password are required",
		})
		return
	}

	err := h.authService.UpdatePassword(req.Username, req.CurrentPassword, req.NewPassword)
	if err != nil {
		c.JSON(http.StatusUnauthorized, dto.ErrorResponse{
			Error: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, dto.SuccessResponse{
		Message: "Password updated successfully",
	})
}

// ListAdmins handles listing all admin users
func (h *AuthHandler) ListAdmins(c *gin.Context) {
	admins, err := h.authService.ListAdmins()
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error: err.Error(),
		})
		return
	}

	// Convert to response format
	var adminResponses []dto.AdminResponse
	for _, admin := range admins {
		adminResponse := dto.AdminResponse{
			ID:        admin.ID,
			Username:  admin.Username,
			Email:     admin.Email,
			IsActive:  admin.IsActive,
			CreatedAt: admin.CreatedAt.Format("2006-01-02T15:04:05Z"),
		}
		if admin.LastLoginAt != nil {
			adminResponse.LastLoginAt = admin.LastLoginAt.Format("2006-01-02T15:04:05Z")
		}
		adminResponses = append(adminResponses, adminResponse)
	}

	c.JSON(http.StatusOK, dto.ListAdminsResponse{
		Admins: adminResponses,
	})
}

// DeleteAdmin handles deactivating an admin user
func (h *AuthHandler) DeleteAdmin(c *gin.Context) {
	username := c.Param("username")
	if username == "" {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error: "Username is required",
		})
		return
	}

	err := h.authService.DeactivateAdmin(username)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, dto.SuccessResponse{
		Message: "Admin user deactivated successfully",
	})
}
