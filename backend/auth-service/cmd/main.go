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
	"github.com/FurkanArikk/fitness-center/backend/auth-service/internal/database"
	"github.com/FurkanArikk/fitness-center/backend/auth-service/internal/handler"
	"github.com/FurkanArikk/fitness-center/backend/auth-service/internal/middleware"
	"github.com/FurkanArikk/fitness-center/backend/auth-service/internal/repository"
	"github.com/FurkanArikk/fitness-center/backend/auth-service/internal/service"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// Load .env file
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	// Logging settings
	log.SetFlags(log.LstdFlags | log.Lshortfile)
	log.Println("Starting auth service...")

	// Load configuration
	cfg := config.LoadConfig()
	log.Printf("Configuration loaded: server port=%d", cfg.Server.Port)

	// Initialize database
	db, err := database.Connect(&cfg.Database)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	// Run migrations
	if err := database.Migrate(db); err != nil {
		log.Fatalf("Failed to run migrations: %v", err)
	}

	// Initialize repositories
	adminRepo := repository.NewAdminRepository(db)

	// Initialize auth service
	authService := service.NewAuthService(
		cfg.JWT.Secret,
		cfg.JWT.ExpireHours,
		adminRepo,
	)

	// Create initial admin user from config
	if err := authService.CreateInitialAdmin(
		cfg.Auth.AdminUsername,
		cfg.Auth.AdminPassword,
		"admin@fitness-center.local",
	); err != nil {
		log.Printf("Warning: Failed to create initial admin: %v", err)
	}

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

		// Protected admin management endpoints
		admin := v1.Group("/admin")
		admin.Use(middleware.AuthMiddleware(authService))
		{
			admin.POST("/create", authHandler.CreateAdmin)
			admin.PUT("/password", authHandler.UpdateAdminPassword)
			admin.GET("/list", authHandler.ListAdmins)
			admin.DELETE("/:username", authHandler.DeleteAdmin)
		}
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
