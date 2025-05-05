package server

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/furkan/fitness-center/backend/api-gateway/internal/config"
	"github.com/furkan/fitness-center/backend/api-gateway/internal/middleware"
	"github.com/gin-gonic/gin"
)

// Server, API Gateway sunucusunu temsil eder
type Server struct {
	router *gin.Engine
	config *config.Config
	server *http.Server
}

// New, belirtilen yapılandırmayla yeni bir Server oluşturur
func New(cfg *config.Config) *Server {
	router := gin.Default()

	// Temel middleware'leri ekle
	router.Use(middleware.Logger())
	router.Use(middleware.CORS())
	router.Use(middleware.RequestID())

	// HTTP sunucusunu yapılandır
	server := &http.Server{
		Addr:         fmt.Sprintf(":%d", cfg.Server.Port),
		Handler:      router,
		ReadTimeout:  cfg.Server.ReadTimeout,
		WriteTimeout: cfg.Server.WriteTimeout,
		IdleTimeout:  cfg.Server.IdleTimeout,
	}

	return &Server{
		router: router,
		config: cfg,
		server: server,
	}
}

// Start, API Gateway sunucusunu başlatır
func (s *Server) Start() error {
	// Health check endpoint'i ekle
	s.router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":  "up",
			"service": "api-gateway",
			"time":    time.Now().Format(time.RFC3339),
		})
	})

	// Router'i yapılandır
	SetupRouter(s.router, s.config)

	// Sunucuyu başlat
	go func() {
		log.Printf("API Gateway %d portundan çalışmaya başladı", s.config.Server.Port)
		if err := s.server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Sunucu çalıştırılamadı: %v", err)
		}
	}()

	// Graceful shutdown için sinyal dinleme
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("Sunucu kapatılıyor...")

	// Sunucuyu kapat
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := s.server.Shutdown(ctx); err != nil {
		return fmt.Errorf("sunucu kapatılamadı: %w", err)
	}

	log.Println("Sunucu güvenli bir şekilde kapatıldı")
	return nil
}
