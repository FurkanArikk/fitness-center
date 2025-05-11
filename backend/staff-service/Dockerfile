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
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o staff-service ./cmd/main.go

# Final stage
FROM alpine:latest

# Add ca-certificates for secure connections
RUN apk --no-cache add ca-certificates tzdata postgresql-client

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Set working directory
WORKDIR /app

# Copy the binary from builder
COPY --from=builder /app/staff-service .

# Copy optional directories if they exist - use proper Docker approach
# Copy configs directory if it exists
RUN mkdir -p ./configs
COPY --from=builder /app/configs/ ./configs/

# Copy migrations directory if it exists
RUN mkdir -p ./migrations
COPY --from=builder /app/migrations/ ./migrations/

# Copy scripts directory if it exists
RUN mkdir -p ./scripts
COPY --from=builder /app/scripts/ ./scripts/

# Make scripts executable if they exist
RUN if [ -d "./scripts" ] && [ "$(ls -A ./scripts)" ]; then chmod +x ./scripts/*.sh 2>/dev/null || true; fi

# Create directory for app user to write to
RUN mkdir -p /app/tmp && chown -R appuser:appgroup /app/tmp

# Use non-root user
USER appuser

# Expose the application port
EXPOSE 8002

# Command to run the application
CMD ["./staff-service"]
