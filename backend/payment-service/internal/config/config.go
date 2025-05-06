package config

import (
	"fmt"
	"log"
	"os"
	"path/filepath"
	"strconv"
	"time"

	"github.com/joho/godotenv"
)

// Config holds all configuration for the service
type Config struct {
	ServerPort      int
	PostgresConfig  PostgresConfig
	ShutdownTimeout time.Duration
}

// PostgresConfig holds Postgres connection configuration
type PostgresConfig struct {
	Host     string
	Port     int
	User     string
	Password string
	DBName   string
	SSLMode  string
}

// GetConnectionString returns a connection string for postgres
func (c *PostgresConfig) GetConnectionString() string {
	return fmt.Sprintf(
		"host=%s port=%d user=%s password=%s dbname=%s sslmode=%s",
		c.Host, c.Port, c.User, c.Password, c.DBName, c.SSLMode,
	)
}

// LoadConfig loads configuration from environment variables
func LoadConfig() (*Config, error) {
	// First try to find the service-specific .env file
	serviceEnvPath := findServiceEnvFile()
	if serviceEnvPath != "" {
		log.Printf("Loading environment variables from service-specific file: %s", serviceEnvPath)
		if err := godotenv.Load(serviceEnvPath); err != nil {
			log.Printf("Warning: Error loading service-specific .env file: %v", err)
		}
	} else {
		// Fall back to root .env file
		rootEnvPath := findRootEnvFile()
		if rootEnvPath != "" {
			log.Printf("Loading environment variables from root file: %s", rootEnvPath)
			if err := godotenv.Load(rootEnvPath); err != nil {
				log.Printf("Warning: Error loading root .env file: %v", err)
			}
		} else {
			log.Printf("No .env file found, using environment variables")
		}
	}

	// Use PAYMENT_SERVICE_PORT with fallback to default 8003
	serverPortStr := getEnv("PAYMENT_SERVICE_PORT", "8003")
	serverPort, err := strconv.Atoi(serverPortStr)
	if err != nil {
		return nil, fmt.Errorf("parsing server port: %w", err)
	}

	// Use PAYMENT_SERVICE_DB_PORT with fallback to default 5434
	dbPortStr := getEnv("PAYMENT_SERVICE_DB_PORT", "5434")
	dbPort, err := strconv.Atoi(dbPortStr)
	if err != nil {
		return nil, fmt.Errorf("parsing db port: %w", err)
	}

	// Default shutdown timeout is 5 seconds
	shutdownTimeoutStr := getEnv("PAYMENT_SERVICE_SHUTDOWN_TIMEOUT", "5s")
	shutdownTimeout, err := time.ParseDuration(shutdownTimeoutStr)
	if err != nil {
		return nil, fmt.Errorf("parsing shutdown timeout: %w", err)
	}

	return &Config{
		ServerPort: serverPort,
		PostgresConfig: PostgresConfig{
			Host:     getEnv("DB_HOST", "localhost"),
			Port:     dbPort,
			User:     getEnv("DB_USER", "fitness_user"),
			Password: getEnv("DB_PASSWORD", "admin"),
			DBName:   getEnv("PAYMENT_SERVICE_DB_NAME", "fitness_payment_db"),
			SSLMode:  getEnv("DB_SSLMODE", "disable"),
		},
		ShutdownTimeout: shutdownTimeout,
	}, nil
}

// findServiceEnvFile looks for the service-specific .env file
func findServiceEnvFile() string {
	// Check for service-specific .env file at the exact location
	serviceEnvPath := "/home/furkan/work/fitness-center/backend/payment-service/.env"
	if _, err := os.Stat(serviceEnvPath); err == nil {
		return serviceEnvPath
	}

	// Start from current working directory
	dir, err := os.Getwd()
	if err != nil {
		return ""
	}

	// Try to find .env in the current directory
	envPath := filepath.Join(dir, ".env")
	if _, err := os.Stat(envPath); err == nil {
		return envPath
	}

	return ""
}

// findRootEnvFile searches for a .env file in parent directories
func findRootEnvFile() string {
	// Start from current working directory
	dir, err := os.Getwd()
	if err != nil {
		return ""
	}

	// Try project root (backend/payment-service/..)
	envPath := filepath.Join(dir, "..", "..", ".env")
	if _, err := os.Stat(envPath); err == nil {
		return envPath
	}

	// Traverse up to find a .env file
	for {
		envPath := filepath.Join(dir, ".env")
		if _, err := os.Stat(envPath); err == nil {
			return envPath
		}

		// Go up one level
		parentDir := filepath.Dir(dir)
		if parentDir == dir {
			// We've reached the root and didn't find a .env file
			return ""
		}
		dir = parentDir
	}
}

// getEnv gets an environment variable or returns a default value
func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}
