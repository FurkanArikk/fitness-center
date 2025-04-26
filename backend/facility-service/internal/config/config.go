package config

import (
	"fmt"
	"os"
	"strconv"
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
	// Use FACILITY_SERVICE_PORT with fallback to SERVER_PORT or default 8080
	serverPortStr := getEnv("FACILITY_SERVICE_PORT", "8004")
	serverPort, err := strconv.Atoi(serverPortStr)
	if err != nil {
		return nil, fmt.Errorf("parsing server port: %w", err)
	}

	// Use FACILITY_SERVICE_DB_PORT with fallback to DB_PORT or default 5432
	dbPortStr := getEnv("FACILITY_SERVICE_DB_PORT", "5435")
	dbPort, err := strconv.Atoi(dbPortStr)
	if err != nil {
		return nil, fmt.Errorf("parsing db port: %w", err)
	}

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

// getEnv gets an environment variable or returns a default value
func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}
