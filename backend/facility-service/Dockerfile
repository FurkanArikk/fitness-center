# Build stage
FROM golang:1.23-alpine AS builder

# Set working directory
WORKDIR /app

# Install necessary packages for building the application
RUN apk add --no-cache git

# Copy go mod and sum files
COPY go.mod go.sum ./

# Download dependencies and ensure go.sum is updated
RUN go mod download && go mod tidy

# Copy source code
COPY . .

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -o facility-service ./cmd/main.go

# Final stage
FROM alpine:latest

# Add necessary runtime dependencies
RUN apk --no-cache add ca-certificates tzdata postgresql-client wget

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Set working directory
WORKDIR /app

# Copy binary from builder stage
COPY --from=builder /app/facility-service .

# Copy migrations and scripts
COPY --from=builder /app/migrations ./migrations
COPY --from=builder /app/scripts ./scripts

# Create configs directory
RUN mkdir -p /app/configs

# Copy configs - using the ; : trick to always succeed regardless of whether configs exist
RUN if [ -d /app/builder/configs ]; then cp -r /app/builder/configs/* /app/configs/ 2>/dev/null; fi || :

# Copy environment files
COPY --from=builder /app/.env* ./

# Make scripts executable
RUN chmod +x ./scripts/*.sh

# Create directories for app user to write to
RUN mkdir -p /app/tmp /app/logs && chown -R appuser:appgroup /app/tmp /app/logs

# Use non-root user
USER appuser

# Expose the application port
EXPOSE 8004

# Command to run the application
CMD ["./facility-service"]
