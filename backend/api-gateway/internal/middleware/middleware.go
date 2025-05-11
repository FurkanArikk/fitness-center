package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// CORS, CORS başlıklarını ekler
func CORS() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusOK)
			return
		}

		c.Next()
	}
}

// ContentType, varsayılan içerik türünü ayarlar
func ContentType() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Content-Type", "application/json")
		c.Next()
	}
}

// RequestID, her istek için benzersiz bir tanımlayıcı oluşturur
func RequestID() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Önce istek başlığında bir istek kimliği var mı kontrol et
		requestID := c.Request.Header.Get("X-Request-ID")

		// Yoksa yeni bir UUID oluştur
		if requestID == "" {
			requestID = uuid.New().String()
		}

		// İstek kimliğini context'e kaydet
		c.Set("RequestID", requestID)

		// İstek kimliğini yanıt başlığına ekle
		c.Writer.Header().Set("X-Request-ID", requestID)

		c.Next()
	}
}
