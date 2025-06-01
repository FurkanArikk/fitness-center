package middleware

import (
    "net/http"
    "strings"

    "github.com/FurkanArikk/fitness-center/backend/auth-service/internal/service"
    "github.com/FurkanArikk/fitness-center/backend/auth-service/pkg/dto"
    "github.com/gin-gonic/gin"
)

// AuthMiddleware creates a middleware for JWT authentication
func AuthMiddleware(authService *service.AuthService) gin.HandlerFunc {
    return func(c *gin.Context) {
        // Get token from Authorization header
        authHeader := c.GetHeader("Authorization")
        if authHeader == "" {
            c.JSON(http.StatusUnauthorized, dto.ErrorResponse{
                Error: "Authorization header is required",
            })
            c.Abort()
            return
        }

        // Check Bearer prefix
        const bearerPrefix = "Bearer "
        if !strings.HasPrefix(authHeader, bearerPrefix) {
            c.JSON(http.StatusUnauthorized, dto.ErrorResponse{
                Error: "Invalid authorization format",
            })
            c.Abort()
            return
        }

        // Extract token
        token := strings.TrimPrefix(authHeader, bearerPrefix)

        // Validate token
        claims, err := authService.ValidateToken(token)
        if err != nil {
            c.JSON(http.StatusUnauthorized, dto.ErrorResponse{
                Error: "Invalid or expired token",
            })
            c.Abort()
            return
        }

        // Store user info in context
        c.Set("username", claims.Username)
        c.Next()
    }
}
