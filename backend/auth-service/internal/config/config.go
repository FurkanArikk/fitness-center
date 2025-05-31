package config

import (
	"os"
	"strconv"
)

// Config holds all configuration for the application
type Config struct {
	Server ServerConfig
	JWT    JWTConfig
	Auth   AuthConfig
}

// ServerConfig holds server configuration
type ServerConfig struct {
	Host string
	Port int
}

// JWTConfig holds JWT configuration
type JWTConfig struct {
	Secret      string
	ExpireHours int
}

// AuthConfig holds authentication configuration
type AuthConfig struct {
	AdminUsername string
	AdminPassword string
}

// LoadConfig loads configuration from environment variables with defaults
func LoadConfig() *Config {
	return &Config{
		Server: ServerConfig{
			Host: getEnv("SERVER_HOST", "0.0.0.0"),
			Port: getEnvAsInt("SERVER_PORT", 8085),
		},
		JWT: JWTConfig{
			Secret:      getEnv("JWT_SECRET", "your-super-secret-jwt-key-change-this-in-production"),
			ExpireHours: getEnvAsInt("JWT_EXPIRE_HOURS", 24),
		},
		Auth: AuthConfig{
			AdminUsername: getEnv("ADMIN_USERNAME", "admin"),
			AdminPassword: getEnv("ADMIN_PASSWORD", "admin"),
		},
	}
}

// getEnv gets environment variable with fallback to default value
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

// getEnvAsInt gets environment variable as integer with fallback to default value
func getEnvAsInt(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		if intValue, err := strconv.Atoi(value); err == nil {
			return intValue
		}
	}
	return defaultValue
}
