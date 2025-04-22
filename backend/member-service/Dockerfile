# Build stage
FROM golang:1.21-alpine AS builder

# Install necessary build tools
RUN apk add --no-cache git

# Set working directory
WORKDIR /app

# Copy go mod and sum files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy the source code
COPY . .

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o member-service ./cmd/main.go

# Final stage
FROM alpine:3.18

# Add necessary runtime dependencies
RUN apk --no-cache add ca-certificates tzdata postgresql-client

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Set working directory
WORKDIR /app

# Copy the binary and necessary files from builder
COPY --from=builder /app/member-service .
COPY --from=builder /app/migrations ./migrations
COPY --from=builder /app/configs ./configs
COPY --from=builder /app/scripts ./scripts

# Make scripts executable
RUN chmod +x ./scripts/*.sh

# Create directory for app user to write to
RUN mkdir -p /app/tmp && chown -R appuser:appgroup /app/tmp

# Use non-root user
USER appuser

# Expose server port 
EXPOSE 8001

# Command to run
CMD ["./member-service"]
