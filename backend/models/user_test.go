package models_test

import (
	"testing"

	"car-rental/models"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
)

func TestUserModel(t *testing.T) {
	// Test creating a user
	t.Run("Create User", func(t *testing.T) {
		user := models.User{
			Email:        "test@example.com",
			PasswordHash: "hashed_password",
			FirstName:    "Test",
			LastName:     "User",
			Phone:        "+123456789",
			Role:         models.RoleTenant,
		}

		// Verify fields
		assert.Equal(t, "test@example.com", user.Email)
		assert.Equal(t, "hashed_password", user.PasswordHash)
		assert.Equal(t, "Test", user.FirstName)
		assert.Equal(t, "User", user.LastName)
		assert.Equal(t, "+123456789", user.Phone)
		assert.Equal(t, models.RoleTenant, user.Role)
	})

	// Test user roles
	t.Run("User Roles", func(t *testing.T) {
		// Verify the role constants
		assert.Equal(t, models.UserRole("admin"), models.RoleAdmin)
		assert.Equal(t, models.UserRole("owner"), models.RoleOwner)
		assert.Equal(t, models.UserRole("tenant"), models.RoleTenant)
	})

	// Test payment card
	t.Run("Payment Card", func(t *testing.T) {
		userID := uuid.New()
		card := models.PaymentCard{
			UserID:         userID,
			CardNumber:     "4111111111111111",
			CardholderName: "Test User",
			ExpiryMonth:    12,
			ExpiryYear:     2030,
			CVV:            "123",
			IsDefault:      true,
		}

		// Verify fields
		assert.Equal(t, userID, card.UserID)
		assert.Equal(t, "4111111111111111", card.CardNumber)
		assert.Equal(t, "Test User", card.CardholderName)
		assert.Equal(t, 12, card.ExpiryMonth)
		assert.Equal(t, 2030, card.ExpiryYear)
		assert.Equal(t, "123", card.CVV)
		assert.True(t, card.IsDefault)
	})

	// Test user relationships
	t.Run("User Relationships", func(t *testing.T) {
		user := models.User{
			Email:     "owner@example.com",
			FirstName: "Car",
			LastName:  "Owner",
			Role:      models.RoleOwner,
		}

		// Create two cars for this owner
		car1 := models.Car{
			Make:  "Toyota",
			Model: "Corolla",
			Year:  2022,
		}
		car2 := models.Car{
			Make:  "Honda",
			Model: "Civic",
			Year:  2023,
		}

		user.OwnedCars = []models.Car{car1, car2}

		// Verify the relationships
		assert.Len(t, user.OwnedCars, 2)
		assert.Equal(t, "Toyota", user.OwnedCars[0].Make)
		assert.Equal(t, "Honda", user.OwnedCars[1].Make)
	})
}
