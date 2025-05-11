#!/bin/bash

echo "Updating Go module dependencies..."

# Navigate to the project root
cd "$(dirname "$0")/.." || exit 1

# Run go mod tidy to update dependencies and go.sum
go mod tidy

# Check if the command was successful
if [ $? -eq 0 ]; then
    echo "Dependencies updated successfully!"
else
    echo "Error: Failed to update dependencies"
    exit 1
fi

echo "Verifying godotenv dependency..."
# Check if godotenv is in go.sum
if grep -q "github.com/joho/godotenv" go.sum; then
    echo "✓ github.com/joho/godotenv found in go.sum"
else
    echo "Error: github.com/joho/godotenv not found in go.sum"
    echo "Adding the dependency manually..."
    go get github.com/joho/godotenv@v1.5.1
    go mod tidy
fi

echo "Dependency verification complete."