package utils_test

import (
	"testing"

	"car-rental/utils"
)

func TestPasswordHashing(t *testing.T) {
	password := "securePassword123"

	// Test hashing
	hashedPassword, err := utils.HashPassword(password)
	if err != nil {
		t.Fatalf("Failed to hash password: %v", err)
	}

	// Check that hash is not empty
	if hashedPassword == "" {
		t.Error("Hashed password is empty")
	}

	// Check that hash is not equal to the original password
	if hashedPassword == password {
		t.Error("Hashed password is the same as the original password")
	}

	// Test password verification with correct password
	if !utils.CheckPassword(password, hashedPassword) {
		t.Error("CheckPassword failed for correct password")
	}

	// Test password verification with incorrect password
	if utils.CheckPassword("wrongPassword", hashedPassword) {
		t.Error("CheckPassword passed for incorrect password")
	}
}

func TestEmptyPassword(t *testing.T) {
	// Test hashing empty password (should still work but not recommended)
	hashedPassword, err := utils.HashPassword("")
	if err != nil {
		t.Fatalf("Failed to hash empty password: %v", err)
	}

	// Verify empty password works
	if !utils.CheckPassword("", hashedPassword) {
		t.Error("CheckPassword failed for empty password")
	}
}
