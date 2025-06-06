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

type DatabaseConfig struct {
	Host     string
	Port     int
	User     string
	Password string
	DBName   string
	SSLMode  string
}

func (dc DatabaseConfig) GetDSN() string {
	return fmt.Sprintf(
		"host=%s port=%d user=%s password=%s dbname=%s sslmode=%s",
		dc.Host, dc.Port, dc.User, dc.Password, dc.DBName, dc.SSLMode,
	)
}

func LoadConfig() Config {
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

	// Determine database port - different handling for Docker vs local
	dbPort := getEnvAsInt("DB_PORT", 0)
	if dbPort == 0 {
		// If DB_PORT is not set, use CLASS_SERVICE_DB_PORT instead
		dbPort = getEnvAsInt("CLASS_SERVICE_DB_PORT", 5436)
	}

	config := Config{
		Server: ServerConfig{
			Port:         getEnvAsInt("CLASS_SERVICE_PORT", 8005),
			ReadTimeout:  getEnvAsDuration("CLASS_SERVICE_READ_TIMEOUT", 15*time.Second),
			WriteTimeout: getEnvAsDuration("CLASS_SERVICE_WRITE_TIMEOUT", 15*time.Second),
			IdleTimeout:  getEnvAsDuration("CLASS_SERVICE_IDLE_TIMEOUT", 60*time.Second),
		},
		Database: DatabaseConfig{
			Host:     getEnv("DB_HOST", "localhost"),
			Port:     dbPort,
			User:     getEnv("DB_USER", "fitness_user"),
			Password: getEnv("DB_PASSWORD", "admin"),
			DBName:   getEnv("CLASS_SERVICE_DB_NAME", "fitness_class_db"),
			SSLMode:  getEnv("DB_SSLMODE", "disable"),
		},
	}

	// Log the configuration to help with debugging
	log.Printf("Server configuration: port=%d", config.Server.Port)
	log.Printf("Database configuration: host=%s, port=%d, dbname=%s",
		config.Database.Host, config.Database.Port, config.Database.DBName)

	return config
}

// findServiceEnvFile looks for the service-specific .env file
func findServiceEnvFile() string {
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

	// Try to find .env in the parent directory (project root)
	envPath = filepath.Join(dir, "..", ".env")
	if _, err := os.Stat(envPath); err == nil {
		return envPath
	}

	// Try executing directory for binary distribution
	execDir, err := filepath.Abs(filepath.Dir(os.Args[0]))
	if err == nil {
		envPath := filepath.Join(execDir, ".env")
		if _, err := os.Stat(envPath); err == nil {
			return envPath
		}
	}

	return ""
}

// findRootEnvFile searches for a .env file in the current directory
// and parent directories
func findRootEnvFile() string {
	// Start by searching in the project root (2 levels up from internal/config)
	projRoot, err := filepath.Abs(filepath.Join(filepath.Dir(os.Args[0]), "../.."))
	if err != nil {
		return ""
	}

	// First try the service-specific .env file
	rootEnvPath := filepath.Join(projRoot, ".env")
	if _, err := os.Stat(rootEnvPath); err == nil {
		return rootEnvPath
	}

	// Then try the main project .env file
	rootEnvPath = filepath.Join(projRoot, "..", "..", ".env")
	if _, err := os.Stat(rootEnvPath); err == nil {
		return rootEnvPath
	}

	// Start from current working directory
	dir, err := os.Getwd()
	if err != nil {
		return ""
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

func getEnv(key, defaultValue string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return defaultValue
}

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
