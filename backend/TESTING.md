# Backend Tests

This directory contains tests for the Car Rental Backend API.

## Test Structure

The tests are organized by package, with test files living alongside the implementation files. The tests are designed to verify the functionality of the API at different levels:

- Unit tests for utility functions
- Controller tests for API endpoints
- Model tests for data structures
- Middleware tests for authentication and authorization
- Configuration tests
- Service tests

## Running Tests

### Using the Provided Scripts

On Windows:
```powershell
.\run_tests.ps1
```

On Linux/macOS:
```bash
chmod +x ./run_tests.sh
./run_tests.sh
```

### Manual Test Execution

To run all tests:
```bash
go test ./... -v
```

To run tests in a specific package:
```bash
go test ./api/controllers -v
```

To run a specific test:
```bash
go test ./api/controllers -run TestRegisterUser -v
```

### With Coverage Report

To run tests with coverage reporting:
```bash
go test ./... -cover -coverprofile=coverage.out
go tool cover -html=coverage.out -o coverage.html
```

## Test Dependencies

- github.com/stretchr/testify/assert - For assertions in tests
- gorm.io/driver/sqlite - For in-memory SQLite database for testing

## Test Helper

The `test/test_helpers.go` file contains helper functions for setting up test environments, creating test data, and mocking dependencies.

## Mock Implementation

For some tests, mock implementations are provided to simulate external dependencies and isolate the unit under test.

## Adding New Tests

When adding new functionality to the API, please follow these guidelines for adding tests:

1. Create test files named `<filename>_test.go` alongside implementation files
2. Use the test helpers to set up test environments
3. Write test cases covering both expected and edge cases
4. Make sure to clean up after tests (close connections, etc.)

## Continuous Integration

These tests are automatically run in the CI pipeline for every pull request and merge to the main branch.
