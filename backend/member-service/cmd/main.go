package main

import (
	"log"
	"os"
	"os/signal"
	"strconv"
	"syscall"

	"github.com/FurkanArikk/fitness-center/backend/member-service/internal/config"
	"github.com/FurkanArikk/fitness-center/backend/member-service/internal/db"
	"github.com/FurkanArikk/fitness-center/backend/member-service/internal/handler"
	"github.com/FurkanArikk/fitness-center/backend/member-service/internal/repository"
	"github.com/FurkanArikk/fitness-center/backend/member-service/internal/server"
	"github.com/FurkanArikk/fitness-center/backend/member-service/internal/service"
)

func main() {
	log.Println("Starting member service...")

	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load configuration: %v", err)
	}

	log.Printf("Loaded configuration: server port=%d", cfg.Server.Port)

	// Initialize database connection
	database, err := db.NewPostgresDB(cfg.Database)
	if err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}

	// Initialize repositories using factory
	repos := repository.NewRepositories(database.DB)

	// Initialize services
	memberService := service.NewMemberService(repos.MemberRepo)
	membershipService := service.NewMembershipService(repos.MembershipRepo)
	benefitService := service.NewBenefitService(repos.BenefitRepo)
	memberMembershipService := service.NewMemberMembershipService(repos.MemberMembershipRepo)
	assessmentService := service.NewAssessmentService(repos.AssessmentRepo)

	// Create handlers with services
	h := handler.NewHandler(
		database,
		memberService,
		membershipService,
		memberMembershipService,
		assessmentService,
		benefitService,
	)

	// Setup HTTP server
	srv := server.NewServer(h, strconv.Itoa(cfg.Server.Port))

	// Handle graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	go func() {
		<-quit
		log.Println("Shutting down member service...")
		if err := srv.Shutdown(); err != nil {
			log.Fatalf("Server shutdown error: %v", err)
		}
	}()

	log.Println("Member service is running. Press Ctrl+C to stop.")

	// Start the server
	if err := srv.Start(); err != nil {
		log.Fatalf("Server error: %v", err)
	}
}
