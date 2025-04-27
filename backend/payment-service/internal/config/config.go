package config

import (
	"fmt"
	"os"
	"strconv"
	"time"
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

// getEnv gets an environment variable or returns a default value
func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}
