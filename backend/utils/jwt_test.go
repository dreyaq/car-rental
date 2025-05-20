package utils_test

import (
	"os"
	"testing"
	"time"

	"car-rental/utils"

	"github.com/google/uuid"
)

func TestJWTGeneration(t *testing.T) {
	// Set required env variable for testing
	os.Setenv("JWT_SECRET", "test-secret-key")
	defer os.Unsetenv("JWT_SECRET")

	userID := uuid.New()
	email := "test@example.com"
	role := "tenant"

	// Generate token
	token, err := utils.GenerateJWT(userID, email, role)
	if err != nil {
		t.Fatalf("Failed to generate JWT: %v", err)
	}

	// Check token is not empty
	if token == "" {
		t.Error("Generated JWT is empty")
	}

	// Validate token
	claims, err := utils.ValidateJWT(token)
	if err != nil {
		t.Fatalf("Failed to validate JWT: %v", err)
	}

	// Verify claims
	if claims.UserID != userID {
		t.Errorf("Expected UserID %v, got %v", userID, claims.UserID)
	}

	if claims.Email != email {
		t.Errorf("Expected Email %s, got %s", email, claims.Email)
	}

	if claims.Role != role {
		t.Errorf("Expected Role %s, got %s", role, claims.Role)
	}
}

func TestJWTExpirationSetting(t *testing.T) {
	// Set required env variables for testing
	os.Setenv("JWT_SECRET", "test-secret-key")
	os.Setenv("JWT_EXPIRATION", "1h") // Set 1 hour expiration
	defer func() {
		os.Unsetenv("JWT_SECRET")
		os.Unsetenv("JWT_EXPIRATION")
	}()

	userID := uuid.New()
	token, err := utils.GenerateJWT(userID, "test@example.com", "owner")
	if err != nil {
		t.Fatalf("Failed to generate JWT: %v", err)
	}

	claims, err := utils.ValidateJWT(token)
	if err != nil {
		t.Fatalf("Failed to validate JWT: %v", err)
	}

	// Check expiration is about 1 hour in the future (give or take a second)
	expectedExpiry := time.Now().Add(1 * time.Hour)
	actualExpiry := claims.ExpiresAt

	// Allow for small time differences in test execution
	timeDiff := actualExpiry.Sub(expectedExpiry)
	if timeDiff < -5*time.Second || timeDiff > 5*time.Second {
		t.Errorf("Expected expiry around %v, got %v, diff: %v", expectedExpiry, actualExpiry, timeDiff)
	}
}

func TestInvalidJWT(t *testing.T) {
	os.Setenv("JWT_SECRET", "test-secret-key")
	defer os.Unsetenv("JWT_SECRET")

	// Test with invalid token
	_, err := utils.ValidateJWT("invalid.token.format")
	if err == nil {
		t.Error("ValidateJWT should fail with invalid token format")
	}

	// Test with manipulated token
	_, err = utils.ValidateJWT("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJmYWtlLWlkIiwiZW1haWwiOiJmYWtlQGV4YW1wbGUuY29tIiwicm9sZSI6ImFkbWluIn0.INVALID_SIGNATURE")
	if err == nil {
		t.Error("ValidateJWT should fail with invalid token signature")
	}
}
