package proxy

import (
	"net/http"
	"net/http/httputil"
	"net/url"
	"time"

	"github.com/gin-gonic/gin"
)

// ServiceProxy, hedef servise gönderilen istekler için proxy sağlar
type ServiceProxy struct {
	targetURL string
	timeout   time.Duration
}

// NewServiceProxy, bir servis için yeni proxy oluşturur
func NewServiceProxy(targetURL string, timeout time.Duration) *ServiceProxy {
	return &ServiceProxy{
		targetURL: targetURL,
		timeout:   timeout,
	}
}

// ProxyRequest, istekleri hedef servise yönlendirir
func (p *ServiceProxy) ProxyRequest(c *gin.Context) {
	// Hedef URL'yi oluştur
	target, err := url.Parse(p.targetURL)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Hedef servis URL'si ayrıştırılamadı"})
		c.Abort()
		return
	}

	// Orijinal yolu sakla
	originalPath := c.Request.URL.Path
	// Not: API Gateway üzerinden gelen istek yolu aynen korunacak - /api/v1 ile başlayan kısım korunur

	// Reverse proxy oluştur
	proxy := httputil.NewSingleHostReverseProxy(target)

	// Varsayılan director işlevini değiştir
	director := proxy.Director
	proxy.Director = func(req *http.Request) {
		director(req)
		req.URL.Scheme = target.Scheme
		req.URL.Host = target.Host
		// API yolu olduğu gibi korunuyor, /api/v1 ile başlayan kısım hedef servise geçiriliyor
		req.URL.Path = originalPath
		req.Host = target.Host

		// Orijinal istekten sorgu parametrelerini koru
		req.URL.RawQuery = c.Request.URL.RawQuery

		// Authorize başlığını geçir
		if authHeader := c.Request.Header.Get("Authorization"); authHeader != "" {
			req.Header.Set("Authorization", authHeader)
		}
	}

	// İstisnai durumları işle
	proxy.ErrorHandler = func(rw http.ResponseWriter, req *http.Request, err error) {
		c.JSON(http.StatusBadGateway, gin.H{
			"error":  "Gateway hatası",
			"detail": err.Error(),
		})
	}

	// İsteği yönlendir
	proxy.ServeHTTP(c.Writer, c.Request)
}
