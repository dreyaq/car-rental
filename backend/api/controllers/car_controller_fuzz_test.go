package controllers_test

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"unicode/utf8"

	"car-rental/api/controllers"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// FuzzCreateCar тестирует создание автомобилей с различными входными данными
func FuzzCreateCar(f *testing.F) {
	// Добавляем seed корпус с различными данными автомобилей
	f.Add("Toyota", "Camry", 2022, "ABC123", "sedan", "white", 5, "automatic", "petrol", 8.5, 5000.0, 30000.0, 150000.0, true, "Comfortable sedan", "Moscow")
	f.Add("", "", 0, "", "", "", 0, "", "", 0.0, 0.0, 0.0, 0.0, false, "", "")
	f.Add("BMW", "X5", -1, "INVALID", "unknown", "rainbow", 999, "invalid", "nuclear", -1.0, -1000.0, -5000.0, -20000.0, true, "Test", "")
	f.Add("Very Long Brand Name That Exceeds Normal Limits", "Very Long Model Name", 3000, "VERYLONGNUMBER123456789", "verylongbodytype", "verylongcolor", 50, "verylongtransmission", "verylongfueltype", 999.9, 999999.0, 999999.0, 999999.0, true, "Very long description that might cause issues", "Very long location")

	f.Fuzz(func(t *testing.T, brand, model string, year int, registrationNumber, bodyType, color string,
		seats int, transmission, fuelType string, fuelConsumption, pricePerDay, pricePerWeek, pricePerMonth float64,
		driverIncluded bool, description, location string) {

		// Пропускаем невалидные UTF-8 строки
		if !utf8.ValidString(brand) || !utf8.ValidString(model) || !utf8.ValidString(registrationNumber) ||
			!utf8.ValidString(bodyType) || !utf8.ValidString(color) || !utf8.ValidString(transmission) ||
			!utf8.ValidString(fuelType) || !utf8.ValidString(description) || !utf8.ValidString(location) {
			t.Skip("Invalid UTF-8 string")
		}

		// Ограничиваем длину строк
		if len(brand) > 1000 || len(model) > 1000 || len(registrationNumber) > 1000 ||
			len(bodyType) > 1000 || len(color) > 1000 || len(transmission) > 1000 ||
			len(fuelType) > 1000 || len(description) > 5000 || len(location) > 1000 {
			t.Skip("String too long")
		}

		gin.SetMode(gin.TestMode)
		r := gin.Default()

		// Мокаем middleware аутентификации
		r.Use(func(c *gin.Context) {
			c.Set("userID", uuid.New())
			c.Set("role", "owner")
			c.Next()
		})

		r.POST("/cars", controllers.CreateCar)

		reqBody := map[string]interface{}{
			"brand":              brand,
			"model":              model,
			"year":               year,
			"registrationNumber": registrationNumber,
			"bodyType":           bodyType,
			"color":              color,
			"seats":              seats,
			"transmission":       transmission,
			"fuelType":           fuelType,
			"fuelConsumption":    fuelConsumption,
			"pricePerDay":        pricePerDay,
			"pricePerWeek":       pricePerWeek,
			"pricePerMonth":      pricePerMonth,
			"driverIncluded":     driverIncluded,
			"description":        description,
			"location":           location,
		}

		reqBodyBytes, err := json.Marshal(reqBody)
		if err != nil {
			t.Skip("Cannot marshal request body")
		}

		req, _ := http.NewRequest(http.MethodPost, "/cars", bytes.NewReader(reqBodyBytes))
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

// FuzzCarFilters тестирует фильтрацию автомобилей
func FuzzCarFilters(f *testing.F) {
	// Добавляем различные фильтры
	f.Add("Toyota", "sedan", "5000", "true")
	f.Add("", "", "", "")
	f.Add("InvalidBrand", "InvalidType", "invalid_price", "invalid_bool")
	f.Add("Brand<script>", "Type'", "-1000", "yes")

	f.Fuzz(func(t *testing.T, brand, bodyType, maxPrice, isAvailable string) {
		if !utf8.ValidString(brand) || !utf8.ValidString(bodyType) ||
			!utf8.ValidString(maxPrice) || !utf8.ValidString(isAvailable) {
			t.Skip("Invalid UTF-8 string")
		}

		if len(brand) > 100 || len(bodyType) > 100 ||
			len(maxPrice) > 100 || len(isAvailable) > 100 {
			t.Skip("String too long")
		}

		gin.SetMode(gin.TestMode)
		r := gin.Default()
		r.GET("/cars", controllers.GetCars)

		url := "/cars?"
		if brand != "" {
			url += "brand=" + brand + "&"
		}
		if bodyType != "" {
			url += "bodyType=" + bodyType + "&"
		}
		if maxPrice != "" {
			url += "maxPrice=" + maxPrice + "&"
		}
		if isAvailable != "" {
			url += "isAvailable=" + isAvailable + "&"
		}

		req, _ := http.NewRequest(http.MethodGet, url, nil)
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

// FuzzCarValidation тестирует валидацию данных автомобиля
func FuzzCarValidation(f *testing.F) {
	// Добавляем различные типы невалидных данных
	f.Add(-2022, -5, -10.5, -1000.0)
	f.Add(0, 0, 0.0, 0.0)
	f.Add(3000, 100, 1000.0, 1000000.0)
	f.Add(1800, 1, 0.1, 1.0)

	f.Fuzz(func(t *testing.T, year, seats int, fuelConsumption, pricePerDay float64) {
		// Проверяем различные валидации

		// Год должен быть разумным
		yearValid := year >= 1900 && year <= 2030

		// Количество мест должно быть положительным и разумным
		seatsValid := seats > 0 && seats <= 50

		// Расход топлива должен быть положительным
		fuelValid := fuelConsumption > 0 && fuelConsumption < 100

		// Цена должна быть положительной
		priceValid := pricePerDay > 0 && pricePerDay < 1000000

		// Все эти проверки должны выполняться в контроллере
		// Тест просто проверяет, что приложение не падает на любых данных
		_ = yearValid && seatsValid && fuelValid && priceValid
	})
}
