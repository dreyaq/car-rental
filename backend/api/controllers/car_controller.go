package controllers

import (
	"fmt"
	"net/http"

	"car-rental/config"
	"car-rental/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type CreateCarRequest struct {
	Brand              string      `json:"brand" binding:"required"`
	Make               string      `json:"make"`
	Model              string      `json:"model" binding:"required"`
	Year               int         `json:"year" binding:"required,min=1900"`
	RegistrationNumber string      `json:"registrationNumber" binding:"required"`
	BodyType           string      `json:"bodyType" binding:"required"`
	Category           string      `json:"category"`
	Color              string      `json:"color" binding:"required"`
	Seats              int         `json:"seats" binding:"required,min=1"`
	Doors              int         `json:"doors"`
	Location           string      `json:"location"`
	Transmission       string      `json:"transmission" binding:"required"`
	FuelType           string      `json:"fuelType" binding:"required"`
	FuelConsumption    float64     `json:"fuelConsumption" binding:"required"`
	DriverIncluded     bool        `json:"driverIncluded"`
	PricePerDay        float64     `json:"pricePerDay" binding:"required"`
	PricePerWeek       float64     `json:"pricePerWeek"`
	PricePerMonth      float64     `json:"pricePerMonth"`
	Description        string      `json:"description"`
	Features           []uuid.UUID `json:"features"`
}

func GetCars(c *gin.Context) {
	brand := c.Query("brand")
	model := c.Query("model")
	bodyType := c.Query("bodyType")
	minPriceStr := c.Query("minPrice")
	maxPriceStr := c.Query("maxPrice")
	availableStr := c.Query("available")

	db := config.DB.Model(&models.Car{})

	if brand != "" {
		db = db.Where("brand ILIKE ?", "%"+brand+"%")
	}
	if model != "" {
		db = db.Where("model ILIKE ?", "%"+model+"%")
	}
	if bodyType != "" {
		db = db.Where("body_type = ?", bodyType)
	}
	if minPriceStr != "" {
		db = db.Where("price_per_day >= ?", minPriceStr)
	}
	if maxPriceStr != "" {
		db = db.Where("price_per_day <= ?", maxPriceStr)
	}
	if availableStr == "false" {
		db = db.Where("is_available = ?", false)
	} else {
		db = db.Where("is_available = ?", true)
	}

	var cars []models.Car
	if err := db.Preload("Features").Preload("Images").Find(&cars).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch cars"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"cars": cars})
}

func GetCarByID(c *gin.Context) {
	carID := c.Param("id")

	_, err := uuid.Parse(carID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid car ID format"})
		return
	}

	var car models.Car
	if err := config.DB.Preload("Features").Preload("Images").First(&car, "id = ?", carID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Car not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"car": car})
}

func CreateCar(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID not found in context"})
		return
	}

	fmt.Printf("CreateCar - UserID: %v, Type: %T\n", userID, userID)

	var req CreateCarRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		fmt.Printf("CreateCar - JSON binding error: %v\n", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	fmt.Printf("CreateCar - Request data: %+v\n", req)
	make := req.Make
	if make == "" {
		make = req.Brand
	}

	category := req.Category
	if category == "" {
		category = string(req.BodyType)
	}

	doors := req.Doors
	if doors == 0 {
		doors = 4
	}

	location := req.Location
	if location == "" {
		location = "Default Location"
	}

	car := models.Car{
		OwnerID:            userID.(uuid.UUID),
		Brand:              req.Brand,
		Make:               make,
		Model:              req.Model,
		Year:               req.Year,
		RegistrationNumber: req.RegistrationNumber,
		BodyType:           models.BodyType(req.BodyType),
		Category:           category,
		Color:              req.Color,
		Seats:              req.Seats,
		Doors:              doors,
		Location:           location,
		Transmission:       models.TransmissionType(req.Transmission),
		FuelType:           models.FuelType(req.FuelType),
		FuelConsumption:    req.FuelConsumption,
		DriverIncluded:     req.DriverIncluded,
		PricePerDay:        req.PricePerDay,
		PricePerWeek:       req.PricePerWeek,
		PricePerMonth:      req.PricePerMonth,
		Description:        req.Description,
		IsAvailable:        true,
	}

	tx := config.DB.Begin()
	if err := tx.Create(&car).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create car"})
		return
	}

	if len(req.Features) > 0 {
		var features []models.CarFeature
		for _, featureID := range req.Features {
			var feature models.CarFeature
			if err := tx.First(&feature, "id = ?", featureID).Error; err == nil {
				features = append(features, feature)
			}
		}

		if len(features) > 0 {
			if err := tx.Model(&car).Association("Features").Append(features); err != nil {
				tx.Rollback()
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to associate features"})
				return
			}
		}
	}

	var requestBody struct {
		Images []models.CarImage `json:"images"`
	}

	if err := c.ShouldBindJSON(&requestBody); err == nil && len(requestBody.Images) > 0 {
		fmt.Printf("Found %d images in the create request\n", len(requestBody.Images))

		for _, img := range requestBody.Images {
			newImage := models.CarImage{
				CarID:     car.ID,
				ImagePath: img.ImagePath,
				IsMain:    img.IsMain,
			}
			if err := tx.Create(&newImage).Error; err != nil {
				fmt.Printf("Error creating image: %v\n", err)
			}
		}
	}

	if err := tx.Commit().Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to commit transaction"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Car created successfully",
		"car":     car,
	})
}

func UpdateCar(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID not found in context"})
		return
	}

	carID := c.Param("id")

	carUUID, err := uuid.Parse(carID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid car ID format"})
		return
	}

	var car models.Car
	if err := config.DB.First(&car, "id = ?", carUUID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Car not found"})
		return
	}

	if car.OwnerID != userID.(uuid.UUID) {
		c.JSON(http.StatusForbidden, gin.H{"error": "You are not authorized to update this car"})
		return
	}

	var req CreateCarRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	updates := models.Car{
		Brand:              req.Brand,
		Model:              req.Model,
		Year:               req.Year,
		RegistrationNumber: req.RegistrationNumber,
		BodyType:           models.BodyType(req.BodyType),
		Color:              req.Color,
		Seats:              req.Seats,
		Transmission:       models.TransmissionType(req.Transmission),
		FuelType:           models.FuelType(req.FuelType),
		FuelConsumption:    req.FuelConsumption,
		DriverIncluded:     req.DriverIncluded,
		PricePerDay:        req.PricePerDay,
		PricePerWeek:       req.PricePerWeek,
		PricePerMonth:      req.PricePerMonth,
		Description:        req.Description,
	}

	tx := config.DB.Begin()

	if err := tx.Model(&car).Updates(updates).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update car"})
		return
	}

	if len(req.Features) > 0 {
		if err := tx.Model(&car).Association("Features").Clear(); err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to clear existing features"})
			return
		}

		var features []models.CarFeature
		for _, featureID := range req.Features {
			var feature models.CarFeature
			if err := tx.First(&feature, "id = ?", featureID).Error; err == nil {
				features = append(features, feature)
			}
		}

		if len(features) > 0 {
			if err := tx.Model(&car).Association("Features").Append(features); err != nil {
				tx.Rollback()
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to associate features"})
				return
			}
		}
	}
	if err := tx.Commit().Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to commit transaction"})
		return
	}
	var requestBody struct {
		Images []models.CarImage `json:"images"`
	}
	if err := c.ShouldBindJSON(&requestBody); err == nil && len(requestBody.Images) > 0 {
		fmt.Printf("Found %d images in the update request\n", len(requestBody.Images))

		imgTx := config.DB.Begin()

		if err := imgTx.Where("car_id = ?", carUUID).Delete(&models.CarImage{}).Error; err != nil {
			imgTx.Rollback()
			fmt.Printf("Error deleting existing images: %v\n", err)
		}

		for _, img := range requestBody.Images {
			newImage := models.CarImage{
				CarID:     carUUID,
				ImagePath: img.ImagePath,
				IsMain:    img.IsMain,
			}
			if err := imgTx.Create(&newImage).Error; err != nil {
				imgTx.Rollback()
				fmt.Printf("Error creating new image: %v\n", err)
				break
			}
		}

		if err := imgTx.Commit().Error; err != nil {
			fmt.Printf("Error committing image transaction: %v\n", err)
		}
	} else {
		fmt.Printf("No images found in the update request or error parsing: %v\n", err)
	}

	if err := config.DB.Preload("Features").Preload("Images").First(&car, "id = ?", carUUID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to reload car data"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Car updated successfully",
		"car":     car,
	})
}

func DeleteCar(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID not found in context"})
		return
	}

	carID := c.Param("id")

	carUUID, err := uuid.Parse(carID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid car ID format"})
		return
	}

	var car models.Car
	if err := config.DB.First(&car, "id = ?", carUUID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Car not found"})
		return
	}

	if car.OwnerID != userID.(uuid.UUID) {
		c.JSON(http.StatusForbidden, gin.H{"error": "You are not authorized to delete this car"})
		return
	}

	var activeRentalsCount int64
	config.DB.Model(&models.Rental{}).Where("car_id = ? AND status IN ?", carUUID, []models.RentalStatus{
		models.StatusPending,
		models.StatusConfirmed,
		models.StatusActive,
	}).Count(&activeRentalsCount)

	if activeRentalsCount > 0 {
		c.JSON(http.StatusConflict, gin.H{"error": "Cannot delete car with active rentals"})
		return
	}

	if err := config.DB.Delete(&car).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete car"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Car deleted successfully"})
}

func GetCarFeatures(c *gin.Context) {
	var features []models.CarFeature
	if err := config.DB.Find(&features).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch car features"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"features": features})
}

func GetOwnerCars(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID not found in context"})
		return
	}

	fmt.Printf("GetOwnerCars - UserID: %v, Type: %T\n", userID, userID)

	var cars []models.Car
	if err := config.DB.Where("owner_id = ?", userID).Preload("Features").Preload("Images").Find(&cars).Error; err != nil {
		fmt.Printf("GetOwnerCars - Database error: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch owner's cars"})
		return
	}

	fmt.Printf("GetOwnerCars - Found %d cars for owner\n", len(cars))
	c.JSON(http.StatusOK, gin.H{"cars": cars})
}

func GetOwnerCarById(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID not found in context"})
		return
	}

	carID := c.Param("id")

	carUUID, err := uuid.Parse(carID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid car ID format"})
		return
	}

	var car models.Car
	if err := config.DB.Where("id = ? AND owner_id = ?", carUUID, userID).Preload("Features").Preload("Images").First(&car).Error; err != nil {
		fmt.Printf("GetOwnerCarById - Error: %v\n", err)
		c.JSON(http.StatusNotFound, gin.H{"error": "Car not found or you are not the owner"})
		return
	}

	fmt.Printf("GetOwnerCarById - Found car %s for owner %v\n", car.ID, userID)
	c.JSON(http.StatusOK, gin.H{"car": car})
}
