package middleware

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

// Logger, zamanlama bilgisi ile istekleri günlükler
func Logger() gin.HandlerFunc {
	return func(c *gin.Context) {
		// İstek geldiği zaman
		startTime := time.Now()

		// İsteği işle
		c.Next()

		// İsteğin işlenme süresi
		endTime := time.Now()
		latency := endTime.Sub(startTime)

		// İstek bilgilerini günlüğe kaydet
		status := c.Writer.Status()
		method := c.Request.Method
		path := c.Request.URL.Path
		query := c.Request.URL.RawQuery

		if query != "" {
			path = path + "?" + query
		}

		clientIP := c.ClientIP()
		userAgent := c.Request.UserAgent()
		requestID := c.GetString("RequestID")

		// Günlük formatı
		gin.DefaultWriter.Write([]byte(
			"[API-GATEWAY] " + endTime.Format("2006/01/02 - 15:04:05") +
				" | " + requestID +
				" | " + clientIP +
				" | " + method +
				" | " + path +
				" | " + http.StatusText(status) +
				" | " + latency.String() +
				" | " + userAgent + "\n"))
	}
}
