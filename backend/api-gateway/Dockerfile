# Derleme aşaması
FROM golang:1.21-alpine AS builder

WORKDIR /app

# Bağımlılıkları kopyala ve indir
COPY go.mod go.sum ./
RUN go mod download

# Kaynak kodunu kopyala
COPY . .

# Uygulamayı derle
RUN CGO_ENABLED=0 GOOS=linux go build -o api-gateway ./cmd/main.go

# Çalıştırma aşaması
FROM alpine:3.18

WORKDIR /app

# Builder aşamasından derlenen uygulamayı kopyala
COPY --from=builder /app/api-gateway .
COPY --from=builder /app/configs/config.yaml ./configs/config.yaml

# Container içerisindeki port
EXPOSE 8000

# Uygulamayı çalıştır
CMD ["./api-gateway"]