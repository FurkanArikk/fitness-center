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

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Set working directory
WORKDIR /app

# Copy the binary from builder
COPY --from=builder /app/class-service .

# Copy migrations, configs and scripts
COPY --from=builder /app/migrations ./migrations
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/configs ./configs

# Copy environment files
COPY --from=builder /app/.env* ./

# Make scripts executable
RUN chmod +x ./scripts/*.sh

# Create directory for app user to write to
RUN mkdir -p /app/tmp /app/logs && chown -R appuser:appgroup /app/tmp /app/logs

# Use non-root user
USER appuser

# Expose the application port
EXPOSE 8005

# Command to run the application
CMD ["./class-service"]
