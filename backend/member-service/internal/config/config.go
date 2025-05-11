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

// Config holds application configuration
type Config struct {
	Server   ServerConfig
	Database DatabaseConfig
}

// ServerConfig holds HTTP server configuration
type ServerConfig struct {
	Port         int
	ReadTimeout  time.Duration
	WriteTimeout time.Duration
	IdleTimeout  time.Duration
}

// DatabaseConfig holds database configuration
type DatabaseConfig struct {
	Host     string
	Port     int
	User     string
	Password string
	DBName   string
	SSLMode  string
}

// GetDSN returns the database connection string
func (dc DatabaseConfig) GetDSN() string {
	return fmt.Sprintf(
		"host=%s port=%d user=%s password=%s dbname=%s sslmode=%s",
		dc.Host, dc.Port, dc.User, dc.Password, dc.DBName, dc.SSLMode,
	)
}

// Load loads configuration from environment variables
func Load() (*Config, error) {
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

	config := &Config{
		Server: ServerConfig{
			Port:         getEnvAsInt("MEMBER_SERVICE_PORT", 8001),
			ReadTimeout:  getEnvAsDuration("MEMBER_SERVICE_READ_TIMEOUT", 15*time.Second),
			WriteTimeout: getEnvAsDuration("MEMBER_SERVICE_WRITE_TIMEOUT", 15*time.Second),
			IdleTimeout:  getEnvAsDuration("MEMBER_SERVICE_IDLE_TIMEOUT", 60*time.Second),
		},
		Database: DatabaseConfig{
			Host:     getEnv("DB_HOST", "localhost"),
			Port:     getEnvAsInt("MEMBER_SERVICE_DB_PORT", 5432),
			User:     getEnv("DB_USER", "fitness_user"),
			Password: getEnv("DB_PASSWORD", "admin"),
			DBName:   getEnv("MEMBER_SERVICE_DB_NAME", "fitness_member_db"),
			SSLMode:  getEnv("DB_SSLMODE", "disable"),
		},
	}

	log.Printf("Server configuration: port=%d", config.Server.Port)
	log.Printf("Database configuration: host=%s, port=%d, dbname=%s",
		config.Database.Host, config.Database.Port, config.Database.DBName)

	return config, nil
}

// LoadConfig is an alias for Load to maintain backwards compatibility
func LoadConfig() Config {
	config, _ := Load()
	return *config
}

// findServiceEnvFile looks for the service-specific .env file
func findServiceEnvFile() string {
	// Check for service-specific .env file at the exact location
	serviceEnvPath := "/home/furkan/work/fitness-center/backend/member-service/.env"
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

// findRootEnvFile locates the .env file in the project root
func findRootEnvFile() string {
	// Start from current directory
	dir, _ := os.Getwd()

	// Try project root (backend/member-service/..)
	envPath := filepath.Join(dir, "..", "..", ".env")
	if _, err := os.Stat(envPath); err == nil {
		return envPath
	}

	// Go up until we find the .env file or reach filesystem root
	for {
		envPath := filepath.Join(dir, ".env")
		if _, err := os.Stat(envPath); err == nil {
			return envPath
		}

		// Go up one directory
		parentDir := filepath.Dir(dir)
		if parentDir == dir {
			// We've reached the filesystem root without finding .env
			return ""
		}
		dir = parentDir
	}
}

// Helper function to get environment variables with default values
func getEnv(key, defaultValue string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return defaultValue
}

// Helper function to get environment variables as integers
func getEnvAsInt(key string, defaultValue int) int {
	valueStr := getEnv(key, "")
	if value, err := strconv.Atoi(valueStr); err == nil {
		return value
	}
	return defaultValue
}

// Helper function to get environment variables as durations
func getEnvAsDuration(key string, defaultValue time.Duration) time.Duration {
	valueStr := getEnv(key, "")
	if value, err := time.ParseDuration(valueStr); err == nil {
		return value
	}
	return defaultValue
}
