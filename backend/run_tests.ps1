# Run all backend tests

Write-Output "Running backend tests..."
Set-Location -Path "d:\Go\Projects\rcsp\coursework\backend"

# Install test dependencies if needed
Write-Output "Installing test dependencies..."
go get -u github.com/stretchr/testify/assert
go get -u gorm.io/driver/sqlite

# Run all tests with verbose output
Write-Output "Running tests..."
go test ./... -v

# If you want to run with coverage report
# Write-Output "Running tests with coverage..."
# go test ./... -cover -coverprofile=coverage.out
# go tool cover -html=coverage.out -o coverage.html
# Start-Process coverage.html

Write-Output "Test run complete!"
