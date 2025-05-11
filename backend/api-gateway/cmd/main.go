package main

import (
	"log"
	"os"
	"strconv"

	"github.com/furkan/fitness-center/backend/api-gateway/internal/config"
	"github.com/furkan/fitness-center/backend/api-gateway/internal/server"
)

func main() {
	// Yapılandırma dosyasının yolunu belirleme
	configPath := os.Getenv("API_GATEWAY_CONFIG")
	if configPath == "" {
		configPath = "./configs/config.yaml"
	}

	// Yapılandırma yükleme
	cfg, err := config.LoadConfig(configPath)
	if err != nil {
		log.Fatalf("Yapılandırma yüklenirken hata oluştu: %v", err)
	}

	// Port değerini belirleme - çevre değişkeninden veya yapılandırmadan
	port := os.Getenv("API_GATEWAY_PORT")
	if port == "" {
		port = strconv.Itoa(cfg.Server.Port)
	}

	// API Gateway sunucusu oluşturma
	srv := server.New(cfg)

	log.Println("API Gateway başlatılıyor...")
	if err := srv.Start(); err != nil {
		log.Fatalf("Sunucu başlatılırken hata oluştu: %v", err)
	}
}
