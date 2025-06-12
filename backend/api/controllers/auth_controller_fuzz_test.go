package controllers_test

import (
	"encoding/json"
	"testing"
	"unicode/utf8"

	"car-rental/models"
)

// FuzzUserRole тестирует различные роли пользователей без подключения к БД
func FuzzUserRole(f *testing.F) {
	// Добавляем различные роли
	f.Add("tenant")
	f.Add("owner")
	f.Add("admin")
	f.Add("")
	f.Add("invalid_role")
	f.Add("TENANT")
	f.Add("Owner")

	f.Fuzz(func(t *testing.T, role string) {
		if !utf8.ValidString(role) {
			t.Skip("Invalid UTF-8 string")
		}

		if len(role) > 1000 {
			t.Skip("Role too long")
		}

		// Проверяем логику валидации роли без обращения к БД
		userRole := models.UserRole(role)

		// Проверяем валидность роли
		validRoles := []models.UserRole{
			models.RoleTenant,
			models.RoleOwner,
			models.RoleAdmin,
		}

		isValid := false
		for _, validRole := range validRoles {
			if userRole == validRole {
				isValid = true
				break
			}
		}

		// Проверяем, что UserRole корректно кастится и не вызывает панику
		roleString := string(userRole)
		_ = roleString

		// Тестируем создание пользователя с фаззинг ролью
		user := models.User{
			Email:        "test@example.com",
			PasswordHash: "hash",
			FirstName:    "Test",
			LastName:     "User",
			Phone:        "+1234567890",
			Role:         userRole,
		}

		// Проверяем, что структура создается без паники
		_ = user
		_ = isValid
	})
}

// FuzzRegisterData тестирует структуры данных регистрации
func FuzzRegisterData(f *testing.F) {
	f.Add("john@example.com", "John", "Doe", "+1234567890", "password123", "tenant")
	f.Add("", "", "", "", "", "")
	f.Add("invalid-email", "A", "B", "123", "p", "invalid")

	f.Fuzz(func(t *testing.T, email, firstName, lastName, phone, password, role string) {
		if !utf8.ValidString(email) || !utf8.ValidString(firstName) ||
			!utf8.ValidString(lastName) || !utf8.ValidString(phone) ||
			!utf8.ValidString(password) || !utf8.ValidString(role) {
			t.Skip("Invalid UTF-8 string")
		}

		if len(email) > 1000 || len(firstName) > 1000 || len(lastName) > 1000 ||
			len(phone) > 1000 || len(password) > 1000 || len(role) > 100 {
			t.Skip("String too long")
		}

		// Тестируем создание JSON структуры
		reqBody := map[string]interface{}{
			"email":     email,
			"firstName": firstName,
			"lastName":  lastName,
			"phone":     phone,
			"password":  password,
			"role":      role,
		}

		reqBodyBytes, err := json.Marshal(reqBody)
		if err != nil {
			t.Skip("Cannot marshal request body")
		}

		// Проверяем, что можем обратно распарсить JSON
		var testUnmarshal map[string]interface{}
		if err := json.Unmarshal(reqBodyBytes, &testUnmarshal); err != nil {
			t.Errorf("Invalid JSON structure: %v", err)
		}

		// Тестируем создание пользователя с валидными ролями
		if role == "tenant" || role == "owner" || role == "admin" {
			user := models.User{
				Email:     email,
				FirstName: firstName,
				LastName:  lastName,
				Phone:     phone,
				Role:      models.UserRole(role),
			}
			_ = user
		}
	})
}

// FuzzLoginData тестирует структуры данных логина
func FuzzLoginData(f *testing.F) {
	f.Add("test@example.com", "password123")
	f.Add("", "")
	f.Add("invalid-email", "short")

	f.Fuzz(func(t *testing.T, email, password string) {
		if !utf8.ValidString(email) || !utf8.ValidString(password) {
			t.Skip("Invalid UTF-8 string")
		}

		if len(email) > 1000 || len(password) > 1000 {
			t.Skip("String too long")
		}

		// Тестируем создание JSON структуры
		reqBody := map[string]interface{}{
			"email":    email,
			"password": password,
		}

		reqBodyBytes, err := json.Marshal(reqBody)
		if err != nil {
			t.Skip("Cannot marshal request body")
		}

		// Проверяем, что можем обратно распарсить JSON
		var testUnmarshal map[string]interface{}
		if err := json.Unmarshal(reqBodyBytes, &testUnmarshal); err != nil {
			t.Errorf("Invalid JSON structure: %v", err)
		}
	})
}
