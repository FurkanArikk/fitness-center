package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/FurkanArikk/fitness-center/backend/auth-service/internal/config"
	"github.com/FurkanArikk/fitness-center/backend/auth-service/internal/handler"
	"github.com/FurkanArikk/fitness-center/backend/auth-service/internal/service"
	"github.com/gin-gonic/gin"
)

func main() {
	// Logging settings
	log.SetFlags(log.LstdFlags | log.Lshortfile)
	log.Println("Starting auth service...")

	// Load configuration
	cfg := config.LoadConfig()
	log.Printf("Configuration loaded: server port=%d", cfg.Server.Port)

	// Initialize auth service
	authService := service.NewAuthService(
		cfg.JWT.Secret,
		cfg.JWT.ExpireHours,
		cfg.Auth.AdminUsername,
		cfg.Auth.AdminPassword,
	)

	// Initialize handlers
	authHandler := handler.NewAuthHandler(authService)

	// Setup Gin router
	gin.SetMode(gin.ReleaseMode)
	router := gin.Default()

	// CORS middleware
	router.Use(func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Origin, Content-Type, Authorization")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	// Health check endpoint
	router.GET("/health", authHandler.Health)

	// Auth endpoints
	v1 := router.Group("/api/v1")
	{
		v1.POST("/login", authHandler.Login)
		v1.GET("/auth", authHandler.ForwardAuth) // Traefik ForwardAuth endpoint
	}

	// Start HTTP server
	server := &http.Server{
		Addr:         fmt.Sprintf("%s:%d", cfg.Server.Host, cfg.Server.Port),
		Handler:      router,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 10 * time.Second,
		IdleTimeout:  30 * time.Second,
	}

	// Signal handling for graceful shutdown
	go func() {
		log.Printf("Auth service started at %s:%d", cfg.Server.Host, cfg.Server.Port)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Failed to start server: %v", err)
		}
	}()

	// Graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("Shutting down auth service...")
}
