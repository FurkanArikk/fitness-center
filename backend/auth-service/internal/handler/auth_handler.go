package handler

import (
	"net/http"

	"github.com/FurkanArikk/fitness-center/backend/auth-service/internal/model"
	"github.com/FurkanArikk/fitness-center/backend/auth-service/internal/service"
	"github.com/gin-gonic/gin"
)

// Handler holds all handlers
type Handler struct {
	authService *service.AuthService
}

// NewHandlers creates new handlers
func NewHandlers(authService *service.AuthService) *Handler {
	return &Handler{
		authService: authService,
	}
}

// Login handles user authentication
func (h *Handler) Login(c *gin.Context) {
	var req model.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Geçersiz istek formatı",
			"details": err.Error(),
		})
		return
	}

	loginResp, err := h.authService.Login(req.Username, req.Password)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, loginResp)
}

// ValidateToken handles token validation
func (h *Handler) ValidateToken(c *gin.Context) {
	var req model.ValidateTokenRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Geçersiz istek formatı",
			"details": err.Error(),
		})
		return
	}

	validateResp, err := h.authService.ValidateToken(req.Token)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Token doğrulama hatası",
		})
		return
	}

	c.JSON(http.StatusOK, validateResp)
}

// GetUserInfo extracts user info from Authorization header
func (h *Handler) GetUserInfo(c *gin.Context) {
	authHeader := c.GetHeader("Authorization")
	if authHeader == "" {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Authorization header gerekli",
		})
		return
	}

	// Extract token from "Bearer <token>"
	if len(authHeader) < 7 || authHeader[:7] != "Bearer " {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Geçersiz Authorization header formatı",
		})
		return
	}

	token := authHeader[7:]
	validateResp, err := h.authService.ValidateToken(token)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Token doğrulama hatası",
		})
		return
	}

	if !validateResp.Valid {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Geçersiz token",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"user": validateResp.User,
	})
}

// Health check endpoint
func (h *Handler) Health(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status":  "healthy",
		"service": "auth-service",
	})
}

// Register handles user registration
func (h *Handler) Register(c *gin.Context) {
	var req model.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Geçersiz istek formatı",
			"details": err.Error(),
		})
		return
	}

	// Validate required fields
	if req.Username == "" || req.Password == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Kullanıcı adı ve şifre gerekli",
		})
		return
	}

	// Register the user (service will handle admin limit)
	response, err := h.authService.Register(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Kullanıcı kaydı sırasında hata oluştu",
			"details": err.Error(),
		})
		return
	}

	// If registration failed due to business rules
	if !response.Success {
		c.JSON(http.StatusConflict, gin.H{
			"error":   response.Message,
			"success": false,
		})
		return
	}

	// Success
	c.JSON(http.StatusCreated, response)
}
