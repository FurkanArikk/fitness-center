package server

import (
	"github.com/FurkanArikk/fitness-center/backend/auth-service/internal/handler"
	"github.com/gin-gonic/gin"
)

// SetupRouter sets up the router for the application
func SetupRouter(handler *handler.Handler) *gin.Engine {
	r := gin.Default()

	// Health check endpoint
	r.GET("/health", handler.Health)

	// Auth routes
	v1 := r.Group("/api/v1")
	{
		auth := v1.Group("/auth")
		{
			auth.POST("/login", handler.Login)
			auth.POST("/register", handler.Register) // New registration endpoint
			auth.POST("/validate", handler.ValidateToken)
			auth.GET("/user", handler.GetUserInfo)
		}
	}

	return r
}
