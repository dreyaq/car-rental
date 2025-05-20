package middleware_test

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"car-rental/api/middleware"
	"car-rental/utils"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
)

func setupMiddlewareTestEnv() *gin.Engine {
	gin.SetMode(gin.TestMode)
	r := gin.Default()
	return r
}

func TestAuthMiddleware(t *testing.T) {
	r := setupMiddlewareTestEnv()

	// Set JWT secret for test
	os.Setenv("JWT_SECRET", "test-secret-key")
	defer os.Unsetenv("JWT_SECRET")

	// Create a test route protected by auth middleware
	r.GET("/protected", middleware.AuthMiddleware(), func(c *gin.Context) {
		userID, exists := c.Get("userID")
		if !exists {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "User ID not set in context"})
			return
		}

		email, exists := c.Get("email")
		if !exists {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Email not set in context"})
			return
		}

		role, exists := c.Get("role")
		if !exists {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Role not set in context"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"userID": userID,
			"email":  email,
			"role":   role,
		})
	})

	// Test case: Valid JWT token
	t.Run("Valid JWT Token", func(t *testing.T) {
		// Generate a valid token
		userID := uuid.New()
		email := "test@example.com"
		role := "tenant"
		token, err := utils.GenerateJWT(userID, email, role)
		assert.NoError(t, err)

		req, _ := http.NewRequest(http.MethodGet, "/protected", nil)
		req.Header.Set("Authorization", "Bearer "+token)

		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		// Check response
		assert.Equal(t, http.StatusOK, w.Code)

		// Verify the context variables were set correctly
		var response map[string]interface{}
		err = json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)

		assert.Equal(t, userID.String(), response["userID"])
		assert.Equal(t, email, response["email"])
		assert.Equal(t, role, response["role"])
	})

	// Test case: Missing authorization header
	t.Run("Missing Authorization Header", func(t *testing.T) {
		req, _ := http.NewRequest(http.MethodGet, "/protected", nil)

		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		// Should return unauthorized
		assert.Equal(t, http.StatusUnauthorized, w.Code)
	})

	// Test case: Invalid token format
	t.Run("Invalid Token Format", func(t *testing.T) {
		req, _ := http.NewRequest(http.MethodGet, "/protected", nil)
		req.Header.Set("Authorization", "Bearer invalid-token")

		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		// Should return unauthorized
		assert.Equal(t, http.StatusUnauthorized, w.Code)
	})

	// Test case: Expired token
	t.Run("Expired Token", func(t *testing.T) {
		// Override JWT expiration for this test
		os.Setenv("JWT_EXPIRATION", "-1h") // 1 hour in the past

		// Generate an expired token
		userID := uuid.New()
		token, err := utils.GenerateJWT(userID, "expired@example.com", "tenant")
		assert.NoError(t, err)

		// Reset JWT expiration
		os.Setenv("JWT_EXPIRATION", "24h")

		req, _ := http.NewRequest(http.MethodGet, "/protected", nil)
		req.Header.Set("Authorization", "Bearer "+token)

		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		// Should return unauthorized
		assert.Equal(t, http.StatusUnauthorized, w.Code)
	})
}

func TestRoleMiddleware(t *testing.T) {
	r := setupMiddlewareTestEnv()

	// Set JWT secret for test
	os.Setenv("JWT_SECRET", "test-secret-key")
	defer os.Unsetenv("JWT_SECRET")

	// Create routes with role middleware
	adminRoute := r.Group("/admin")
	adminRoute.Use(middleware.AuthMiddleware(), middleware.RoleMiddleware("admin"))
	adminRoute.GET("/dashboard", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "Admin dashboard"})
	})

	ownerRoute := r.Group("/owner")
	ownerRoute.Use(middleware.AuthMiddleware(), middleware.RoleMiddleware("owner"))
	ownerRoute.GET("/dashboard", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "Owner dashboard"})
	})

	// Test case: User with correct role
	t.Run("User with Correct Role", func(t *testing.T) {
		// Generate admin token
		adminID := uuid.New()
		adminToken, err := utils.GenerateJWT(adminID, "admin@example.com", "admin")
		assert.NoError(t, err)

		// Access admin route with admin token
		req, _ := http.NewRequest(http.MethodGet, "/admin/dashboard", nil)
		req.Header.Set("Authorization", "Bearer "+adminToken)

		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		// Should succeed
		assert.Equal(t, http.StatusOK, w.Code)
	})

	// Test case: User with incorrect role
	t.Run("User with Incorrect Role", func(t *testing.T) {
		// Generate tenant token
		tenantID := uuid.New()
		tenantToken, err := utils.GenerateJWT(tenantID, "tenant@example.com", "tenant")
		assert.NoError(t, err)

		// Try to access admin route with tenant token
		req, _ := http.NewRequest(http.MethodGet, "/admin/dashboard", nil)
		req.Header.Set("Authorization", "Bearer "+tenantToken)

		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		// Should return forbidden
		assert.Equal(t, http.StatusForbidden, w.Code)
	})
}
