package models_test

import (
	"testing"

	"car-rental/models"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
)

func TestCarModel(t *testing.T) {
	// Test car creation
	t.Run("Create Car", func(t *testing.T) {
		ownerID := uuid.New()
		car := models.Car{
			OwnerID:            ownerID,
			Make:               "Toyota",
			Brand:              "Toyota",
			Model:              "Camry",
			Year:               2023,
			RegistrationNumber: "ABC123",
			Category:           "Sedan",
			BodyType:           models.Sedan,
			Color:              "Silver",
			Seats:              5,
			Doors:              4,
			Location:           "City Center",
			Transmission:       models.Automatic,
			FuelType:           models.Hybrid,
			FuelConsumption:    5.5,
			DriverIncluded:     false,
			PricePerDay:        70.00,
			PricePerWeek:       420.00,
			PricePerMonth:      1650.00,
			Description:        "Comfortable sedan for city driving",
		}

		// Verify fields
		assert.Equal(t, ownerID, car.OwnerID)
		assert.Equal(t, "Toyota", car.Make)
		assert.Equal(t, "Toyota", car.Brand)
		assert.Equal(t, "Camry", car.Model)
		assert.Equal(t, 2023, car.Year)
		assert.Equal(t, "ABC123", car.RegistrationNumber)
		assert.Equal(t, models.Sedan, car.BodyType)
		assert.Equal(t, "Silver", car.Color)
		assert.Equal(t, 5, car.Seats)
		assert.Equal(t, models.Automatic, car.Transmission)
		assert.Equal(t, models.Hybrid, car.FuelType)
		assert.Equal(t, 5.5, car.FuelConsumption)
		assert.Equal(t, 70.00, car.PricePerDay)
	})

	// Test body types
	t.Run("Body Types", func(t *testing.T) {
		assert.Equal(t, models.BodyType("sedan"), models.Sedan)
		assert.Equal(t, models.BodyType("suv"), models.SUV)
		assert.Equal(t, models.BodyType("hatchback"), models.Hatchback)
		assert.Equal(t, models.BodyType("convertible"), models.Convertible)
		assert.Equal(t, models.BodyType("coupe"), models.Coupe)
		assert.Equal(t, models.BodyType("minivan"), models.Minivan)
		assert.Equal(t, models.BodyType("pickup"), models.Pickup)
	})

	// Test transmission types
	t.Run("Transmission Types", func(t *testing.T) {
		assert.Equal(t, models.TransmissionType("automatic"), models.Automatic)
		assert.Equal(t, models.TransmissionType("manual"), models.Manual)
	})

	// Test fuel types
	t.Run("Fuel Types", func(t *testing.T) {
		assert.Equal(t, models.FuelType("petrol"), models.Petrol)
		assert.Equal(t, models.FuelType("diesel"), models.Diesel)
		assert.Equal(t, models.FuelType("electric"), models.Electric)
		assert.Equal(t, models.FuelType("hybrid"), models.Hybrid)
	})

	// Test car features
	t.Run("Car Features", func(t *testing.T) {

		feature1 := models.CarFeature{
			Name:        "GPS Navigation",
			Description: "Built-in GPS navigation system",
		}

		// Verify fields
		assert.Equal(t, "GPS Navigation", feature1.Name)
		assert.Equal(t, "Built-in GPS navigation system", feature1.Description)
	})
}
