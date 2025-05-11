package config

import (
	"fmt"
	"io/ioutil"
	"os"
	"time"

	"gopkg.in/yaml.v2"
)

// Config, API Gateway için tüm yapılandırma ayarlarını içerir
type Config struct {
	Server   ServerConfig             `yaml:"server"`
	Services map[string]ServiceConfig `yaml:"services"`
}

// ServerConfig, HTTP sunucusu ayarlarını içerir
type ServerConfig struct {
	Port         int           `yaml:"port"`
	ReadTimeout  time.Duration `yaml:"readTimeout"`
	WriteTimeout time.Duration `yaml:"writeTimeout"`
	IdleTimeout  time.Duration `yaml:"idleTimeout"`
}

// ServiceConfig, bir mikroservise ait yapılandırma ayarlarını içerir
type ServiceConfig struct {
	URL     string        `yaml:"url"`
	Timeout time.Duration `yaml:"timeout"`
}

// LoadConfig, yapılandırma dosyasını okur ve bir Config nesnesi döndürür
func LoadConfig(filePath string) (*Config, error) {
	var config Config

	// Yapılandırma dosyasını oku
	data, err := ioutil.ReadFile(filePath)
	if err != nil {
		return nil, fmt.Errorf("yapılandırma dosyası okunamadı: %w", err)
	}

	// YAML verisini ayrıştır
	if err := yaml.Unmarshal(data, &config); err != nil {
		return nil, fmt.Errorf("yapılandırma dosyası ayrıştırılamadı: %w", err)
	}

	// Çevre değişkenlerinden servis URL'lerini güncelle
	if envMemberURL := os.Getenv("MEMBER_SERVICE_URL"); envMemberURL != "" {
		config.Services["member"] = ServiceConfig{
			URL:     envMemberURL,
			Timeout: config.Services["member"].Timeout,
		}
	}
	if envStaffURL := os.Getenv("STAFF_SERVICE_URL"); envStaffURL != "" {
		config.Services["staff"] = ServiceConfig{
			URL:     envStaffURL,
			Timeout: config.Services["staff"].Timeout,
		}
	}
	if envClassURL := os.Getenv("CLASS_SERVICE_URL"); envClassURL != "" {
		config.Services["class"] = ServiceConfig{
			URL:     envClassURL,
			Timeout: config.Services["class"].Timeout,
		}
	}
	if envFacilityURL := os.Getenv("FACILITY_SERVICE_URL"); envFacilityURL != "" {
		config.Services["facility"] = ServiceConfig{
			URL:     envFacilityURL,
			Timeout: config.Services["facility"].Timeout,
		}
	}
	if envPaymentURL := os.Getenv("PAYMENT_SERVICE_URL"); envPaymentURL != "" {
		config.Services["payment"] = ServiceConfig{
			URL:     envPaymentURL,
			Timeout: config.Services["payment"].Timeout,
		}
	}

	// Çevre değişkeninden port numarasını güncelle
	if envPort := os.Getenv("API_GATEWAY_PORT"); envPort != "" {
		var port int
		if _, err := fmt.Sscanf(envPort, "%d", &port); err == nil && port > 0 {
			config.Server.Port = port
		}
	}

	return &config, nil
}
