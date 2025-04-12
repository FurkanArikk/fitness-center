#!/bin/bash

# Renk tanımlamaları
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Fitness Center Mikroservis Yapısı Oluşturuluyor...${NC}"

# Ana dizin: backend
mkdir -p backend
cd backend

# 1. Üye Yönetimi Mikroservisi
mkdir -p member-service/{cmd,internal/{config,handler,model,repository/postgres,service,server},migrations,pkg/dto}

# Üye Yönetimi modelleri
touch member-service/internal/model/{member.go,membership.go,membership_benefit.go,member_membership.go,assessment.go}

# Üye Yönetimi handler'ları
touch member-service/internal/handler/{handler.go,member_handler.go,membership_handler.go,benefit_handler.go,member_membership_handler.go,assessment_handler.go}

# Üye Yönetimi repository'leri
touch member-service/internal/repository/repository.go
touch member-service/internal/repository/postgres/{postgres.go,member_repo.go,membership_repo.go,benefit_repo.go,member_membership_repo.go,assessment_repo.go}

# Üye Yönetimi servisleri
touch member-service/internal/service/{service.go,member_service.go,membership_service.go,benefit_service.go,member_membership_service.go,assessment_service.go}

# Üye Yönetimi server
touch member-service/internal/server/{server.go,router.go}

# Üye Yönetimi konfigürasyonu
touch member-service/internal/config/config.go

# Üye Yönetimi DTOs
touch member-service/pkg/dto/{member_dto.go,membership_dto.go,benefit_dto.go,member_membership_dto.go,assessment_dto.go}

# Üye Yönetimi migrations
touch member-service/migrations/{000001_create_members_table.up.sql,000001_create_members_table.down.sql}
touch member-service/migrations/{000002_create_memberships_table.up.sql,000002_create_memberships_table.down.sql}
touch member-service/migrations/{000003_create_benefits_table.up.sql,000003_create_benefits_table.down.sql}
touch member-service/migrations/{000004_create_member_memberships_table.up.sql,000004_create_member_memberships_table.down.sql}
touch member-service/migrations/{000005_create_assessments_table.up.sql,000005_create_assessments_table.down.sql}

# Üye Yönetimi ana dosyaları
touch member-service/cmd/main.go
touch member-service/{Dockerfile,go.mod,go.sum}

# 2. Personel Yönetimi Mikroservisi
mkdir -p staff-service/{cmd,internal/{config,handler,model,repository/postgres,service,server},migrations,pkg/dto}

# Personel Yönetimi modelleri
touch staff-service/internal/model/{staff.go,qualification.go,trainer.go,personal_training.go}

# Personel Yönetimi handler'ları
touch staff-service/internal/handler/{handler.go,staff_handler.go,qualification_handler.go,trainer_handler.go,training_handler.go}

# Personel Yönetimi repository'leri
touch staff-service/internal/repository/repository.go
touch staff-service/internal/repository/postgres/{postgres.go,staff_repo.go,qualification_repo.go,trainer_repo.go,training_repo.go}

# Personel Yönetimi servisleri
touch staff-service/internal/service/{service.go,staff_service.go,qualification_service.go,trainer_service.go,training_service.go}

# Personel Yönetimi server
touch staff-service/internal/server/{server.go,router.go}

# Personel Yönetimi konfigürasyonu
touch staff-service/internal/config/config.go

# Personel Yönetimi DTOs
touch staff-service/pkg/dto/{staff_dto.go,qualification_dto.go,trainer_dto.go,training_dto.go}

# Personel Yönetimi migrations
touch staff-service/migrations/{000001_create_staff_table.up.sql,000001_create_staff_table.down.sql}
touch staff-service/migrations/{000002_create_qualifications_table.up.sql,000002_create_qualifications_table.down.sql}
touch staff-service/migrations/{000003_create_trainers_table.up.sql,000003_create_trainers_table.down.sql}
touch staff-service/migrations/{000004_create_personal_training_table.up.sql,000004_create_personal_training_table.down.sql}

# Personel Yönetimi ana dosyaları
touch staff-service/cmd/main.go
touch staff-service/{Dockerfile,go.mod,go.sum}

# 3. Sınıf/Ders Yönetimi Mikroservisi
mkdir -p class-service/{cmd,internal/{config,handler,model,repository/postgres,service,server},migrations,pkg/dto}

# Sınıf/Ders Yönetimi modelleri
touch class-service/internal/model/{class.go,schedule.go,booking.go}

# Sınıf/Ders Yönetimi handler'ları
touch class-service/internal/handler/{handler.go,class_handler.go,schedule_handler.go,booking_handler.go}

# Sınıf/Ders Yönetimi repository'leri
touch class-service/internal/repository/repository.go
touch class-service/internal/repository/postgres/{postgres.go,class_repo.go,schedule_repo.go,booking_repo.go}

# Sınıf/Ders Yönetimi servisleri
touch class-service/internal/service/{service.go,class_service.go,schedule_service.go,booking_service.go}

# Sınıf/Ders Yönetimi server
touch class-service/internal/server/{server.go,router.go}

# Sınıf/Ders Yönetimi konfigürasyonu
touch class-service/internal/config/config.go

# Sınıf/Ders Yönetimi DTOs
touch class-service/pkg/dto/{class_dto.go,schedule_dto.go,booking_dto.go}

# Sınıf/Ders Yönetimi migrations
touch class-service/migrations/{000001_create_classes_table.up.sql,000001_create_classes_table.down.sql}
touch class-service/migrations/{000002_create_schedule_table.up.sql,000002_create_schedule_table.down.sql}
touch class-service/migrations/{000003_create_bookings_table.up.sql,000003_create_bookings_table.down.sql}

# Sınıf/Ders Yönetimi ana dosyaları
touch class-service/cmd/main.go
touch class-service/{Dockerfile,go.mod,go.sum}

# 4. Tesis Yönetimi Mikroservisi
mkdir -p facility-service/{cmd,internal/{config,handler,model,repository/postgres,service,server},migrations,pkg/dto}

# Tesis Yönetimi modelleri
touch facility-service/internal/model/{equipment.go,facility.go,attendance.go}

# Tesis Yönetimi handler'ları
touch facility-service/internal/handler/{handler.go,equipment_handler.go,facility_handler.go,attendance_handler.go}

# Tesis Yönetimi repository'leri
touch facility-service/internal/repository/repository.go
touch facility-service/internal/repository/postgres/{postgres.go,equipment_repo.go,facility_repo.go,attendance_repo.go}

# Tesis Yönetimi servisleri
touch facility-service/internal/service/{service.go,equipment_service.go,facility_service.go,attendance_service.go}

# Tesis Yönetimi server
touch facility-service/internal/server/{server.go,router.go}

# Tesis Yönetimi konfigürasyonu
touch facility-service/internal/config/config.go

# Tesis Yönetimi DTOs
touch facility-service/pkg/dto/{equipment_dto.go,facility_dto.go,attendance_dto.go}

# Tesis Yönetimi migrations
touch facility-service/migrations/{000001_create_equipment_table.up.sql,000001_create_equipment_table.down.sql}
touch facility-service/migrations/{000002_create_facilities_table.up.sql,000002_create_facilities_table.down.sql}
touch facility-service/migrations/{000003_create_attendance_table.up.sql,000003_create_attendance_table.down.sql}

# Tesis Yönetimi ana dosyaları
touch facility-service/cmd/main.go
touch facility-service/{Dockerfile,go.mod,go.sum}

# 5. Ödeme Mikroservisi
mkdir -p payment-service/{cmd,internal/{config,handler,model,repository/postgres,service,server},migrations,pkg/dto}

# Ödeme Yönetimi modelleri
touch payment-service/internal/model/payment.go

# Ödeme Yönetimi handler'ları
touch payment-service/internal/handler/{handler.go,payment_handler.go}

# Ödeme Yönetimi repository'leri
touch payment-service/internal/repository/repository.go
touch payment-service/internal/repository/postgres/{postgres.go,payment_repo.go}

# Ödeme Yönetimi servisleri
touch payment-service/internal/service/{service.go,payment_service.go}

# Ödeme Yönetimi server
touch payment-service/internal/server/{server.go,router.go}

# Ödeme Yönetimi konfigürasyonu
touch payment-service/internal/config/config.go

# Ödeme Yönetimi DTOs
touch payment-service/pkg/dto/payment_dto.go

# Ödeme Yönetimi migrations
touch payment-service/migrations/{000001_create_payments_table.up.sql,000001_create_payments_table.down.sql}

# Ödeme Yönetimi ana dosyaları
touch payment-service/cmd/main.go
touch payment-service/{Dockerfile,go.mod,go.sum}

# 6. API Gateway ve Shared kütüphaneleri
mkdir -p api-gateway/{cmd,internal/{config,middleware,proxy,server},pkg/auth}
touch api-gateway/cmd/main.go
touch api-gateway/internal/config/config.go
touch api-gateway/internal/middleware/auth_middleware.go
touch api-gateway/internal/middleware/logging_middleware.go
touch api-gateway/internal/proxy/proxy.go
touch api-gateway/internal/server/{server.go,router.go}
touch api-gateway/pkg/auth/jwt.go
touch api-gateway/{Dockerfile,go.mod,go.sum}

# Shared kütüphaneleri
mkdir -p shared/{auth,database,errors,events,logger,validation}
touch shared/auth/jwt.go
touch shared/database/connection.go
touch shared/errors/errors.go
touch shared/events/publisher.go
touch shared/logger/logger.go
touch shared/validation/validator.go

# Kök dizindeki dosyalar
touch {docker-compose.yml,Makefile,README.md,.gitignore}

# Docker Compose dosyasına temel içerik ekle
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  api-gateway:
    build: ./api-gateway
    ports:
      - "8000:8000"
    depends_on:
      - member-service
      - staff-service
      - class-service
      - facility-service
      - payment-service
    environment:
      - MEMBER_SERVICE_URL=http://member-service:8001
      - STAFF_SERVICE_URL=http://staff-service:8002
      - CLASS_SERVICE_URL=http://class-service:8003
      - FACILITY_SERVICE_URL=http://facility-service:8004
      - PAYMENT_SERVICE_URL=http://payment-service:8005

  member-service:
    build: ./member-service
    ports:
      - "8001:8001"
    depends_on:
      - member-db

  staff-service:
    build: ./staff-service
    ports:
      - "8002:8002"
    depends_on:
      - staff-db

  class-service:
    build: ./class-service
    ports:
      - "8003:8003"
    depends_on:
      - class-db

  facility-service:
    build: ./facility-service
    ports:
      - "8004:8004"
    depends_on:
      - facility-db

  payment-service:
    build: ./payment-service
    ports:
      - "8005:8005"
    depends_on:
      - payment-db

  member-db:
    image: postgres:14
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=member_db
    volumes:
      - member-db-data:/var/lib/postgresql/data

  staff-db:
    image: postgres:14
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=staff_db
    volumes:
      - staff-db-data:/var/lib/postgresql/data

  class-db:
    image: postgres:14
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=class_db
    volumes:
      - class-db-data:/var/lib/postgresql/data

  facility-db:
    image: postgres:14
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=facility_db
    volumes:
      - facility-db-data:/var/lib/postgresql/data

  payment-db:
    image: postgres:14
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=payment_db
    volumes:
      - payment-db-data:/var/lib/postgresql/data

volumes:
  member-db-data:
  staff-db-data:
  class-db-data:
  facility-db-data:
  payment-db-data:
EOF

# README.md dosyasını oluştur
cat > README.md << 'EOF'
# Fitness Center Mikroservis Mimarisi - Backend

Bu proje, bir fitness merkezi yönetim sistemi için mikroservis mimarisi kullanarak geliştirilmiştir.

## Mikroservisler

- **API Gateway**: Tüm servislerin tek noktadan erişim noktası
- **Member Service**: Üyelik yönetimi
- **Staff Service**: Personel ve eğitmen yönetimi
- **Class Service**: Dersler ve rezervasyonlar
- **Facility Service**: Tesis ve ekipman yönetimi
- **Payment Service**: Ödeme işlemleri

## Başlangıç

```bash
# Docker ile çalıştır
docker-compose up -d
```

## API Dokümantasyonu

Her servis için API dokümantasyonu:

- API Gateway: http://localhost:8000/swagger/index.html
- Member Service: http://localhost:8001/swagger/index.html
- Staff Service: http://localhost:8002/swagger/index.html
- Class Service: http://localhost:8003/swagger/index.html
- Facility Service: http://localhost:8004/swagger/index.html
- Payment Service: http://localhost:8005/swagger/index.html
EOF

# .gitignore dosyasını oluştur
cat > .gitignore << 'EOF'
# Binaries for programs and plugins
*.exe
*.exe~
*.dll
*.so
*.dylib
bin/

# Test binary, built with `go test -c`
*.test

# Output of the go coverage tool, specifically when used with LiteIDE
*.out

# Dependency directories (remove the comment below to include it)
vendor/

# Go workspace file
go.work

# IDEs and editors
.idea/
.vscode/
*.swp
*.swo

# Logs
*.log

# Environment variables
.env

# macOS
.DS_Store
EOF

# Örnek Member model içeriği
cat > member-service/internal/model/member.go << 'EOF'
package model

import (
	"time"
)

// Member veri modeli
type Member struct {
	ID                   int64     `db:"member_id"`
	FirstName            string    `db:"first_name"`
	LastName             string    `db:"last_name"`
	Email                string    `db:"email"`
	Phone                string    `db:"phone"`
	Address              string    `db:"address"`
	DateOfBirth          time.Time `db:"date_of_birth"`
	EmergencyContactName string    `db:"emergency_contact_name"`
	EmergencyContactPhone string   `db:"emergency_contact_phone"`
	JoinDate             time.Time `db:"join_date"`
	Status               string    `db:"status"`
	CreatedAt            time.Time `db:"created_at"`
	UpdatedAt            time.Time `db:"updated_at"`
}
EOF

# Örnek Member repo içeriği
cat > member-service/internal/repository/postgres/member_repo.go << 'EOF'
package postgres

import (
	"context"
	"database/sql"
	"errors"

	"github.com/FurkanArikk/fitness-center/member-service/internal/model"
)

// MemberRepository, üye veritabanı işlemlerini gerçekleştirir
type MemberRepository struct {
	db *sql.DB
}

// NewMemberRepository, yeni bir MemberRepository oluşturur
func NewMemberRepository(db *sql.DB) *MemberRepository {
	return &MemberRepository{
		db: db,
	}
}

// Create, yeni bir üye oluşturur
func (r *MemberRepository) Create(ctx context.Context, member *model.Member) error {
	// İmplementasyon
	return nil
}

// GetByID, ID'ye göre üye getirir
func (r *MemberRepository) GetByID(ctx context.Context, id int64) (*model.Member, error) {
	// İmplementasyon
	return nil, errors.New("not implemented")
}

// Update, üye bilgilerini günceller
func (r *MemberRepository) Update(ctx context.Context, member *model.Member) error {
	// İmplementasyon
	return nil
}

// Delete, üyeyi siler
func (r *MemberRepository) Delete(ctx context.Context, id int64) error {
	// İmplementasyon
	return nil
}

// List, üyeleri listeler
func (r *MemberRepository) List(ctx context.Context, offset, limit int) ([]*model.Member, error) {
	// İmplementasyon
	return nil, errors.New("not implemented")
}
EOF

# Örnek Member handler içeriği
cat > member-service/internal/handler/member_handler.go << 'EOF'
package handler

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
	"github.com/FurkanArikk/fitness-center/member-service/internal/service"
)

// MemberHandler, üye işlemleri için HTTP endpoint'lerini sağlar
type MemberHandler struct {
	service service.MemberService
}

// NewMemberHandler, yeni bir MemberHandler oluşturur
func NewMemberHandler(service service.MemberService) *MemberHandler {
	return &MemberHandler{
		service: service,
	}
}

// GetMember, belirli bir üyeyi getirir
func (h *MemberHandler) GetMember(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		http.Error(w, "Invalid member ID", http.StatusBadRequest)
		return
	}
	
	member, err := h.service.GetByID(r.Context(), id)
	if err != nil {
		http.Error(w, "Member not found", http.StatusNotFound)
		return
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(member)
}

// Diğer handler metodları...
EOF

# Örnek üye migration dosyası
cat > member-service/migrations/000001_create_members_table.up.sql << 'EOF'
CREATE TABLE IF NOT EXISTS members (
  member_id SERIAL PRIMARY KEY,
  first_name VARCHAR(50),
  last_name VARCHAR(50),
  email VARCHAR(100) UNIQUE,
  phone VARCHAR(20),
  address VARCHAR(200),
  date_of_birth DATE,
  emergency_contact_name VARCHAR(100),
  emergency_contact_phone VARCHAR(20),
  join_date DATE,
  status VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_members_email ON members(email);
CREATE INDEX IF NOT EXISTS idx_members_status ON members(status);
EOF

# Örnek main.go dosyası
cat > member-service/cmd/main.go << 'EOF'
package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"

	"github.com/gorilla/mux"
)

func main() {
	fmt.Println("Member Service başlatılıyor...")
	
	// Router oluştur
	r := mux.NewRouter()
	
	// Endpoints
	r.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("OK"))
	}).Methods("GET")
	
	// HTTP Server
	srv := &http.Server{
		Addr:    ":8001",
		Handler: r,
	}
	
	// Graceful shutdown
	go func() {
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("listen: %s\n", err)
		}
	}()
	
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	
	fmt.Println("Server kapatılıyor...")
}
EOF

# Makefile oluştur
cat > Makefile << 'EOF'
.PHONY: build run clean proto test docker-up docker-down migrate-up migrate-down lint all

all: clean build test

build:
	@echo "Building all services..."
	cd api-gateway && go build -o bin/api-gateway cmd/main.go
	cd member-service && go build -o bin/member-service cmd/main.go
	cd staff-service && go build -o bin/staff-service cmd/main.go
	cd class-service && go build -o bin/class-service cmd/main.go
	cd facility-service && go build -o bin/facility-service cmd/main.go
	cd payment-service && go build -o bin/payment-service cmd/main.go

run:
	@echo "Running services with docker..."
	docker-compose up -d

clean:
	@echo "Cleaning up..."
	rm -rf */bin

test:
	@echo "Running tests..."
	cd api-gateway && go test ./...
	cd member-service && go test ./...
	cd staff-service && go test ./...
	cd class-service && go test ./...
	cd facility-service && go test ./...
	cd payment-service && go test ./...

docker-up:
	docker-compose up -d

docker-down:
	docker-compose down

migrate-up:
	@echo "Running migrations up..."
	cd member-service && migrate -path=./migrations -database "postgresql://postgres:postgres@localhost:5432/member_db?sslmode=disable" up
	cd staff-service && migrate -path=./migrations -database "postgresql://postgres:postgres@localhost:5432/staff_db?sslmode=disable" up
	cd class-service && migrate -path=./migrations -database "postgresql://postgres:postgres@localhost:5432/class_db?sslmode=disable" up
	cd facility-service && migrate -path=./migrations -database "postgresql://postgres:postgres@localhost:5432/facility_db?sslmode=disable" up
	cd payment-service && migrate -path=./migrations -database "postgresql://postgres:postgres@localhost:5432/payment_db?sslmode=disable" up

migrate-down:
	@echo "Running migrations down..."
	cd member-service && migrate -path=./migrations -database "postgresql://postgres:postgres@localhost:5432/member_db?sslmode=disable" down
	cd staff-service && migrate -path=./migrations -database "postgresql://postgres:postgres@localhost:5432/staff_db?sslmode=disable" down
	cd class-service && migrate -path=./migrations -database "postgresql://postgres:postgres@localhost:5432/class_db?sslmode=disable" down
	cd facility-service && migrate -path=./migrations -database "postgresql://postgres:postgres@localhost:5432/facility_db?sslmode=disable" down
	cd payment-service && migrate -path=./migrations -database "postgresql://postgres:postgres@localhost:5432/payment_db?sslmode=disable" down

lint:
	@echo "Running linters..."
	golangci-lint run ./...
EOF

echo -e "${GREEN}Fitness Center Mikroservis Yapısı Başarıyla Oluşturuldu!${NC}"
echo -e "${BLUE}Projeyi çalıştırmak için: make run${NC}"
echo -e "${BLUE}Tüm servisleri derlemek için: make build${NC}"
echo -e "${BLUE}Testleri çalıştırmak için: make test${NC}"

# Dizine geri dön
cd ..

# Dosyaya çalıştırma izni ver
chmod +x ./create_backend_structure.sh