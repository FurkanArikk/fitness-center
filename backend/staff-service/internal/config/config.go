package config

import (
	"fmt"
	"os"
	"path/filepath"
	"strconv"

	"github.com/joho/godotenv"
)

// Config holds application configuration
type Config struct {
	Server   ServerConfig
	Database DatabaseConfig
}

// ServerConfig holds HTTP server configuration
type ServerConfig struct {
	Port int
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

// LoadConfig loads configuration from environment variables
func LoadConfig() Config {
	// Load .env file from project root
	rootEnvPath := findRootEnvFile()
	godotenv.Load(rootEnvPath)

	return Config{
		Server: ServerConfig{
			Port: getEnvAsInt("STAFF_SERVICE_PORT", 8002),
		},
		Database: DatabaseConfig{
			Host:     getEnv("DB_HOST", "localhost"),
			Port:     getEnvAsInt("STAFF_SERVICE_DB_PORT", 5433),
			User:     getEnv("DB_USER", "fitness_user"),
			Password: getEnv("DB_PASSWORD", "admin"),
			DBName:   getEnv("STAFF_SERVICE_DB_NAME", "fitness_staff_db"),
			SSLMode:  getEnv("DB_SSLMODE", "disable"),
		},
	}
}

// findRootEnvFile locates the .env file in the project root
func findRootEnvFile() string {
	// Start from current directory
	dir, _ := os.Getwd()

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
