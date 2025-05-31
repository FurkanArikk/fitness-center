# Auth Service - JWT ForwardAuth Middleware

This service provides JWT-based ForwardAuth middleware for Traefik. It manages authentication and authorization in the Fitness Center microservice architecture.

## 🔧 Features

- **JWT Token-Based Authentication**: Secure token system
- **Traefik ForwardAuth Support**: Automatic middleware integration
- **Simple Admin System**: Single admin account (username: admin, password: admin)
- **Microservice Compatible**: Integrated with Docker and Traefik
- **CORS Support**: For frontend integration

## 🚀 Hızlı Başlangıç

### 1. Servisi Başlatma
```bash
cd /path/to/auth-service
./run.sh
```

### 2. Login İşlemi
```bash
curl -X POST http://localhost:8085/api/v1/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin"
  }'
```

**Yanıt:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "Başarıyla giriş yapıldı"
}
```

### 3. Korumalı Endpoint'lere Erişim
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost/api/v1/members
```

## 📊 API Endpoints

| Method | Endpoint | Açıklama | Auth Gerekli |
|--------|----------|----------|--------------|
| GET | `/health` | Sağlık kontrolü | ❌ |
| POST | `/api/v1/login` | Kullanıcı girişi | ❌ |
| GET | `/api/v1/auth` | ForwardAuth (Traefik için) | ✅ |

## 🔐 Kimlik Doğrulama Akışı

1. **Login**: Admin kimlik bilgileri ile `/api/v1/login` endpoint'ine POST isteği
2. **Token Alma**: Başarılı login sonrası JWT token döner
3. **Token Kullanımı**: `Authorization: Bearer TOKEN` header'ı ile istekler
4. **ForwardAuth**: Traefik otomatik olarak `/api/v1/auth` endpoint'ini kontrol eder

## 🛠 Traefik Konfigürasyonu

Auth middleware tüm korumalı servislere otomatik olarak uygulanır:

```yaml
labels:
  - "traefik.http.middlewares.auth-middleware.forwardauth.address=http://auth-service:8085/api/v1/auth"
  - "traefik.http.middlewares.auth-middleware.forwardauth.authResponseHeaders=X-Forwarded-User"
  - "traefik.http.routers.service-name.middlewares=auth-middleware"
```

## 🎯 Test Etme

Test script'i ile servisi test edebilirsiniz:
```bash
./test-auth.sh
```

## 📝 Ortam Değişkenleri

| Değişken | Varsayılan | Açıklama |
|----------|------------|----------|
| `SERVER_HOST` | `0.0.0.0` | Server host adresi |
| `SERVER_PORT` | `8085` | Server port numarası |
| `JWT_SECRET` | `your-super-secret...` | JWT imzalama anahtarı |
| `JWT_EXPIRE_HOURS` | `24` | Token geçerlilik süresi (saat) |
| `ADMIN_USERNAME` | `admin` | Admin kullanıcı adı |
| `ADMIN_PASSWORD` | `admin` | Admin şifresi |

## 🏗 Mimari

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     Client      │    │     Traefik     │    │  Auth Service   │
│                 │    │   (Gateway)     │    │   (Port 8085)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │ 1. API Request        │                       │
         │──────────────────────▶│                       │
         │                       │ 2. ForwardAuth Check  │
         │                       │──────────────────────▶│
         │                       │ 3. Auth Response      │
         │                       │◀──────────────────────│
         │                       │ 4. Forward to Service │
         │                       │──────────────────────▶│
         │ 5. Response           │                       │
         │◀──────────────────────│                       │
```

## 🔒 Güvenlik

- JWT token'lar HMAC-SHA256 ile imzalanır
- Token'lar varsayılan olarak 24 saat geçerlidir
- Production ortamında `JWT_SECRET` mutlaka değiştirilmelidir
- HTTPS kullanımı önerilir

## 📦 Geliştirme

```bash
# Dependency'leri yükle
go mod tidy

# Servisi çalıştır
go run cmd/main.go

# Docker ile build
docker build -t auth-service .
```

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

---

**Not**: Bu servis basit bir auth sistemidir. Production ortamında daha gelişmiş kullanıcı yönetimi, rol tabanlı erişim kontrolü ve güvenlik özellikleri eklenebilir.
