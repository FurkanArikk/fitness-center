# Build stage
FROM golang:1.23-alpine AS builder

# Set working directory
WORKDIR /app

# Install necessary packages for building the application
RUN apk add --no-cache git

# Copy go mod and sum files
COPY go.mod go.sum ./

# Download all dependencies
RUN go mod download

# Copy the source from the current directory to the working directory
COPY . .

# Build the application with optimizations
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o class-service ./cmd/main.go

# Final stage
FROM alpine:latest

# Add ca-certificates for secure connections
RUN apk --no-cache add ca-certificates tzdata postgresql-client

# Set working directory
WORKDIR /app

# Copy the binary from builder
COPY --from=builder /app/class-service .

# Copy migrations and scripts
COPY --from=builder /app/migrations ./migrations
COPY --from=builder /app/scripts ./scripts

# Make scripts executable
RUN chmod +x ./scripts/*.sh

# Set default environment variables
ENV CLASS_SERVICE_PORT=8005 \
    CLASS_SERVICE_HOST=0.0.0.0 \
    CLASS_SERVICE_DB_PORT=5436 \
    CLASS_SERVICE_DB_NAME=fitness_class_db \
    CLASS_SERVICE_CONTAINER_NAME=fitness_class_db \
    DB_HOST=localhost \
    DB_USER=fitness_user \
    DB_PASSWORD=admin \
    DB_SSLMODE=disable

# Expose the application port
EXPOSE 8005

# Command to run the application
CMD ["./class-service"]
