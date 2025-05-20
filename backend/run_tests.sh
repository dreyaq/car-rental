#!/bin/bash
# Run all backend tests

echo "Running backend tests..."
cd "$(dirname "$0")"

# Install test dependencies if needed
echo "Installing test dependencies..."
go get -u github.com/stretchr/testify/assert
go get -u gorm.io/driver/sqlite

# Run all tests with verbose output
echo "Running tests..."
go test ./... -v

# If you want to run with coverage report
# echo "Running tests with coverage..."
# go test ./... -cover -coverprofile=coverage.out
# go tool cover -html=coverage.out -o coverage.html
# xdg-open coverage.html || open coverage.html

echo "Test run complete!"
