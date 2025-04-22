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
