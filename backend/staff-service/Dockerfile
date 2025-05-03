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
RUN apk --no-cache add ca-certificates tzdata

# Set working directory
WORKDIR /app

# Copy the binary from builder
COPY --from=builder /app/staff-service .

# Copy any additional configuration files if needed
COPY --from=builder /app/configs ./configs

# Expose the application port
EXPOSE 8002

# Command to run the application
CMD ["./staff-service"]
