package controllers_test

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"car-rental/api/controllers"
	"car-rental/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
)

// Setup test environment for car controller tests
func setupCarTestEnv() *gin.Engine {
	gin.SetMode(gin.TestMode)
	r := gin.Default()
	return r
}

// Helper function to create a test car
func createTestCar(t *testing.T, ownerID uuid.UUID) models.Car {
	// In an actual test, you would save this to the database
	// For now we'll just return a mock car
	car := models.Car{
		ID:                 uuid.New(),
		OwnerID:            ownerID,
		Make:               "Toyota",
		Brand:              "Toyota",
		Model:              "Corolla",
		Year:               2020,
		RegistrationNumber: "ABC123",
		Category:           "Economy",
		BodyType:           models.Sedan,
		Color:              "Blue",
		Seats:              5,
		Doors:              4,
		Location:           "City Center",
		Transmission:       models.Automatic,
		FuelType:           models.Petrol,
		FuelConsumption:    7.5,
		DriverIncluded:     false,
		PricePerDay:        50.00,
	}

	return car
}

// Helper function to create a test owner user
func createTestOwner(t *testing.T) models.User {
	// Create owner user
	owner := models.User{
		ID:        uuid.New(),
		Email:     "owner@example.com",
		FirstName: "Car",
		LastName:  "Owner",
		Phone:     "+123456789",
		Role:      models.RoleOwner,
	}

	return owner
}

// Mock auth middleware that sets a user in the context
func mockAuthMiddleware(userID uuid.UUID, email string, role string) gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Set("userID", userID)
		c.Set("email", email)
		c.Set("role", role)
		c.Next()
	}
}

func TestGetCars(t *testing.T) {
	// Initialize test environment
	r := setupCarTestEnv()
	r.GET("/api/cars", controllers.GetCars)

	// Test case: Get all cars
	t.Run("Get All Cars", func(t *testing.T) {
		req, _ := http.NewRequest(http.MethodGet, "/api/cars", nil)
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		// Check response
		assert.Equal(t, http.StatusOK, w.Code)

		// Parse response body
		var response map[string]interface{}
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)

		// Verify response contains cars
		_, ok := response["cars"].([]interface{})
		assert.True(t, ok)
		// In a real test, you would check that the cars match what's in the database
	})

	// Test case: Filter cars by brand
	t.Run("Filter Cars by Brand", func(t *testing.T) {
		req, _ := http.NewRequest(http.MethodGet, "/api/cars?brand=Toyota", nil)
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		// Check response
		assert.Equal(t, http.StatusOK, w.Code)

		// Parse response body
		var response map[string]interface{}
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)

		// Verify only Toyota cars are returned
		_, ok := response["cars"].([]interface{})
		assert.True(t, ok)

		// In a real test, you would check each car to ensure it's a Toyota
	})
}

func TestCreateCar(t *testing.T) {
	// Initialize test environment
	r := setupCarTestEnv()

	// Create test owner
	owner := createTestOwner(t)

	// Set up route with auth middleware
	ownerRoutes := r.Group("/api/owner")
	ownerRoutes.Use(mockAuthMiddleware(owner.ID, owner.Email, string(owner.Role)))
	ownerRoutes.POST("/cars", controllers.CreateCar)

	// Test case: Create car with valid data
	t.Run("Create Car with Valid Data", func(t *testing.T) {
		reqBody := controllers.CreateCarRequest{
			Brand:              "BMW",
			Model:              "X5",
			Year:               2023,
			RegistrationNumber: "XYZ789",
			BodyType:           "suv",
			Category:           "Premium",
			Color:              "Black",
			Seats:              5,
			Doors:              5,
			Location:           "Airport",
			Transmission:       "automatic",
			FuelType:           "diesel",
			FuelConsumption:    9.5,
			PricePerDay:        100.00,
		}

		reqBodyBytes, _ := json.Marshal(reqBody)
		req, _ := http.NewRequest(http.MethodPost, "/api/owner/cars", bytes.NewReader(reqBodyBytes))
		req.Header.Set("Content-Type", "application/json")

		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		// Check response
		assert.Equal(t, http.StatusCreated, w.Code)

		// Parse response body
		var response map[string]interface{}
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)

		// Verify response contains car data
		car, ok := response["car"].(map[string]interface{})
		assert.True(t, ok)
		assert.Equal(t, reqBody.Brand, car["brand"])
		assert.Equal(t, reqBody.Model, car["model"])
		assert.Equal(t, float64(reqBody.Year), car["year"])
	})

	// Test case: Create car with invalid data
	t.Run("Create Car with Invalid Data", func(t *testing.T) {
		reqBody := controllers.CreateCarRequest{
			Brand: "BMW",
			// Missing required fields
		}

		reqBodyBytes, _ := json.Marshal(reqBody)
		req, _ := http.NewRequest(http.MethodPost, "/api/owner/cars", bytes.NewReader(reqBodyBytes))
		req.Header.Set("Content-Type", "application/json")

		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		// Should return bad request
		assert.Equal(t, http.StatusBadRequest, w.Code)
	})
}

func TestGetCarByID(t *testing.T) {
	// Initialize test environment
	r := setupCarTestEnv()

	// Create test car
	owner := createTestOwner(t)
	car := createTestCar(t, owner.ID)

	r.GET("/api/cars/:id", controllers.GetCarByID)

	// Test case: Get existing car
	t.Run("Get Existing Car", func(t *testing.T) {
		req, _ := http.NewRequest(http.MethodGet, "/api/cars/"+car.ID.String(), nil)
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		// Check response
		assert.Equal(t, http.StatusOK, w.Code)

		// Parse response body
		var response map[string]interface{}
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)

		// Verify car data
		carData, ok := response["car"].(map[string]interface{})
		assert.True(t, ok)
		assert.Equal(t, car.ID.String(), carData["id"])
		assert.Equal(t, car.Brand, carData["brand"])
		assert.Equal(t, car.Model, carData["model"])
	})

	// Test case: Get non-existent car
	t.Run("Get Non-existent Car", func(t *testing.T) {
		nonExistentID := uuid.New()
		req, _ := http.NewRequest(http.MethodGet, "/api/cars/"+nonExistentID.String(), nil)
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		// Should return not found
		assert.Equal(t, http.StatusNotFound, w.Code)
	})
}
