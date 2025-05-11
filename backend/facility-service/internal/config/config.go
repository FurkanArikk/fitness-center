package config

import (
	"fmt"
	"log"
	"os"
	"path/filepath"
	"strconv"

	"github.com/joho/godotenv"
)

// Config holds all configuration for the service
type Config struct {
	ServerPort     int
	PostgresConfig PostgresConfig
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
	// Load environment variables from service-specific .env file first
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

	// Use FACILITY_SERVICE_PORT with fallback to default 8004
	serverPort := getEnvAsInt("FACILITY_SERVICE_PORT", 8004)

	// Use FACILITY_SERVICE_DB_PORT with fallback to default 5435
	dbPort := getEnvAsInt("FACILITY_SERVICE_DB_PORT", 5435)

	return &Config{
		ServerPort: serverPort,
		PostgresConfig: PostgresConfig{
			Host:     getEnv("DB_HOST", "localhost"),
			Port:     dbPort,
			User:     getEnv("DB_USER", "fitness_user"),
			Password: getEnv("DB_PASSWORD", "admin"),
			DBName:   getEnv("FACILITY_SERVICE_DB_NAME", "fitness_facility_db"),
			SSLMode:  getEnv("DB_SSLMODE", "disable"),
		},
	}, nil
}

// findServiceEnvFile looks for the service-specific .env file
func findServiceEnvFile() string {
	// Check for service-specific .env file at the exact location
	// Construct the relative path to the service-specific .env file
	serviceEnvPath := filepath.Join("backend", "facility-service", ".env")
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

	// Try project root (backend/facility-service/..)
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

// getEnvAsInt gets an environment variable as an integer or returns a default value
func getEnvAsInt(key string, defaultValue int) int {
	valueStr := getEnv(key, "")
	if value, err := strconv.Atoi(valueStr); err == nil {
		return value
	}
	return defaultValue
}
