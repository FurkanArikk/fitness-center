package config

import (
	"fmt"
	"log"
	"os"
	"strconv"
	"time"

	"github.com/joho/godotenv"
)

// Config struct holds all configuration values
type Config struct {
	Server   ServerConfig
	Auth     AuthConfig
	Database DatabaseConfig
}

// ServerConfig holds server configuration
type ServerConfig struct {
	Port         int
	Host         string
	ReadTimeout  time.Duration
	WriteTimeout time.Duration
	IdleTimeout  time.Duration
}

// AuthConfig holds authentication configuration
type AuthConfig struct {
	JWTSecret     string
	JWTExpiration time.Duration
	Username      string
	Password      string
}

// DatabaseConfig holds database configuration
type DatabaseConfig struct {
	Host     string
	Port     string
	User     string
	Password string
	DBName   string
	SSLMode  string
}

// GetDSN returns the database connection string
func (dc DatabaseConfig) GetDSN() string {
	return fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		dc.Host, dc.Port, dc.User, dc.Password, dc.DBName, dc.SSLMode,
	)
}

// LoadConfig loads configuration from environment variables
func LoadConfig() Config {
	// Load .env file
	if err := godotenv.Load(); err != nil {
		log.Println("Warning: .env file not found, using environment variables")
	}

	// Parse server port
	port, err := strconv.Atoi(getEnv("AUTH_SERVICE_PORT", "8006"))
	if err != nil {
		log.Fatal("Invalid AUTH_SERVICE_PORT value")
	}

	// Parse JWT expiration
	jwtExpiration, err := time.ParseDuration(getEnv("JWT_EXPIRATION", "24h"))
	if err != nil {
		log.Fatal("Invalid JWT_EXPIRATION value")
	}

	// Parse timeouts
	readTimeout, _ := time.ParseDuration(getEnv("AUTH_SERVICE_READ_TIMEOUT", "15s"))
	writeTimeout, _ := time.ParseDuration(getEnv("AUTH_SERVICE_WRITE_TIMEOUT", "15s"))
	idleTimeout, _ := time.ParseDuration(getEnv("AUTH_SERVICE_IDLE_TIMEOUT", "60s"))

	return Config{
		Server: ServerConfig{
			Port:         port,
			Host:         getEnv("AUTH_SERVICE_HOST", "0.0.0.0"),
			ReadTimeout:  readTimeout,
			WriteTimeout: writeTimeout,
			IdleTimeout:  idleTimeout,
		},
		Auth: AuthConfig{
			JWTSecret:     getEnv("JWT_SECRET", "fitness_center_secret"),
			JWTExpiration: jwtExpiration,
			Username:      getEnv("AUTH_USERNAME", "admin"),
			Password:      getEnv("AUTH_PASSWORD", "password"),
		},
		Database: DatabaseConfig{
			Host:     getEnvWithFallback("AUTH_SERVICE_DB_HOST", "DB_HOST", "localhost"),
			Port:     getEnv("AUTH_SERVICE_DB_PORT", "5437"),
			User:     getEnvWithFallback("AUTH_SERVICE_DB_USER", "DB_USER", "fitness_user"),
			Password: getEnvWithFallback("AUTH_SERVICE_DB_PASSWORD", "DB_PASSWORD", "admin"),
			DBName:   getEnv("AUTH_SERVICE_DB_NAME", "fitness_auth_db"),
			SSLMode:  getEnvWithFallback("AUTH_SERVICE_DB_SSLMODE", "DB_SSLMODE", "disable"),
		},
	}
}

// getEnv gets environment variable with default value
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

// getEnvWithFallback tries the primary key first, then fallback key, then default
func getEnvWithFallback(primaryKey, fallbackKey, defaultValue string) string {
	if value := os.Getenv(primaryKey); value != "" {
		return value
	}
	if fallbackKey != "" {
		if value := os.Getenv(fallbackKey); value != "" {
			return value
		}
	}
	return defaultValue
}
