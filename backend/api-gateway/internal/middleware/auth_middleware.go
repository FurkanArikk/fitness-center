package middleware

import (
	"github.com/gin-gonic/gin"
)

// AuthConfig, yetkilendirme yapılandırması için ayarları içerir
type AuthConfig struct {
	// JWT için ayarlar buraya eklenebilir
	Enabled bool
}

// NewAuthConfig, varsayılan ayarlarla bir AuthConfig oluşturur
func NewAuthConfig() *AuthConfig {
	return &AuthConfig{
		Enabled: false, // Varsayılan olarak devre dışı
	}
}

// AuthMiddleware, kimlik doğrulama ve yetkilendirmeyi işler
// Not: Bu middleware şu anda devre dışıdır ve sadece gelecekte kullanım için bir şablon olarak hazırlanmıştır
func AuthMiddleware(config *AuthConfig) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Yetkilendirme devre dışıysa, işlemi devam ettir
		if !config.Enabled {
			c.Next()
			return
		}

		// İlerde buraya JWT veya başka bir yetkilendirme yöntemi eklenebilir

		// Tüm isteklerin geçmesine izin ver
		c.Next()
	}
}
