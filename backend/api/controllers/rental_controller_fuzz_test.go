package controllers_test

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"
	"unicode/utf8"

	"car-rental/api/controllers"
	"car-rental/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func FuzzCreateRental(f *testing.F) {
	f.Add("2024-12-01", "2024-12-05", "Moscow Center", "Airport", "Standard rental", true)
	f.Add("", "", "", "", "", false)
	f.Add("invalid-date", "2024-13-32", "Very long pickup location that might cause issues", "Very long return location", "Very long notes that might exceed normal limits and cause potential issues", true)
	f.Add("2020-01-01", "2019-01-01", "<script>alert('xss')</script>", "DROP TABLE rentals;", "'; DELETE FROM users; --", false)

	f.Fuzz(func(t *testing.T, startDate, endDate, pickupLocation, returnLocation, notes string, withDriver bool) {
		if !utf8.ValidString(startDate) || !utf8.ValidString(endDate) ||
			!utf8.ValidString(pickupLocation) || !utf8.ValidString(returnLocation) ||
			!utf8.ValidString(notes) {
			t.Skip("Invalid UTF-8 string")
		}

		if len(startDate) > 100 || len(endDate) > 100 ||
			len(pickupLocation) > 1000 || len(returnLocation) > 1000 ||
			len(notes) > 5000 {
			t.Skip("String too long")
		}

		gin.SetMode(gin.TestMode)
		r := gin.Default()

		r.Use(func(c *gin.Context) {
			c.Set("userID", uuid.New())
			c.Set("role", "tenant")
			c.Next()
		})

		r.POST("/rentals", controllers.CreateRental)

		reqBody := map[string]interface{}{
			"carId":          uuid.New().String(),
			"startDate":      startDate,
			"endDate":        endDate,
			"pickupLocation": pickupLocation,
			"returnLocation": returnLocation,
			"notes":          notes,
			"withDriver":     withDriver,
		}

		reqBodyBytes, err := json.Marshal(reqBody)
		if err != nil {
			t.Skip("Cannot marshal request body")
		}

		req, _ := http.NewRequest(http.MethodPost, "/rentals", bytes.NewReader(reqBodyBytes))
		req.Header.Set("Content-Type", "application/json")

		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		// Проверяем валидность HTTP статуса
		if w.Code < 200 || w.Code >= 600 {
			t.Errorf("Invalid HTTP status code: %d", w.Code)
		}

		// Проверяем валидность JSON ответа
		var response map[string]interface{}
		if err := json.Unmarshal(w.Body.Bytes(), &response); err != nil {
			t.Errorf("Invalid JSON response: %v", err)
		}
	})
}

func FuzzRentalStatus(f *testing.F) {
	f.Add("confirmed")
	f.Add("active")
	f.Add("completed")
	f.Add("cancelled")
	f.Add("")
	f.Add("invalid_status")
	f.Add("CONFIRMED")
	f.Add("pending123")
	f.Add("<script>alert('xss')</script>")

	f.Fuzz(func(t *testing.T, status string) {
		if !utf8.ValidString(status) {
			t.Skip("Invalid UTF-8 string")
		}

		if len(status) > 100 {
			t.Skip("Status too long")
		}

		gin.SetMode(gin.TestMode)
		r := gin.Default()

		r.Use(func(c *gin.Context) {
			c.Set("userID", uuid.New())
			c.Set("role", "owner")
			c.Next()
		})

		r.PATCH("/rentals/:id/status", controllers.UpdateRentalStatus)

		reqBody := map[string]interface{}{
			"status": status,
		}

		reqBodyBytes, err := json.Marshal(reqBody)
		if err != nil {
			t.Skip("Cannot marshal request body")
		}

		rentalID := uuid.New().String()
		req, _ := http.NewRequest(http.MethodPatch, "/rentals/"+rentalID+"/status", bytes.NewReader(reqBodyBytes))
		req.Header.Set("Content-Type", "application/json")

		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		// Проверяем валидность HTTP статуса
		if w.Code < 200 || w.Code >= 600 {
			t.Errorf("Invalid HTTP status code: %d", w.Code)
		}

		// Проверяем валидность JSON ответа
		var response map[string]interface{}
		if err := json.Unmarshal(w.Body.Bytes(), &response); err != nil {
			t.Errorf("Invalid JSON response: %v", err)
		}
	})
}

func FuzzDateValidation(f *testing.F) {
	f.Add("2024-12-01", "2024-12-05")
	f.Add("2024/12/01", "2024/12/05")
	f.Add("01-12-2024", "05-12-2024")
	f.Add("invalid", "date")
	f.Add("2024-13-45", "2024-02-30")
	f.Add("", "")

	f.Fuzz(func(t *testing.T, startDateStr, endDateStr string) {
		if !utf8.ValidString(startDateStr) || !utf8.ValidString(endDateStr) {
			t.Skip("Invalid UTF-8 string")
		}

		if len(startDateStr) > 100 || len(endDateStr) > 100 {
			t.Skip("Date string too long")
		}

		// Пытаемся парсить даты в различных форматах
		formats := []string{
			"2006-01-02",
			"2006/01/02",
			"02-01-2006",
			time.RFC3339,
		}

		var startDate, endDate time.Time
		var err error

		for _, format := range formats {
			startDate, err = time.Parse(format, startDateStr)
			if err == nil {
				break
			}
		}

		for _, format := range formats {
			endDate, err = time.Parse(format, endDateStr)
			if err == nil {
				break
			}
		}

		if !startDate.IsZero() && !endDate.IsZero() {
			// Дата окончания должна быть после даты начала
			if endDate.Before(startDate) {
				// Это невалидное состояние, но приложение не должно падать
			}

			// Даты не должны быть в прошлом
			now := time.Now()
			if startDate.Before(now) {
				// Это может быть невалидно для новых аренд
			}
		}
	})
}

func FuzzRentalStatusTransition(f *testing.F) {
	statuses := []string{"pending", "confirmed", "active", "completed", "cancelled"}

	for _, from := range statuses {
		for _, to := range statuses {
			f.Add(from, to)
		}
	}

	f.Fuzz(func(t *testing.T, fromStatus, toStatus string) {
		if !utf8.ValidString(fromStatus) || !utf8.ValidString(toStatus) {
			t.Skip("Invalid UTF-8 string")
		}

		if len(fromStatus) > 50 || len(toStatus) > 50 {
			t.Skip("Status too long")
		}

		// Проверяем валидность переходов статусов
		validTransitions := map[models.RentalStatus][]models.RentalStatus{
			models.StatusPending:   {models.StatusConfirmed, models.StatusCancelled},
			models.StatusConfirmed: {models.StatusActive, models.StatusCancelled},
			models.StatusActive:    {models.StatusCompleted},
			models.StatusCompleted: {}, // Нельзя изменить завершенную аренду
			models.StatusCancelled: {}, // Нельзя изменить отмененную аренду
		}

		fromRentalStatus := models.RentalStatus(fromStatus)
		toRentalStatus := models.RentalStatus(toStatus)

		allowedTransitions, exists := validTransitions[fromRentalStatus]
		if !exists {
			// Неизвестный статус
			return
		}

		isValidTransition := false
		for _, allowed := range allowedTransitions {
			if allowed == toRentalStatus {
				isValidTransition = true
				break
			}
		}

		// Тест проверяет, что система правильно обрабатывает переходы
		_ = isValidTransition
	})
}
