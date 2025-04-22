package config

import (
	"fmt"
	"os"
	"time"

	"github.com/joho/godotenv"
	"github.com/spf13/viper"
)

// Config represents application configuration
type Config struct {
	Server   ServerConfig
	Database DatabaseConfig
}

// ServerConfig contains server-related settings
type ServerConfig struct {
	Host         string
	Port         string
	ReadTimeout  time.Duration
	WriteTimeout time.Duration
	IdleTimeout  time.Duration
}

// DatabaseConfig contains database connection settings
type DatabaseConfig struct {
	Host     string
	Port     string
	User     string
	Password string
	DBName   string
	SSLMode  string
}

// Load loads configuration from file and environment
func Load() (*Config, error) {
	// Try to load .env file from different locations
	locations := []string{".", "..", "../..", "../../..", "../../../.."}
	for _, loc := range locations {
		envFile := fmt.Sprintf("%s/.env", loc)
		if _, err := os.Stat(envFile); err == nil {
			if err := godotenv.Load(envFile); err != nil {
				fmt.Printf("Warning: Error loading .env file from %s: %v\n", envFile, err)
			} else {
				fmt.Printf("Loaded environment from %s\n", envFile)
				break
			}
		}
	}

	viper.SetConfigName("config")
	viper.SetConfigType("yaml")
	viper.AddConfigPath("./configs")
	viper.AddConfigPath(".")
	viper.AutomaticEnv()

	// Map environment variables
	viper.BindEnv("server.host", "MEMBER_SERVICE_HOST")
	viper.BindEnv("server.port", "MEMBER_SERVICE_PORT")
	viper.BindEnv("server.readTimeout", "MEMBER_SERVICE_READ_TIMEOUT")
	viper.BindEnv("server.writeTimeout", "MEMBER_SERVICE_WRITE_TIMEOUT")
	viper.BindEnv("server.idleTimeout", "MEMBER_SERVICE_IDLE_TIMEOUT")

	viper.BindEnv("database.host", "DB_HOST")
	viper.BindEnv("database.port", "DB_PORT")
	viper.BindEnv("database.user", "DB_USER")
	viper.BindEnv("database.password", "DB_PASSWORD")
	viper.BindEnv("database.dbname", "MEMBER_SERVICE_DB_NAME")
	viper.BindEnv("database.sslmode", "DB_SSLMODE")

	// Default values
	viper.SetDefault("server.host", getEnv("MEMBER_SERVICE_HOST", "0.0.0.0"))
	viper.SetDefault("server.port", getEnv("MEMBER_SERVICE_PORT", "8001"))
	viper.SetDefault("server.readTimeout", getDurationEnv("MEMBER_SERVICE_READ_TIMEOUT", 15*time.Second))
	viper.SetDefault("server.writeTimeout", getDurationEnv("MEMBER_SERVICE_WRITE_TIMEOUT", 15*time.Second))
	viper.SetDefault("server.idleTimeout", getDurationEnv("MEMBER_SERVICE_IDLE_TIMEOUT", 60*time.Second))

	viper.SetDefault("database.host", getEnv("DB_HOST", "localhost"))
	viper.SetDefault("database.port", getEnv("DB_PORT", "5432"))
	viper.SetDefault("database.user", getEnv("DB_USER", "fitness_user"))
	viper.SetDefault("database.password", getEnv("DB_PASSWORD", "your_password"))
	viper.SetDefault("database.dbname", getEnv("MEMBER_SERVICE_DB_NAME", "fitness_member_db"))
	viper.SetDefault("database.sslmode", getEnv("DB_SSLMODE", "disable"))

	if err := viper.ReadInConfig(); err != nil {
		// It's okay if we don't find the config file
		if _, ok := err.(viper.ConfigFileNotFoundError); !ok {
			return nil, err
		}
	}

	var config Config
	config.Server = ServerConfig{
		Host:         viper.GetString("server.host"),
		Port:         viper.GetString("server.port"),
		ReadTimeout:  viper.GetDuration("server.readTimeout"),
		WriteTimeout: viper.GetDuration("server.writeTimeout"),
		IdleTimeout:  viper.GetDuration("server.idleTimeout"),
	}

	config.Database = DatabaseConfig{
		Host:     viper.GetString("database.host"),
		Port:     viper.GetString("database.port"),
		User:     viper.GetString("database.user"),
		Password: viper.GetString("database.password"),
		DBName:   viper.GetString("database.dbname"),
		SSLMode:  viper.GetString("database.sslmode"),
	}

	return &config, nil
}

// GetDSN returns the database connection string
func (c *DatabaseConfig) GetDSN() string {
	return fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		c.Host, c.Port, c.User, c.Password, c.DBName, c.SSLMode)
}

// Helper functions to get environment variables
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getDurationEnv(key string, defaultValue time.Duration) time.Duration {
	if value := os.Getenv(key); value != "" {
		if duration, err := time.ParseDuration(value); err == nil {
			return duration
		}
	}
	return defaultValue
}
