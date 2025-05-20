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
	"github.com/stretchr/testify/assert"
)

// Setup function to initialize the test environment
func setupTestEnv() *gin.Engine {
	gin.SetMode(gin.TestMode)
	r := gin.Default()
	return r
}

// Helper function to create a test user
func createTestUser(t *testing.T) models.User {
	// This would create a test user in the database and return it
	// For now we'll just return a mock user
	user := models.User{
		Email:     "test@example.com",
		FirstName: "Test",
		LastName:  "User",
		Phone:     "+123456789",
		Role:      models.RoleTenant,
	}

	// In a real test, you would save the user to the database
	// but for this example, we'll just return the mock user
	return user
}

func TestRegisterUser(t *testing.T) {
	// Initialize test environment
	r := setupTestEnv()
	r.POST("/api/register", controllers.RegisterUser)

	// Test case: Valid registration
	t.Run("Valid Registration", func(t *testing.T) {
		reqBody := controllers.RegisterRequest{
			Email:     "newuser@example.com",
			Password:  "password123",
			FirstName: "New",
			LastName:  "User",
			Phone:     "+123456789",
			Role:      "tenant",
		}

		reqBodyBytes, _ := json.Marshal(reqBody)
		req, _ := http.NewRequest(http.MethodPost, "/api/register", bytes.NewReader(reqBodyBytes))
		req.Header.Set("Content-Type", "application/json")

		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		// Check response
		assert.Equal(t, http.StatusCreated, w.Code)

		// Parse response body
		var response map[string]interface{}
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)

		// Verify response contains token and user data
		assert.NotEmpty(t, response["token"])
		user, ok := response["user"].(map[string]interface{})
		assert.True(t, ok)
		assert.Equal(t, reqBody.Email, user["email"])
		assert.Equal(t, reqBody.FirstName, user["firstName"])
		assert.Equal(t, reqBody.LastName, user["lastName"])
	})

	// Test case: Missing required fields
	t.Run("Missing Required Fields", func(t *testing.T) {
		reqBody := controllers.RegisterRequest{
			Email:    "incomplete@example.com",
			Password: "password123",
			// Missing other required fields
		}

		reqBodyBytes, _ := json.Marshal(reqBody)
		req, _ := http.NewRequest(http.MethodPost, "/api/register", bytes.NewReader(reqBodyBytes))
		req.Header.Set("Content-Type", "application/json")

		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		// Should return bad request
		assert.Equal(t, http.StatusBadRequest, w.Code)
	})

	// Test case: User already exists
	t.Run("User Already Exists", func(t *testing.T) {
		// First create a test user
		existingUser := createTestUser(t)

		// Then try to register with the same email
		reqBody := controllers.RegisterRequest{
			Email:     existingUser.Email,
			Password:  "password123",
			FirstName: "New",
			LastName:  "User",
			Phone:     "+987654321",
			Role:      "tenant",
		}

		reqBodyBytes, _ := json.Marshal(reqBody)
		req, _ := http.NewRequest(http.MethodPost, "/api/register", bytes.NewReader(reqBodyBytes))
		req.Header.Set("Content-Type", "application/json")

		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		// Should return conflict
		assert.Equal(t, http.StatusConflict, w.Code)
	})
}

func TestLoginUser(t *testing.T) {
	// Initialize test environment
	r := setupTestEnv()
	r.POST("/api/login", controllers.LoginUser)

	// Create test user with known credentials
	user := createTestUser(t)

	// Test case: Valid login
	t.Run("Valid Login", func(t *testing.T) {
		reqBody := controllers.LoginRequest{
			Email:    user.Email,
			Password: "password123", // This should match the password used to create the test user
		}

		reqBodyBytes, _ := json.Marshal(reqBody)
		req, _ := http.NewRequest(http.MethodPost, "/api/login", bytes.NewReader(reqBodyBytes))
		req.Header.Set("Content-Type", "application/json")

		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		// Check response
		assert.Equal(t, http.StatusOK, w.Code)

		// Parse response body
		var response map[string]interface{}
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)

		// Verify response contains token and user data
		assert.NotEmpty(t, response["token"])
		assert.NotEmpty(t, response["user"])
	})

	// Test case: Invalid credentials
	t.Run("Invalid Credentials", func(t *testing.T) {
		reqBody := controllers.LoginRequest{
			Email:    user.Email,
			Password: "wrongpassword",
		}

		reqBodyBytes, _ := json.Marshal(reqBody)
		req, _ := http.NewRequest(http.MethodPost, "/api/login", bytes.NewReader(reqBodyBytes))
		req.Header.Set("Content-Type", "application/json")

		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		// Should return unauthorized
		assert.Equal(t, http.StatusUnauthorized, w.Code)
	})

	// Test case: User not found
	t.Run("User Not Found", func(t *testing.T) {
		reqBody := controllers.LoginRequest{
			Email:    "nonexistent@example.com",
			Password: "password123",
		}

		reqBodyBytes, _ := json.Marshal(reqBody)
		req, _ := http.NewRequest(http.MethodPost, "/api/login", bytes.NewReader(reqBodyBytes))
		req.Header.Set("Content-Type", "application/json")

		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		// Should return unauthorized
		assert.Equal(t, http.StatusUnauthorized, w.Code)
	})
}
