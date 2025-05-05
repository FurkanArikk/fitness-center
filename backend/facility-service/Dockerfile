# Build stage
FROM golang:1.23-alpine AS builder

# Set working directory
WORKDIR /app

# Copy go mod and sum files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy source code
COPY . .

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -o facility-service ./cmd/main.go

# Final stage
FROM alpine:3.17

# Install ca-certificates for HTTPS requests
RUN apk --no-cache add ca-certificates

# Set working directory
WORKDIR /app

# Copy binary from builder stage
COPY --from=builder /app/facility-service .

# Copy migrations directory
COPY --from=builder /app/migrations ./migrations

# Expose the application port
EXPOSE 8080

# Command to run the application
CMD ["./facility-service"]
