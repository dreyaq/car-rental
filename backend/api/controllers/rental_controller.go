package controllers

import (
	"net/http"
	"time"

	"encoding/json"

	"car-rental/config"
	"car-rental/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/streadway/amqp"
)

type CreateRentalRequest struct {
	CarID          uuid.UUID `json:"carId" binding:"required"`
	StartDate      string    `json:"startDate" binding:"required"`
	EndDate        string    `json:"endDate" binding:"required"`
	WithDriver     bool      `json:"withDriver"`
	PickupLocation string    `json:"pickupLocation"`
	ReturnLocation string    `json:"returnLocation"`
	Notes          string    `json:"notes"`
}

func GetRentals(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID not found in context"})
		return
	}

	role, _ := c.Get("role")
	userRole := role.(string)

	var rentals []models.Rental
	query := config.DB.Preload("Car").Preload("Tenant")

	if userRole == string(models.RoleTenant) {
		query = query.Where("tenant_id = ?", userID)
	} else if userRole == string(models.RoleOwner) {
		query = query.Joins("JOIN cars ON cars.id = rentals.car_id").
			Where("cars.owner_id = ?", userID)
	}

	if err := query.Find(&rentals).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch rentals"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"rentals": rentals})
}

func GetRentalByID(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID not found in context"})
		return
	}

	role, _ := c.Get("role")
	userRole := role.(string)

	rentalID := c.Param("id")

	rentalUUID, err := uuid.Parse(rentalID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid rental ID format"})
		return
	}

	var rental models.Rental
	if err := config.DB.Preload("Car").Preload("Tenant").First(&rental, "id = ?", rentalUUID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Rental not found"})
		return
	}

	if userRole == string(models.RoleTenant) && rental.TenantID != userID.(uuid.UUID) {
		c.JSON(http.StatusForbidden, gin.H{"error": "You are not authorized to view this rental"})
		return
	} else if userRole == string(models.RoleOwner) {
		var car models.Car
		if err := config.DB.First(&car, "id = ?", rental.CarID).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch car data"})
			return
		}

		if car.OwnerID != userID.(uuid.UUID) {
			c.JSON(http.StatusForbidden, gin.H{"error": "You are not authorized to view this rental"})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{"rental": rental})
}

func CreateRental(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID not found in context"})
		return
	}

	var req CreateRentalRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	startDate, err := time.Parse("2006-01-02", req.StartDate)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid start date format, use YYYY-MM-DD"})
		return
	}

	endDate, err := time.Parse("2006-01-02", req.EndDate)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid end date format, use YYYY-MM-DD"})
		return
	}

	if startDate.Before(time.Now().Truncate(24 * time.Hour)) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Start date cannot be in the past"})
		return
	}

	if endDate.Before(startDate) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "End date cannot be before start date"})
		return
	}

	var car models.Car
	if err := config.DB.First(&car, "id = ?", req.CarID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Car not found"})
		return
	}

	if !car.IsAvailable {
		c.JSON(http.StatusConflict, gin.H{"error": "Car is not available for rental"})
		return
	}

	if req.WithDriver && !car.DriverIncluded {
		c.JSON(http.StatusConflict, gin.H{"error": "This car is not available with driver"})
		return
	}

	var overlappingRentalsCount int64
	config.DB.Model(&models.Rental{}).
		Where("car_id = ? AND status IN ? AND NOT (end_date < ? OR start_date > ?)",
			req.CarID,
			[]models.RentalStatus{models.StatusConfirmed, models.StatusActive},
			startDate,
			endDate).
		Count(&overlappingRentalsCount)

	if overlappingRentalsCount > 0 {
		c.JSON(http.StatusConflict, gin.H{"error": "Car is already booked for the selected dates"})
		return
	}

	duration := endDate.Sub(startDate)
	days := int(duration.Hours()/24) + 1

	var totalPrice float64
	if days <= 7 {
		totalPrice = car.PricePerDay * float64(days)
	} else if days <= 30 {
		if car.PricePerWeek > 0 {
			weeks := days / 7
			remainingDays := days % 7
			totalPrice = (car.PricePerWeek * float64(weeks)) + (car.PricePerDay * float64(remainingDays))
		} else {
			totalPrice = car.PricePerDay * float64(days)
		}
	} else {
		if car.PricePerMonth > 0 {
			months := days / 30
			remainingDays := days % 30
			if car.PricePerWeek > 0 {
				weeks := remainingDays / 7
				remainingDays = remainingDays % 7
				totalPrice = (car.PricePerMonth * float64(months)) + (car.PricePerWeek * float64(weeks)) + (car.PricePerDay * float64(remainingDays))
			} else {
				totalPrice = (car.PricePerMonth * float64(months)) + (car.PricePerDay * float64(remainingDays))
			}
		} else if car.PricePerWeek > 0 {
			weeks := days / 7
			remainingDays := days % 7
			totalPrice = (car.PricePerWeek * float64(weeks)) + (car.PricePerDay * float64(remainingDays))
		} else {
			totalPrice = car.PricePerDay * float64(days)
		}
	}
	userUUID := userID.(uuid.UUID)
	rental := models.Rental{
		CarID:          req.CarID,
		TenantID:       userUUID,
		RenterID:       userUUID,
		StartDate:      startDate,
		EndDate:        endDate,
		TotalPrice:     totalPrice,
		Status:         models.StatusPending,
		WithDriver:     req.WithDriver,
		PaymentStatus:  "unpaid",
		PickupLocation: req.PickupLocation,
		ReturnLocation: req.ReturnLocation,
		Notes:          req.Notes,
	}

	tx := config.DB.Begin()

	if err := tx.Create(&rental).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create rental"})
		return
	}

	if err := tx.Commit().Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to commit transaction"})
		return
	}

	notifyOwner(car.OwnerID, rental.ID, "New Rental Request",
		"A new rental request has been received for your car "+car.Brand+" "+car.Model)

	c.JSON(http.StatusCreated, gin.H{
		"message": "Rental request created successfully",
		"rental":  rental,
	})
}

func UpdateRentalStatus(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID not found in context"})
		return
	}

	role, _ := c.Get("role")
	userRole := role.(string)

	rentalID := c.Param("id")

	rentalUUID, err := uuid.Parse(rentalID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid rental ID format"})
		return
	}

	var req struct {
		Status string `json:"status" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	newStatus := models.RentalStatus(req.Status)
	validStatuses := []models.RentalStatus{
		models.StatusConfirmed,
		models.StatusActive,
		models.StatusCompleted,
		models.StatusCancelled,
	}

	isValidStatus := false
	for _, status := range validStatuses {
		if newStatus == status {
			isValidStatus = true
			break
		}
	}

	if !isValidStatus {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid status"})
		return
	}

	var rental models.Rental
	if err := config.DB.Preload("Car").First(&rental, "id = ?", rentalUUID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Rental not found"})
		return
	}

	if userRole == string(models.RoleTenant) {
		if rental.TenantID != userID.(uuid.UUID) {
			c.JSON(http.StatusForbidden, gin.H{"error": "You are not authorized to update this rental"})
			return
		}

		if newStatus != models.StatusCancelled {
			c.JSON(http.StatusForbidden, gin.H{"error": "Tenants can only cancel rentals"})
			return
		}

		if rental.Status == models.StatusActive || rental.Status == models.StatusCompleted {
			c.JSON(http.StatusConflict, gin.H{"error": "Cannot cancel an active or completed rental"})
			return
		}
	} else if userRole == string(models.RoleOwner) {
		var car models.Car
		if err := config.DB.First(&car, "id = ?", rental.CarID).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch car data"})
			return
		}

		if car.OwnerID != userID.(uuid.UUID) {
			c.JSON(http.StatusForbidden, gin.H{"error": "You are not authorized to update this rental"})
			return
		}

		if rental.Status == models.StatusPending && newStatus != models.StatusConfirmed && newStatus != models.StatusCancelled {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Pending rentals can only be confirmed or cancelled"})
			return
		}

		if rental.Status == models.StatusConfirmed && newStatus != models.StatusActive && newStatus != models.StatusCancelled {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Confirmed rentals can only be set to active or cancelled"})
			return
		}

		if rental.Status == models.StatusActive && newStatus != models.StatusCompleted {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Active rentals can only be completed"})
			return
		}

		if rental.Status == models.StatusCompleted || rental.Status == models.StatusCancelled {
			c.JSON(http.StatusConflict, gin.H{"error": "Cannot change status of completed or cancelled rentals"})
			return
		}
	}

	if err := config.DB.Model(&rental).Update("status", newStatus).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update rental status"})
		return
	}

	if newStatus == models.StatusConfirmed {
		if err := config.DB.Model(&models.Car{}).Where("id = ?", rental.CarID).Update("is_available", false).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update car availability"})
			return
		}
	}

	if newStatus == models.StatusCompleted {
		if err := config.DB.Model(&models.Car{}).Where("id = ?", rental.CarID).Update("is_available", true).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update car availability"})
			return
		}
	}

	var notificationTitle, notificationMessage string
	var notifyUserID uuid.UUID

	switch newStatus {
	case models.StatusConfirmed:
		notificationTitle = "Rental Confirmed"
		notificationMessage = "Your rental request for " + rental.Car.Brand + " " + rental.Car.Model + " has been confirmed"
		notifyUserID = rental.TenantID
	case models.StatusActive:
		notificationTitle = "Rental Started"
		notificationMessage = "Your rental for " + rental.Car.Brand + " " + rental.Car.Model + " is now active"
		notifyUserID = rental.TenantID
	case models.StatusCompleted:
		notificationTitle = "Rental Completed"
		notificationMessage = "Your rental for " + rental.Car.Brand + " " + rental.Car.Model + " has been completed"
		notifyUserID = rental.TenantID
	case models.StatusCancelled:
		if userRole == string(models.RoleTenant) {
			notificationTitle = "Rental Cancelled by Tenant"
			notificationMessage = "A rental request for " + rental.Car.Brand + " " + rental.Car.Model + " has been cancelled by the tenant"
			var car models.Car
			if err := config.DB.First(&car, "id = ?", rental.CarID).Error; err == nil {
				notifyUserID = car.OwnerID
			}
		} else {
			notificationTitle = "Rental Cancelled by Owner"
			notificationMessage = "Your rental request for " + rental.Car.Brand + " " + rental.Car.Model + " has been cancelled by the owner"
			notifyUserID = rental.TenantID
		}
	}

	notifyUser(notifyUserID, rental.ID, notificationTitle, notificationMessage)

	c.JSON(http.StatusOK, gin.H{
		"message": "Rental status updated successfully",
		"rental":  rental,
	})
}

func GetNotifications(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID not found in context"})
		return
	}

	var notifications []models.Notification
	if err := config.DB.Where("user_id = ?", userID).Order("created_at DESC").Find(&notifications).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch notifications"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"notifications": notifications})
}

func MarkNotificationAsRead(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID not found in context"})
		return
	}

	notificationID := c.Param("id")

	notificationUUID, err := uuid.Parse(notificationID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid notification ID format"})
		return
	}

	var notification models.Notification
	if err := config.DB.Where("id = ? AND user_id = ?", notificationUUID, userID).First(&notification).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Notification not found"})
		return
	}

	if err := config.DB.Model(&notification).Update("is_read", true).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update notification"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Notification marked as read"})
}

func notifyUser(userID uuid.UUID, rentalID uuid.UUID, title string, message string) {
	notification := models.Notification{
		UserID:   userID,
		RentalID: rentalID,
		Title:    title,
		Message:  message,
		IsRead:   false,
		Type:     "rental_update",
	}

	config.DB.Create(&notification)

	notificationData, err := json.Marshal(notification)
	if err != nil {
		return
	}

	err = config.RabbitMQChannel.Publish(
		"",
		"notifications",
		false,
		false,
		amqp.Publishing{
			ContentType: "application/json",
			Body:        notificationData,
		})
	if err != nil {
		return
	}
}

func notifyOwner(ownerID uuid.UUID, rentalID uuid.UUID, title string, message string) {
	notifyUser(ownerID, rentalID, title, message)
}
