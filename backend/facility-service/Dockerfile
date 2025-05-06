# Build stage
FROM golang:1.23-alpine AS builder

# Set working directory
WORKDIR /app

# Install necessary packages for building the application
RUN apk add --no-cache git

# Copy go mod and sum files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy source code
COPY . .

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -o facility-service ./cmd/main.go

# Final stage
FROM alpine:latest

# Add necessary runtime dependencies
RUN apk --no-cache add ca-certificates tzdata postgresql-client

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Set working directory
WORKDIR /app

# Copy binary from builder stage
COPY --from=builder /app/facility-service .

# Copy migrations, configs and scripts
COPY --from=builder /app/migrations ./migrations
COPY --from=builder /app/configs ./configs 2>/dev/null || :
COPY --from=builder /app/scripts ./scripts 2>/dev/null || :

# Make scripts executable if they exist
RUN if [ -d "./scripts" ]; then chmod +x ./scripts/*.sh; fi

# Create directory for app user to write to
RUN mkdir -p /app/tmp && chown -R appuser:appgroup /app/tmp

# Use non-root user
USER appuser

# Expose the application port
EXPOSE 8080

# Command to run the application
CMD ["./facility-service"]
