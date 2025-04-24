package config

import (
	"fmt"
	"log"
	"os"
	"path/filepath"
	"strconv"

	"github.com/joho/godotenv"
)

type Config struct {
	Server   ServerConfig
	Database DatabaseConfig
}

type ServerConfig struct {
	Port int
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
	// Try to find .env file in project dir or parent dirs
	rootEnvPath := findRootEnvFile()
	if rootEnvPath != "" {
		log.Printf("Loading environment variables from: %s", rootEnvPath)
		if err := godotenv.Load(rootEnvPath); err != nil {
			log.Printf("Warning: Error loading .env file: %v", err)
		}
	} else {
		log.Printf("No .env file found, using environment variables")
	}

	config := Config{
		Server: ServerConfig{
			Port: getEnvAsInt("CLASS_SERVICE_PORT", 8005),
		},
		Database: DatabaseConfig{
			Host:     getEnv("DB_HOST", "localhost"),
			Port:     getEnvAsInt("CLASS_SERVICE_DB_PORT", 5436),
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

// findRootEnvFile searches for a .env file in the current directory
// and parent directories
func findRootEnvFile() string {
	// Start by searching in the project root (2 levels up from internal/config)
	projRoot, err := filepath.Abs(filepath.Join(filepath.Dir(os.Args[0]), "../.."))
	if err != nil {
		return ""
	}

	// First try the main project .env file
	rootEnvPath := filepath.Join(projRoot, "..", "..", ".env")
	if _, err := os.Stat(rootEnvPath); err == nil {
		return rootEnvPath
	}

	// Try the service-specific .env file
	rootEnvPath = filepath.Join(projRoot, ".env")
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
